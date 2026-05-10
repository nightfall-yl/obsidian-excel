import type { IWorkbookData } from '@univerjs/core';
import { BooleanNumber, LocaleType } from '@univerjs/core';
import { FRONTMATTER_KEY } from './constants';
import { getObsidianLocale } from './setup-univer';

export function parseSheetFile(content: string, filePath?: string): IWorkbookData | undefined {
  const headerRegex = /^---\r?\n([\s\S]*?)\r?\n---\s*/;
  const headerMatch = content.match(headerRegex);
  const restContent = headerMatch ? content.slice(headerMatch[0].length) : content;

  const blockRegex = /```sheet\n([\s\S]*?)```/;
  const blockMatch = restContent.match(blockRegex);

  if (!blockMatch) return undefined;

  try {
    const data = JSON.parse(blockMatch[1]);
    if (data && typeof data === 'object' && filePath) {
      data.name = filePath;
    }
    return data;
  } catch {
    return undefined;
  }
}

export function workbookDataToMarkdown(data: IWorkbookData): string {
  const header = `---\n${FRONTMATTER_KEY}: parsed\n---\n\n`;
  const body = `\`\`\`sheet\n${JSON.stringify(data)}\n\`\`\`\n`;
  return header + body;
}

export function isSheetFile(content: string): boolean {
  return content.includes(`${FRONTMATTER_KEY}:`) || content.includes('```sheet');
}

export function createBlankSheetData(filePath?: string): IWorkbookData {
  return {
    id: filePath || 'new-sheet',
    name: filePath || 'new-sheet',
    sheetOrder: ['sheet-1'],
    sheets: {
      'sheet-1': {
        id: 'sheet-1',
        name: getObsidianLocale() === LocaleType.ZH_CN ? '工作表1' : 'Sheet1',
        tabColor: '',
        hidden: BooleanNumber.FALSE,
        freeze: { xSplit: 0, ySplit: 0, startRow: 0, startColumn: 0 },
        rowCount: 100,
        columnCount: 26,
        cellData: {},
        rowData: [],
        columnData: [],
        mergeData: [],
        defaultRowHeight: 25,
        defaultColumnWidth: 100,
        zoomRatio: 0,
        scrollTop: 0,
        scrollLeft: 0,
        showGridlines: BooleanNumber.TRUE,
        rowHeader: { width: 46, hidden: BooleanNumber.FALSE },
        columnHeader: { height: 20, hidden: BooleanNumber.FALSE },
        rightToLeft: BooleanNumber.FALSE,
      },
    },
    styles: {},
    appVersion: '0.20.0',
    locale: LocaleType.ZH_CN,
  };
}
