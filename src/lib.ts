import { getCollection } from 'astro:content';

// Drafts are hidden everywhere. To preview them locally, run:  $env:SHOW_DRAFTS="true"; npm run dev
const showDrafts = !import.meta.env.PROD && process.env.SHOW_DRAFTS === 'true';
const visible = ({ data }: { data: { draft: boolean } }) => showDrafts || !data.draft;

export async function getPosts() {
  return (await getCollection('blog', visible)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}


export const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
