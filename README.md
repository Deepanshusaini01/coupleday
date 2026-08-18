# Our Story

A private, romantic, single-page website made for one person. No build step, no
framework, no dependencies — just HTML, CSS and vanilla JS, so it's easy to
keep editing for years.

## Quick start

Open `index.html` directly in a browser, or serve it locally so paths/audio
behave exactly like they will once deployed:

```bash
cd our-story
python3 -m http.server 8080
# then open http://localhost:8080
```

## Where to edit things

**`js/content.js` is the only file you should need to touch for content.**
Everything else (layout, animation, interactions) lives in `css/style.css`
and `js/main.js` and doesn't need to change.

| What you want to change | Where |
|---|---|
| Her name, the countdown target date | `siteConfig` at the top of `content.js` |
| Our Story timeline (8 entries) | `timelineData` |
| Reasons I Choose You cards | `reasonsData.core` / `reasonsData.more` |
| Gallery photos, captions, categories | `galleryData` |
| Our Little Escape itinerary (Day 1 / Day 2) | `itineraryData` |
| Bucket list starting items | `bucketListDefaults` (after that, checks/edits/adds are remembered per-device via the browser's local storage — the defaults here only seed a first visit) |
| Open When... envelope messages | `envelopesData` |
| Our Future journey stages | `futureData` |
| The letter itself | directly inside `index.html`, inside `<article class="letter-paper">` in Section 7 — it's long-form prose so it lives as real HTML paragraphs rather than a data array |
| Landing headline / subtitle / final screen text | directly inside `index.html` (Landing section near the top, and the Final section near the bottom) |

## Adding real photos

Drop your images into `assets/images/` and point to them from `content.js`,
e.g.:

```js
{ label: "The Day We First Met", date: "June 14, 2023", story: "...", img: "assets/images/first-meet.jpg" }
```

Leave `img: null` anywhere you haven't got a photo yet — it'll render a soft,
intentional placeholder instead of a broken image icon, so the site always
looks finished even mid-edit.

## Adding your song

The music button works out of the box — until you add a real song it plays a
soft, generated ambient chord instead of nothing. To use your actual song,
drop an MP3 at:

```
assets/audio/our-song.mp3
```

The site automatically prefers that file the moment it exists; no code
changes needed. It never autoplays — she has to press the button.

## Deploying it somewhere she can actually visit

Any static host works, for example:

- **Netlify** — drag the `our-story` folder onto [app.netlify.com/drop](https://app.netlify.com/drop)
- **Vercel** — `vercel deploy` from inside this folder
- **GitHub Pages** — push this folder to a repo and enable Pages on it

Since this is very personal content, consider keeping the deploy private
(password-protected, unlisted, or shared only via a direct link) rather than
publicly indexed — `index.html` already sets `robots: noindex, nofollow` to
discourage search engines from crawling it.

## Notes

- Everything (checked bucket-list items, added items, edits to bucket-list
  text) is stored in the browser's local storage on whatever device she opens
  it on — there's no backend/database.
- Respects `prefers-reduced-motion` — animations simplify automatically for
  anyone with that OS setting on.
