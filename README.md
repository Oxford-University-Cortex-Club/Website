# Oxford University Cortex Club Website

This repository contains the source code and content for the Oxford University Cortex Club website.

The site is hosted using GitHub Pages and is automatically updated whenever changes are merged into the `main` branch.

Live website: https://www.cortexclub.com

---

## Quick start

For routine updates, you usually only need to edit JSON files in:

- `events/`
- `committees/`
- `gallery/`
- `news/`

You do **not** need to understand the whole codebase to add an event, update the committee, or post news. Most content changes are JSON edits plus (sometimes) adding an image under `assets/`.

After editing:

1. Preview locally (see below).
2. Commit and merge into `main`.
3. Wait for GitHub Pages to redeploy the live site.

---

## Previewing locally (for IT officers doing updates)

The site loads JSON dynamically, so opening HTML files directly (`file://`) may not work. Use a local server instead.

**Recommended (Python):**

```bash
python3 server.py
```

Then open: [http://localhost:8000](http://localhost:8000)

`server.py` serves the repository root, disables caching, and opens a browser automatically. Press `Ctrl+C` to stop.

**Alternatives:**

```bash
python3 -m http.server 8000
```

Or see `start-server.html` for short instructions (including a Node.js option).

Always preview content changes locally before pushing to `main`.

---

## Website structure

The website is primarily static HTML/CSS/JavaScript, with most recurring content stored as JSON.

Key folders:

- `events/` — event information
- `committees/` — committee member information
- `gallery/` — gallery metadata
- `news/` — news posts
- `sections/` — page sections
- `assets/` — images, logos, policy documents, etc.
- `utils/` — JavaScript used to load and display site content

---

## Adding a new event

New events are stored as JSON files in:

`events/`

A template is available at:

`events/template.json`

To add a new event:

1. Copy `events/template.json`.
2. Rename the copied file to something descriptive, for example:

   `JohnSmith.json`

3. Fill in the event information using the same structure as existing event files.
4. Add the new event to:

   `events/index.json`

5. Preview locally, then commit and merge into `main`.

Once the changes are on `main`, GitHub Pages will automatically update the live website.

Existing event files can be used as examples if additional formatting is required.

**Archive vs delete:** keep past event JSON files even when they are no longer “featured”. Removing a file from `events/index.json` (or leaving past dates in place) hides it from the current listing without losing the data.

---

## Updating the committee

Committee member information is stored in:

`committees/`

Each committee member has an individual JSON file, while:

`committees/index.json`

controls which members are shown on the website.

To update the committee:

1. Add a new JSON file for each new committee member, using an existing member file as a template.
2. Add the corresponding committee photo to:

   `assets/committee_photos/`

3. Update `committees/index.json` to reflect the current committee.
4. Remove previous members from the **index only** — do not delete their JSON files or photos unless you are sure they should be discarded.

Previous committee JSON files and photos should normally be retained so a future historical archive can be built without reconstructing lost information.

---

## Updating the gallery

Gallery metadata is stored in:

`gallery/`

Gallery images currently sit within:

`assets/gallery/`

At the current scale of the website, storing a small number of images directly in the repository is sufficient.

If the gallery expands substantially in future — for example to include:

- photos from society events
- past committee photographs
- speaker photographs
- symposium/event archives

it would be worth moving larger image collections to an external image hosting/CDN service such as **Cloudinary** rather than storing all media directly in the GitHub repository.

This would make it easier to manage large numbers of images and reduce the amount of media stored directly in Git.

---

## Image guidelines

Follow these even while images remain in the repository — they reduce repo size and keep pages fast:

- Avoid uploading raw 10–20 MB phone photos.
- Resize and compress images before committing (aim for roughly under ~500 KB for portraits; under ~1–2 MB for larger gallery photos where possible).
- Prefer JPEG or WebP for photographs; SVG or PNG for logos and graphics with text/transparency.
- Use descriptive filenames (e.g. `Victor Chan.jpg`).
- Where new HTML is written for image-heavy pages, prefer `loading="lazy"` on below-the-fold images.

Good compression can delay the need for Cloudinary or similar for a long time.

---

## Archive vs delete

Default rule: **retain JSON (and photos) even if they are no longer shown.**

| Content | How to hide from the live site | What to keep |
|---------|--------------------------------|--------------|
| Past committee members | Remove from `committees/index.json` | Keep JSON + photos in the repo |
| Past events | Leave dated files in `events/` (past dates sort to “past”) | Keep JSON files |
| Old news | Leave files in `news/json/` | Keep JSON (and related HTML if any) |

Only delete files if content is wrong, duplicated, or contains material that must not remain public. Prefer archival retention so future committees can rebuild history pages later.

---

## Policy document

The current policy document is stored at:

`assets/policy/OUCC Policy for Membership, Attendance, and Governance.pdf`

The version currently on the website was written alongside the membership scheme introduced during the 2025–26 committee.

Future committees should review whether the membership model and associated policy remain appropriate for the club.

The current committee may:

- retain the existing policy;
- amend it;
- replace it with an earlier policy framework; or
- develop a new policy reflecting the club's current structure.

The intention is simply that the policy should be reviewed as committee structures and membership arrangements evolve.

---

## Deployment

The live website is deployed through GitHub Pages.

Publishing source:

`main` branch → repository root

Changes merged into `main` will automatically trigger a new GitHub Pages deployment.

The custom domain is:

`www.cortexclub.com`

The domain itself is managed through Namecheap.

---

## Recommended workflow

For larger changes:

1. Create a new branch.
2. Make and test changes locally (`python3 server.py`).
3. Open a Pull Request.
4. Review the changes.
5. Merge into `main`.

For small content updates, direct edits may also be made through GitHub if appropriate.

The `main` branch should always be treated as the live version of the website.

---

## Do not break these things

Avoid casual changes to infrastructure. In particular:

- **Do not delete `CNAME`** — this file maps the site to `www.cortexclub.com`.
- **Do not casually change GitHub Pages settings** (source branch, custom domain, HTTPS) unless you know why.
- **Do not alter Namecheap DNS** unless you understand the records required for the custom domain.
- **Do not rename major folders** (`events/`, `committees/`, `assets/`, `utils/`, `sections/`, `news/`, `gallery/`) without updating all references in HTML/JS.
- **Do not force-push to `main`** or rewrite history on the live branch.

If something about hosting or DNS looks broken, stop and check with someone who has previously managed the domain/GitHub Pages setup.

---

## Access and ownership

The repository is owned by the GitHub organization:

`Oxford-University-Cortex-Club`

Access expectations:

- At least **two** current committee members should retain **Owner** access to the GitHub organization.
- At least **two** people should have access to the **Namecheap** account that manages `cortexclub.com`.
- Prefer the **club email** as the contact/recovery email for GitHub org, domain registrar, and related services, rather than an individual’s personal account.

Account credentials for external services (domain registrar, email, analytics, etc.) should be transferred between committees and stored securely. Single-person ownership of critical accounts is a risk — avoid it.

---

## Future suggestions

A few areas future committees may wish to develop further:

### 1. Historical committee archive

The existing structure could easily be extended to show previous Cortex Club committees rather than only the current committee. Retaining past member JSON/photos makes this straightforward.

### 2. Speaker archive

Past speakers could be turned into a searchable or browsable archive using the existing event data.

### 3. Expanded media galleries

If event photography becomes a larger part of the site, consider using an external image service such as Cloudinary for scalable image storage and delivery.

### 4. Policy and membership structure

The current governance policy reflects the membership model used during the 2025–26 committee. Future committees should review this periodically and adapt it as appropriate.
