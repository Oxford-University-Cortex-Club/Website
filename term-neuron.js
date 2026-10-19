/* ===== This Term: animated neuron (homepage) =====
 *
 * EACH TERM: change week1Sunday below to the Sunday that starts Week 1. That's all.
 * The term's name (e.g. "Michaelmas Term 2026", "MT26") is worked out from that date.
 *
 * Events come straight from the events/ folder (whatever is listed in events/index.json).
 * Any event dated between Week 0 and the end of Week 8 appears on the neuron,
 * on the right week, automatically. Events outside term (e.g. summer socials) are simply
 * left off the neuron; they still appear on the Events page and in Upcoming Events.
 * Talks grey out once they've happened. After term ends the neuron stays up (in colour, still
 * animated) with every talk greyed, until week1Sunday is updated for the next term.
 *
 * Optional fields in an event's JSON file control the neuron's label:
 *   "speaker": "Prof. Jane Smith (Oxford)"      -> bold line (defaults to the event title)
 *   "topic":   "Memory and sleep"               -> small line (defaults to the description)
 */
const TERM = {
    week1Sunday: '2026-10-11',  // the Sunday that starts Week 1  <-- update each term
    weeks: 8
};

(async function () {
    const root = document.getElementById('term-neuron');
    if (!root) return;
    const EVENTS_FOLDER = 'events/';
    const EVENTS_PAGE = 'sections/events.html';

    const NS = 'http://www.w3.org/2000/svg';
    const W = 1200, H = 600;
    const CARD_W = 270;
    const SOMA = { x: 170, y: 300 };
    const AXON_D = 'M 214 300 C 360 345, 520 345, 700 300 S 930 250 1030 280';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Deterministic randomness so the neuron looks the same on every visit
    let seed = 7;
    const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

    function svgEl(tag, attrs, parent) {
        const n = document.createElementNS(NS, tag);
        for (const k in attrs) n.setAttribute(k, attrs[k]);
        if (parent) parent.appendChild(n);
        return n;
    }

    // ---- Dates and weeks ----
    const DAY = 86400000;
    const parseDate = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
    const week1 = parseDate(TERM.week1Sunday);
    // Calendar-day maths (safe across the October/March clock changes)
    const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
    const daysBetween = (a, b) => Math.round((b - a) / DAY);
    const weekOf = d => Math.max(0, Math.min(TERM.weeks, Math.floor(daysBetween(week1, d) / 7) + 1));
    const today = new Date(); today.setHours(0, 0, 0, 0);

    const termStart = addDays(week1, -7);                 // start of Week 0
    const termEnd = addDays(week1, TERM.weeks * 7);       // day after the last week ends

    // Term name from the date: Oct-Dec Michaelmas, Jan-Feb Hilary, Mar-Jul Trinity
    const m = week1.getMonth(), yr = week1.getFullYear();
    const [termWord, termCode] = m >= 8 ? ['Michaelmas', 'MT'] : m <= 1 ? ['Hilary', 'HT'] : ['Trinity', 'TT'];
    const termName = `${termWord} Term ${yr}`, termShort = `${termCode}${String(yr).slice(2)}`;
    let loaded = [];
    try {
        const index = await (await fetch(EVENTS_FOLDER + 'index.json', { cache: 'no-cache' })).json();
        loaded = (await Promise.all(index.events.map(f =>
            fetch(EVENTS_FOLDER + f).then(r => r.json()).catch(() => null)))).filter(Boolean);
    } catch (err) {
        console.error('This Term: could not load events', err);
    }
    const shorten = t => t.length > 90 ? t.slice(0, 87).replace(/\s+\S*$/, '') + '…' : t;
    const events = loaded
        .filter(e => e && e.date)
        .map(e => ({
            d: parseDate(e.date),
            title: e.speaker || e.title.replace(/^CorTalk:\s*/i, ''),
            sub: e.topic || shorten(e.description || '')
        }))
        .filter(e => e.d >= termStart && e.d < termEnd)
        .sort((a, b) => a.d - b.d)
        .map(e => ({ ...e, week: weekOf(e.d), past: e.d < today }));

    // No events in this term at all (e.g. a brand-new term with nothing added yet): hide the section
    if (!events.length) {
        const section = root.closest('section');
        (section || root).style.display = 'none';
        return;
    }
    const next = events.find(e => !e.past);
    const fmt = d => `${d.getDate()}/${d.getMonth() + 1}`;

    // One card per week; several events in the same week stack inside it
    function cardHTML(list) {
        return (list.includes(next) ? '<span class="tn-tag">NEXT</span>' : '') + list.map(e =>
            `<div class="tn-entry${e.past ? ' past' : ''}"><span class="tn-date">${fmt(e.d)}</span>: ` +
            `<span class="tn-title">${e.title}</span><div class="tn-sub">${e.sub}</div></div>`).join('');
    }

    // ---- Term info line (+ replay button on wide screens) ----
    const head = document.createElement('div');
    head.className = 'tn-head';
    head.innerHTML = `<p class="tn-term"><strong>${termShort}</strong></p>`;
    root.appendChild(head);

    // ---- Build the wide (SVG) layout ----
    const stage = document.createElement('div');
    stage.className = 'tn-stage';
    root.appendChild(stage);
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMin meet', role: 'img', 'aria-label': `${termName} term card: a neuron whose myelin segments are the weeks of term` }, stage);
    const gConn = svgEl('g', {}, svg);
    const gBody = svgEl('g', {}, svg);
    const gSegs = svgEl('g', {}, svg);

    const bounds = { top: SOMA.y - 60, bottom: SOMA.y + 60 };
    function branch(x, y, ang, len, w, depth, delay, leaves) {
        const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
        bounds.top = Math.min(bounds.top, ey - w); bounds.bottom = Math.max(bounds.bottom, ey + w);
        const bend = (rand() - 0.5) * len * 0.5;
        const cx = (x + ex) / 2 - Math.sin(ang) * bend, cy = (y + ey) / 2 + Math.cos(ang) * bend;
        svgEl('path', { d: `M ${x} ${y} Q ${cx} ${cy} ${ex} ${ey}`, class: 'tn-line tn-draw', 'stroke-width': w, pathLength: 1, style: `--d:${delay}s` }, gBody);
        if (depth > 0) {
            const spread = 0.35 + rand() * 0.3;
            branch(ex, ey, ang - spread, len * 0.7, w * 0.62, depth - 1, delay + 0.25, leaves);
            branch(ex, ey, ang + spread, len * 0.7, w * 0.62, depth - 1, delay + 0.25, leaves);
        } else if (leaves) {
            leaves.push([ex, ey]);
        }
    }

    // Dendrites around the soma
    for (let k = 0; k < 7; k++) {
        const ang = Math.PI + (k - 3) * 0.37 + (rand() - 0.5) * 0.2;
        branch(SOMA.x, SOMA.y, ang, 52 + rand() * 10, 11, 3, 0);
    }
    svgEl('ellipse', { cx: SOMA.x, cy: SOMA.y, rx: 58, ry: 50, class: 'tn-soma' }, gBody);

    // Axon
    const axon = svgEl('path', { d: AXON_D, class: 'tn-line tn-draw', 'stroke-width': 10, pathLength: 1, style: '--d:0.35s' }, gBody);
    const axonLen = axon.getTotalLength();
    const end = axon.getPointAtLength(axonLen);

    // Axon terminals
    const boutons = [];
    for (let k = 0; k < 3; k++) {
        const leaves = [];
        branch(end.x, end.y, (k - 1) * 0.6, 44, 8, 2, 0.9, leaves);
        leaves.forEach(([x, y]) => boutons.push(svgEl('circle', { cx: x, cy: y, r: 6, class: 'tn-bouton', style: '--d:1.4s' }, gBody)));
    }

    // Week segments: WK0 sits on the soma, WK1..WKn are myelin along the axon
    const segs = [];
    for (let w = 0; w <= TERM.weeks; w++) {
        let x, y, rot, at;
        if (w === 0) {
            x = SOMA.x; y = SOMA.y; rot = -18; at = null;
        } else {
            at = axonLen * (0.07 + (w - 1) * (0.86 / (TERM.weeks - 1)));
            const p = axon.getPointAtLength(at), q = axon.getPointAtLength(Math.min(axonLen, at + 1));
            x = p.x; y = p.y; rot = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI;
        }
        const g = svgEl('g', { transform: `translate(${x} ${y}) rotate(${rot})`, class: 'tn-seg', style: `--d:${0.05 * w}s`, 'data-week': w }, gSegs);
        const body = svgEl('g', { class: 'tn-seg-body' }, g);
        if (w === 0) svgEl('ellipse', { cx: 0, cy: 0, rx: 42, ry: 23 }, body);
        else svgEl('rect', { x: -39, y: -17, width: 78, height: 34, rx: 13 }, body);
        svgEl('text', { x: 0, y: 1 }, body).textContent = `WK ${w}`;
        segs.push({ w, x, y, at, g });
    }
    const pulse = svgEl('circle', { r: 11, class: 'tn-pulse' }, svg);

    // Cards: one per week that has events. They rotate through four rows
    // (above-near, below-near, above-far, below-far), so cards sharing a row are
    // always 4+ weeks apart and can never overlap; every connector runs in a gap.
    const ROWS = ['aN', 'bN', 'aF', 'bF'];
    const NEAR = { above: 232, below: 368 }, ROW_GAP = 22;
    const cards = [];
    segs.filter(sg => events.some(e => e.week === sg.w)).forEach((sg, j) => {
        const list = events.filter(e => e.week === sg.w);
        const row = ROWS[j % 4], side = row[0] === 'a' ? 'above' : 'below';
        const cx = Math.max(CARD_W / 2 + 4, Math.min(W - CARD_W / 2 - 4, sg.x));
        const a = document.createElement('a');
        a.href = EVENTS_PAGE;
        a.className = `tn-card ${side}${list.every(e => e.past) ? ' past' : ''}`;
        a.innerHTML = cardHTML(list);
        stage.appendChild(a);
        const conn = svgEl('path', { class: 'tn-conn', pathLength: 1 }, gConn);
        const from = sg.w === 0 ? (side === 'above' ? sg.y - 50 : sg.y + 50) : (side === 'above' ? sg.y - 20 : sg.y + 20);
        cards.push({ a, conn, row, side, cx, from, sg });
        sg.g.classList.add('has-event');
        sg.events = list;
        list.forEach(e => { e.card = a; e.conn = conn; e.seg = sg; });
    });

    // Positions depend on the cards' real heights, so lay out on load and on resize
    function layout() {
        const scale = stage.clientWidth / W;
        if (!scale) return;
        const h = {}, maxH = { aN: 0, bN: 0, aF: 0, bF: 0 };
        cards.forEach(c => {
            c.a.style.width = `${CARD_W * scale}px`;
            c.h = c.a.offsetHeight / scale;
            maxH[c.row] = Math.max(maxH[c.row], c.h);
        });
        const edge = {
            aN: NEAR.above, bN: NEAR.below,
            aF: NEAR.above - maxH.aN - ROW_GAP, bF: NEAR.below + maxH.bN + ROW_GAP
        };
        let minY = bounds.top - 10, maxY = bounds.bottom + 10;
        cards.forEach(c => {
            c.top = c.side === 'above' ? edge[c.row] - c.h : edge[c.row];
            minY = Math.min(minY, c.top - 14);
            maxY = Math.max(maxY, c.top + c.h + 4);
            c.conn.setAttribute('d', `M ${c.sg.x} ${c.from} L ${c.sg.x} ${edge[c.row]}`);
        });
        svg.setAttribute('viewBox', `0 ${minY} ${W} ${maxY - minY}`);
        cards.forEach(c => {
            c.a.style.left = `${(c.cx - CARD_W / 2) * scale}px`;
            c.a.style.top = `${(c.top - minY) * scale}px`;
        });
    }
    new ResizeObserver(layout).observe(stage);

    // ---- Narrow-screen (vertical) layout ----
    const list = document.createElement('ol');
    list.className = 'tn-list';
    for (let w = 0; w <= TERM.weeks; w++) {
        const li = document.createElement('li');
        const wkEvents = events.filter(e => e.week === w);
        li.className = `tn-row${w === 0 ? ' soma' : ''}${wkEvents.length ? ' has-event' : ''}`;
        li.innerHTML = `<span class="tn-pill">WK ${w}</span>`;
        const stack = document.createElement('div');
        stack.className = 'tn-stack';
        li.appendChild(stack);
        wkEvents.forEach(e => {
            const a = document.createElement('a');
            a.href = EVENTS_PAGE;
            a.className = `tn-card${e.past ? ' past' : ''}`;
            a.innerHTML = cardHTML([e]);
            stack.appendChild(a);
        });
        list.appendChild(li);
    }
    root.appendChild(list);

    // ---- Animation ----
    const replay = document.createElement('button');
    replay.className = 'tn-replay';
    replay.type = 'button';
    replay.textContent = 'Replay ↻';
    head.appendChild(replay);

    let timers = [], running = false, done = false;
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    function light(s) {
        s.g.classList.add('lit');
        (s.events || []).forEach(e => { e.card.classList.add('show'); e.conn.classList.add('show'); });
    }

    function finish() {
        segs.forEach(light);
        boutons.forEach(b => b.classList.add('fire'));
        if (next) next.seg.g.classList.add('next');
        pulse.classList.remove('on');
        running = false; done = true;
    }

    function reset() {
        timers.forEach(clearTimeout); timers = [];
        root.classList.remove('drawn', 'segs', 'focus');
        segs.forEach(s => s.g.classList.remove('lit', 'next', 'active'));
        boutons.forEach(b => b.classList.remove('fire'));
        events.forEach(e => { e.card.classList.remove('show', 'active'); e.conn.classList.remove('show', 'active'); });
        pulse.classList.remove('on');
        done = false;
    }

    function movePulse(fromLen, toLen, ms, cb) {
        const t0 = performance.now();
        (function step(now) {
            if (!running) return;
            const t = Math.min(1, (now - t0) / ms);
            const p = axon.getPointAtLength(fromLen + (toLen - fromLen) * ease(t));
            pulse.setAttribute('cx', p.x); pulse.setAttribute('cy', p.y);
            if (t < 1) requestAnimationFrame(step); else cb();
        })(t0);
    }

    function run() {
        reset();
        if (reduced) { root.classList.add('drawn', 'segs'); finish(); return; }
        running = true;
        void root.offsetWidth; // restart CSS transitions
        root.classList.add('drawn');
        later(() => root.classList.add('segs'), 1300);
        later(() => {
            // Action potential: fires at the soma, then jumps node to node (saltatory conduction)
            pulse.setAttribute('cx', SOMA.x); pulse.setAttribute('cy', SOMA.y);
            pulse.classList.add('on');
            light(segs[0]);
            let i = 1, pos = 0;
            const hop = () => {
                if (!running) return;
                if (i > TERM.weeks) {
                    movePulse(pos, axonLen, 260, () => { boutons.forEach(b => b.classList.add('fire')); later(finish, 250); });
                    return;
                }
                const s = segs[i];
                movePulse(pos, s.at, 230, () => { light(s); pos = s.at; i++; later(hop, s.events ? 260 : 90); });
            };
            later(() => { pulse.setAttribute('cx', 214); pulse.setAttribute('cy', 300); hop(); }, 450);
        }, 1900);
    }

    replay.addEventListener('click', run);

    // Hover / tap: highlight a week's event(s)
    function focusWeek(s, on) {
        if (!done || !s.events) return;
        root.classList.toggle('focus', on);
        s.g.classList.toggle('active', on);
        s.events.forEach(e => { e.card.classList.toggle('active', on); e.conn.classList.toggle('active', on); });
    }
    segs.forEach(s => {
        s.g.addEventListener('mouseenter', () => focusWeek(s, true));
        s.g.addEventListener('mouseleave', () => focusWeek(s, false));
        s.g.addEventListener('click', () => focusWeek(s, !s.g.classList.contains('active')));
    });
    cards.forEach(c => {
        c.a.addEventListener('mouseenter', () => focusWeek(c.sg, true));
        c.a.addEventListener('mouseleave', () => focusWeek(c.sg, false));
    });

    // Start when scrolled into view
    const startObs = new IntersectionObserver(entries => {
        if (entries.some(en => en.isIntersecting) && stage.offsetParent) { run(); startObs.disconnect(); }
    }, { threshold: 0.35 });
    startObs.observe(stage);

    // Vertical layout: each week lights as it scrolls into view
    const rowObs = new IntersectionObserver(entries => {
        entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); rowObs.unobserve(en.target); } });
    }, { threshold: 0.6 });
    list.querySelectorAll('.tn-row').forEach(li => rowObs.observe(li));
})();
