import yaml from "js-yaml";

const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;

export function splitFrontmatter(content: string): [unknown, string] {
  const match = content.match(frontmatterRegex);

  if (!match) {
    return [undefined, content];
  }
  const frontmatter = match[1];
  const rest = match[2].trim();

  return [yaml.load(frontmatter), rest];
}
