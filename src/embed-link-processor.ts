import type { Plugin, TFile } from 'obsidian';
import { parseSheetFile } from './data-utils';

interface EmbedLinkParseResult {
  filePath: string;
  sheetName: string;
  startCell: string;
  endCell: string;
  displayType: string;
}

function parseEmbedLinkSyntax(syntax: string): EmbedLinkParseResult {
  const parts = syntax.split('|');
  const pathPart = parts[0] || '';
  const altPart = parts.slice(1).join('|');

  const hashIndex = pathPart.indexOf('#');
  const filePath = hashIndex >= 0 ? pathPart.slice(0, hashIndex) : pathPart;
  const afterHash = hashIndex >= 0 ? pathPart.slice(hashIndex + 1) : '';

  let sheetName = '';
  let rangeStr = '';

  const colonIndex = afterHash.indexOf(':');
  if (afterHash.includes('|')) {
    const pipeIdx = afterHash.indexOf('|');
    sheetName = afterHash.slice(0, pipeIdx);
    rangeStr = afterHash.slice(pipeIdx + 1);
  } else if (colonIndex >= 0 && /^[A-Z]/.test(afterHash)) {
    const match = afterHash.match(/^([A-Z]+\d+):([A-Z]+\d+)$/);
    if (match) {
      rangeStr = afterHash;
    } else {
      sheetName = afterHash;
    }
  } else {
    sheetName = afterHash;
  }

  let startCell = '';
  let endCell = '';
  if (rangeStr.includes(':')) {
    const [s, e] = rangeStr.split(':');
    startCell = s || '';
    endCell = e || '';
  } else if (rangeStr) {
    startCell = rangeStr;
  }

  let displayType = 'table';
  if (altPart.includes('{html}')) {
    displayType = 'html';
  } else if (altPart.includes('{image}')) {
    displayType = 'image';
  }

  return { filePath, sheetName, startCell, endCell, displayType };
}

function cellRefToIndex(ref: string): { row: number; col: number } | null {
  const match = ref.match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;

  let col = 0;
  for (let i = 0; i < match[1].length; i++) {
    col = col * 26 + (match[1].charCodeAt(i) - 64);
  }
  return { row: parseInt(match[2]) - 1, col: col - 1 };
}

function getCellValue(cell: any): string {
  if (!cell) return '';
  if (cell.v !== undefined && cell.v !== null) return String(cell.v);
  if (cell.p?.body?.dataStream) {
    return cell.p.body.dataStream.replace(/\r?\n$/, '').replace(/\n/g, ' ');
  }
  return '';
}

function renderCellDataAsTable(
  cellData: Record<string, Record<string, any>>,
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number,
): HTMLTableElement {
  const table = document.createElement('table');
  table.className = 'sheet-free-embed-table';

  for (let r = startRow; r <= endRow; r++) {
    const tr = document.createElement('tr');
    for (let c = startCol; c <= endCol; c++) {
      const cell = cellData?.[r]?.[c];
      const value = getCellValue(cell);
      const td = document.createElement(r === startRow ? 'th' : 'td');
      td.textContent = value;
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }

  return table;
}

export function registerEmbedLinkProcessor(plugin: Plugin): void {
  plugin.registerMarkdownCodeBlockProcessor('sheet-embed', async (source, el) => {
    el.createEl('p', { text: 'Sheet embed block', cls: 'sheet-free-embed-placeholder' });
  });

  const processor = async (el: HTMLElement, ctx: any) => {
    const internalEmbeds = el.querySelectorAll('.internal-embed');

    for (const embedEl of Array.from(internalEmbeds)) {
      const src = embedEl.getAttribute('src') || '';
      const alt = embedEl.getAttribute('alt') || '';

      if (!isSheetEmbed(src, alt, plugin)) continue;

      const targetFile = resolveSheetFile(src, plugin);
      if (!targetFile) continue;

      try {
        const content = await plugin.app.vault.read(targetFile);
        const workbookData = parseSheetFile(content, targetFile.path);
        if (!workbookData) continue;

        const parseResult = parseEmbedLinkSyntax(`${src}|${alt}`);
        const sheetData = findSheet(workbookData, parseResult.sheetName);
        if (!sheetData?.cellData) continue;

        const container = document.createElement('div');
        container.className = 'sheet-free-embed-container';

        const fileLabel = container.createDiv({ cls: 'sheet-free-embed-file-label' });
        fileLabel.textContent = targetFile.basename;
        fileLabel.addEventListener('click', () => {
          plugin.app.workspace.openLinkText(targetFile.path, '', 'split');
        });

        let startRow = 0;
        let startCol = 0;
        let endRow = Math.min(9, (sheetData.rowCount || 100) - 1);
        let endCol = Math.min(5, (sheetData.columnCount || 26) - 1);

        if (parseResult.startCell) {
          const startIdx = cellRefToIndex(parseResult.startCell);
          if (startIdx) {
            startRow = startIdx.row;
            startCol = startIdx.col;
          }
        }
        if (parseResult.endCell) {
          const endIdx = cellRefToIndex(parseResult.endCell);
          if (endIdx) {
            endRow = endIdx.row;
            endCol = endIdx.col;
          }
        }

        const table = renderCellDataAsTable(sheetData.cellData, startRow, startCol, endRow, endCol);
        container.appendChild(table);

        embedEl.replaceWith(container);
      } catch (e) {
        console.error('SheetFree: embed link render error:', e);
      }
    }
  };

  plugin.registerMarkdownPostProcessor(processor);
}

function isSheetEmbed(src: string, alt: string, plugin: Plugin): boolean {
  const filePath = src.split('#')[0];
  if (!filePath) return false;

  if (filePath.endsWith('.sheet.md') || filePath.endsWith('.sheet')) return true;

  const file = resolveSheetFile(src, plugin);
  return !!file;
}

function resolveSheetFile(src: string, plugin: Plugin): TFile | null {
  const filePath = src.split('#')[0];
  if (!filePath) return null;

  const directFile = plugin.app.vault.getAbstractFileByPath(filePath);
  if (directFile instanceof TFile) return directFile;

  const mdPath = filePath.endsWith('.md') ? filePath : `${filePath}.md`;
  const mdFile = plugin.app.vault.getAbstractFileByPath(mdPath);
  if (mdFile instanceof TFile) {
    const cache = plugin.app.metadataCache.getFileCache(mdFile);
    if (cache?.frontmatter && cache.frontmatter['obsidian-excel']) {
      return mdFile;
    }
  }

  const sheetMdPath = filePath.endsWith('.sheet.md') ? filePath : `${filePath}.sheet.md`;
  const sheetMdFile = plugin.app.vault.getAbstractFileByPath(sheetMdPath);
  if (sheetMdFile instanceof TFile) return sheetMdFile;

  return null;
}

function findSheet(workbookData: any, sheetName: string): any {
  if (!workbookData.sheets) return null;
  if (!sheetName) {
    const firstSheetId = workbookData.sheetOrder?.[0];
    return firstSheetId ? workbookData.sheets[firstSheetId] : null;
  }

  for (const sheetId of Object.keys(workbookData.sheets)) {
    if (workbookData.sheets[sheetId].name === sheetName) {
      return workbookData.sheets[sheetId];
    }
  }

  const firstSheetId = workbookData.sheetOrder?.[0];
  return firstSheetId ? workbookData.sheets[firstSheetId] : null;
}
