---
title: "Convergent Blue (this site)"
summary: "Rebuilding a 2013 WordPress blog from a cPanel backup into a static site."
date: 2026-10-09
tags: [web, astro]
link: https://github.com/dawdawdo/convergentblue
---

The old blog lived in a WordPress database inside a 1 GB cPanel backup from 2013. The rebuild pulled the posts out of the SQL dump, converted them to Markdown, re-rendered the old `$latex` math with KaTeX, and published everything as a static Astro site on Cloudflare Pages.

Adding a post now means adding one Markdown file and pushing to GitHub.
