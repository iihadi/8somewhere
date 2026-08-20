# Photos

One folder per review, named exactly like the review's `slug` in
`data/reviews.ts`. For example:

```
public/photos/septime/00-cover.jpg
public/photos/septime/01-fish.jpg
public/photos/septime/02-room.jpg
```

Then run:

```
npm run photos
```

which regenerates `data/photos.json`. Any review without a folder falls
back to a generated gradient tile, so the site always looks finished.

**Export tips (Google Photos):** select the album → ⋮ → Download.
Resize anything over ~2500px wide before committing; Vercel's free tier
has a 1 GB repo soft limit and large JPEGs eat it fast.
