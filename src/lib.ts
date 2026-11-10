import { getCollection } from 'astro:content';

// Drafts are hidden everywhere. To preview them locally, run:  $env:SHOW_DRAFTS="true"; npm run dev
const showDrafts = !import.meta.env.PROD && process.env.SHOW_DRAFTS === 'true';
const visible = ({ data }: { data: { draft: boolean } }) => showDrafts || !data.draft;

export async function getPosts() {
  return (await getCollection('blog', visible)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}


// Minutes to read, from the raw markdown (about 230 words a minute).
export const readingTime = (post: { body?: string }) =>
  Math.max(1, Math.round((post.body?.split(/\s+/).length ?? 0) / 230));

// "Keep reading": the posts sharing the most tags with this one; ties go to the nearest in time.
export function relatedPosts<T extends { id: string; data: { tags: string[]; pubDate: Date } }>(post: T, posts: T[], n = 3) {
  const score = (p: T) => p.data.tags.filter((t) => t !== 'project' && post.data.tags.includes(t)).length * 2
    + (p.data.tags.includes('project') && post.data.tags.includes('project') ? 1 : 0);
  const gap = (p: T) => Math.abs(p.data.pubDate.valueOf() - post.data.pubDate.valueOf());
  return posts.filter((p) => p.id !== post.id).sort((a, b) => score(b) - score(a) || gap(a) - gap(b)).slice(0, n);
}

// Every tag with its post count: 'project' first, then most used.
export function tagCounts(posts: { data: { tags: string[] } }[]) {
  const counts = new Map<string, number>();
  for (const p of posts) for (const t of p.data.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts].sort((a, b) => +(b[0] === 'project') - +(a[0] === 'project') || b[1] - a[1] || a[0].localeCompare(b[0]));
}

export const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });

// Thumbnail for a post: the `cover` front matter if set, otherwise the first image in the post body.
export function coverOf(post: { data: { cover?: string }; body?: string }) {
  if (post.data.cover) return post.data.cover;
  const m = post.body?.match(/!\[[^\]]*\]\((\/images\/[^)\s"]+)/) ?? post.body?.match(/<img[^>]+src="(\/images\/[^"]+)"/);
  return m?.[1];
}
