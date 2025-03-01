import * as z from "@disco/parz";
import yaml from "js-yaml";

const frontmatterRegex = /^---\n([\s\S]+?)\n---/;

const recordParser = z.record(z.string(), z.string());

export function extractFrontmatter(content: string): Record<string, string> {
  const match = content.match(frontmatterRegex);

  if (!match) {
    return {};
  }

  try {
    return recordParser.parse(yaml.load(match[1]));
  } catch (error) {
    console.error("Error parsing YAML frontmatter:", error);
    return {};
  }
}

export function removeFrontmatter(content: string): string {
  return content.replace(frontmatterRegex, "");
}
