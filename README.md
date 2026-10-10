# Convergent Blue

Source for [convergentblue.com](https://convergentblue.com), built with [Astro](https://astro.build) and deployed by Cloudflare Pages on every push to `main`.

## Run it locally

```
npm install      # first time only
npm run dev      # http://localhost:4321 (drafts are visible here)
```

## Write a post

Create `src/content/blog/my-post-slug.md`:

```md
---
title: "My post"
description: "One sentence for the post list and search results."
pubDate: 2026-10-10
tags: [probability, games]
draft: true          # remove (or set false) to publish
---

Text here. Inline math: $x^2$. Display math:

$$\sum_{n=1}^\infty \frac{1}{2^n} = 1$$

![alt text](/images/2026/10/picture.png)
```

- Images go in `public/images/...` and are referenced from `/images/...`.
- `##` headings become the post's table of contents (when there are 3 or more).
- Tags create pages under `/tags/` automatically. The blog index, RSS feed, and sitemap update themselves.

## Add a project

Create `src/content/projects/my-project.md` with `title`, `summary`, `date`, `tags`, and an optional `link` and `image`.

## Publish

Commit and push. Cloudflare rebuilds the site in about a minute.

## Legacy posts

`scripts/import_legacy.py` is the one-time script that converted the 2012–13 WordPress posts. You don't need it again.
