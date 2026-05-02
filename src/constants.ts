export const VIEW_TYPE_SHEET = 'sheet-free-view';
export const FRONTMATTER_KEY = 'sheet-free-plugin';
export const FRONTMATTER = ['---', '', `${FRONTMATTER_KEY}: parsed`, '', '---', '', ''].join('\n');
export const DEFAULT_CONTENT = ['```sheet', '{}', '```'].join('\n');
export const BLANK_CONTENT = `${FRONTMATTER}\n${DEFAULT_CONTENT}`;
