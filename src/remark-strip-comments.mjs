// Drop HTML comments (<!-- notes -->) from Markdown so drafting notes never reach the published page.
export default function remarkStripComments() {
  const isComment = (n) => n.type === 'html' && /^\s*<!--[\s\S]*?-->\s*$/.test(n.value);
  const walk = (node) => {
    if (!node.children) return;
    node.children = node.children.filter((c) => !isComment(c));
    node.children.forEach(walk);
  };
  return (tree) => walk(tree);
}
