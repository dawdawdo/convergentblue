import { getCollection } from 'astro:content';

// Drafts show up in `npm run dev` (with a badge) but never in the built site.
const visible = ({ data }: { data: { draft: boolean } }) => !import.meta.env.PROD || !data.draft;

export async function getPosts() {
  return (await getCollection('blog', visible)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

export async function getProjects() {
  return (await getCollection('projects', visible)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
}

export const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
