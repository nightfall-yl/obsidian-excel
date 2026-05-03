export const VIEW_TYPE_SHEET = 'excel-view';
export const FRONTMATTER_KEY = 'obsidian-excel';
export const FRONTMATTER = ['---', '', `${FRONTMATTER_KEY}: parsed`, '', '---', '', ''].join('\n');
export const DEFAULT_CONTENT = ['```sheet', '{}', '```'].join('\n');
export const BLANK_CONTENT = `${FRONTMATTER}\n${DEFAULT_CONTENT}`;
