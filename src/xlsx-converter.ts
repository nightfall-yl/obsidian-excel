import type { IWorkbookData, ICellData, IRange, IStyleData } from '@univerjs/core';
import { BooleanNumber, CellValueType, LocaleType } from '@univerjs/core';
import * as XLSX from 'xlsx';

function generateStyleId(styles: Record<string, IStyleData>, style: IStyleData): string {
  const key = JSON.stringify(style);
  for (const [id, s] of Object.entries(styles)) {
    if (JSON.stringify(s) === key) return id;
  }
  const newId = `s${Object.keys(styles).length}`;
  styles[newId] = style;
  return newId;
}

function createSheetData(
  id: string,
  name: string,
  cellData: Record<number, Record<number, ICellData>>,
  mergeData: IRange[],
  rowCount: number,
  columnCount: number,
  rowData: any[],
  columnData: any[],
) {
  return {
    id,
    name,
    tabColor: '',
    hidden: BooleanNumber.FALSE,
    freeze: { xSplit: 0, ySplit: 0, startRow: 0, startColumn: 0 },
    rowCount,
    columnCount,
    cellData,
    rowData,
    columnData,
    mergeData,
    defaultRowHeight: 25,
    defaultColumnWidth: 100,
    zoomRatio: 0,
    scrollTop: 0,
    scrollLeft: 0,
    showGridlines: BooleanNumber.TRUE,
    rowHeader: { width: 46, hidden: BooleanNumber.FALSE },
    columnHeader: { height: 20, hidden: BooleanNumber.FALSE },
    rightToLeft: BooleanNumber.FALSE,
  };
}

export function xlsxToWorkbookData(buffer: ArrayBuffer, fileName: string): IWorkbookData {
  const workbook = XLSX.read(buffer, { type: 'array', cellStyles: true, cellDates: true });
  const sheets: IWorkbookData['sheets'] = {};
  const sheetOrder: string[] = [];
  const styles: Record<string, IStyleData> = {};

  for (let i = 0; i < workbook.SheetNames.length; i++) {
    const sheetName = workbook.SheetNames[i];
    const ws = workbook.Sheets[sheetName];
    const sheetId = `sheet-${i + 1}`;
    sheetOrder.push(sheetId);

    const cellData: Record<number, Record<number, ICellData>> = {};
    const mergeData: IRange[] = [];

    if (ws['!merges']) {
      for (const merge of ws['!merges']) {
        mergeData.push({
          startRow: merge.s.r,
          startColumn: merge.s.c,
          endRow: merge.e.r,
          endColumn: merge.e.c,
        });
      }
    }

    let maxRow = 0;
    let maxCol = 0;

    for (const cellRef of Object.keys(ws)) {
      if (cellRef.startsWith('!')) continue;
      const cell = ws[cellRef];
      const addr = XLSX.utils.decode_cell(cellRef);
      const row = addr.r;
      const col = addr.c;

      if (row > maxRow) maxRow = row;
      if (col > maxCol) maxCol = col;

      if (!cellData[row]) {
        cellData[row] = {};
      }

      const cellValue: ICellData = {};

      if (cell.t === 'n') {
        cellValue.v = cell.v;
        cellValue.t = CellValueType.NUMBER;
      } else if (cell.t === 'b') {
        cellValue.v = cell.v ? 'TRUE' : 'FALSE';
        cellValue.t = CellValueType.BOOLEAN;
      } else if (cell.t === 'd') {
        cellValue.v = cell.v instanceof Date ? cell.v.toISOString() : String(cell.v);
        cellValue.t = CellValueType.STRING;
      } else if (cell.t === 's') {
        cellValue.v = cell.v;
        cellValue.t = CellValueType.STRING;
      } else {
        cellValue.v = cell.v != null ? String(cell.v) : '';
        cellValue.t = CellValueType.STRING;
      }

      if (cell.f) {
        cellValue.f = cell.f;
      }

      if (cell.s) {
        const styleData: IStyleData = {};
        let hasStyle = false;

        if (cell.s.font) {
          if (cell.s.font.bold) { styleData.bl = 1; hasStyle = true; }
          if (cell.s.font.italic) { styleData.it = 1; hasStyle = true; }
          if (cell.s.font.underline) { styleData.ul = { s: 1 }; hasStyle = true; }
          if (cell.s.font.strike) { styleData.st = { s: 1 }; hasStyle = true; }
          if (cell.s.font.sz) { styleData.fs = cell.s.font.sz; hasStyle = true; }
          if (cell.s.font.name) { styleData.ff = cell.s.font.name; hasStyle = true; }
          if (cell.s.font.color?.rgb) {
            const rgb = cell.s.font.color.rgb;
            styleData.cl = { rgb: `#${rgb.slice(-6)}` };
            hasStyle = true;
          }
        }
        if (cell.s.fill?.fgColor?.rgb) {
          const rgb = cell.s.fill.fgColor.rgb;
          styleData.bg = { rgb: `#${rgb.slice(-6)}` };
          hasStyle = true;
        }
        if (cell.s.alignment) {
          if (cell.s.alignment.horizontal === 'center') { styleData.ht = 2; hasStyle = true; }
          else if (cell.s.alignment.horizontal === 'right') { styleData.ht = 3; hasStyle = true; }
          if (cell.s.alignment.vertical === 'center') { styleData.vt = 2; hasStyle = true; }
          else if (cell.s.alignment.vertical === 'bottom') { styleData.vt = 3; hasStyle = true; }
          if (cell.s.alignment.wrapText) { styleData.tb = 2; hasStyle = true; }
        }

        if (hasStyle) {
          cellValue.s = generateStyleId(styles, styleData);
        }
      }

      cellData[row][col] = cellValue;
    }

    const rowCount = Math.max(maxRow + 1, 100);
    const colCount = Math.max(maxCol + 1, 26);

    const rowData: any[] = [];
    for (let r = 0; r < rowCount; r++) {
      let h = 25;
      if (ws['!rows']?.[r]) {
        const rowInfo = ws['!rows'][r];
        if (rowInfo.hpx) h = rowInfo.hpx;
        else if (rowInfo.hpt) h = Math.round(rowInfo.hpt * 1.33);
      }
      rowData.push({ h, hd: BooleanNumber.FALSE });
    }

    const columnData: any[] = [];
    for (let c = 0; c < colCount; c++) {
      let w = 100;
      if (ws['!cols']?.[c]) {
        const colInfo = ws['!cols'][c];
        if (colInfo.wpx) w = colInfo.wpx;
        else if (colInfo.wch) w = Math.round(colInfo.wch * 8);
      }
      columnData.push({ w, hd: BooleanNumber.FALSE });
    }

    sheets[sheetId] = createSheetData(sheetId, sheetName, cellData, mergeData, rowCount, colCount, rowData, columnData);
  }

  if (sheetOrder.length === 0) {
    const defaultSheetId = 'sheet-1';
    sheetOrder.push(defaultSheetId);
    sheets[defaultSheetId] = createSheetData(defaultSheetId, 'Sheet1', {}, [], 100, 26, [], []);
  }

  return {
    id: fileName,
    name: fileName,
    sheetOrder,
    sheets,
    styles,
    appVersion: '0.20.0',
    locale: LocaleType.ZH_CN,
  };
}

export function workbookDataToXlsx(data: IWorkbookData): ArrayBuffer {
  const wb = XLSX.utils.book_new();
  const styles = data.styles || {};
  const sheetOrder = data.sheetOrder || Object.keys(data.sheets || {});

  for (const sheetId of sheetOrder) {
    const sheet = data.sheets?.[sheetId];
    if (!sheet) continue;

    const ws: XLSX.WorkSheet = {};
    const cellData = sheet.cellData || {};

    for (const rowKey of Object.keys(cellData)) {
      const row = parseInt(rowKey);
      const rowData = cellData[row];
      if (!rowData) continue;

      for (const colKey of Object.keys(rowData)) {
        const col = parseInt(colKey);
        const cell = rowData[col];
        if (!cell) continue;

        const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
        const xlsxCell: XLSX.CellObject = { t: 's', v: '' };

        if (cell.f) {
          xlsxCell.f = cell.f;
          xlsxCell.v = typeof cell.v === 'number' ? cell.v : 0;
          xlsxCell.t = 'n';
        } else if (cell.t === CellValueType.NUMBER || typeof cell.v === 'number') {
          xlsxCell.v = cell.v as number;
          xlsxCell.t = 'n';
        } else if (cell.t === CellValueType.BOOLEAN || cell.v === true || cell.v === false) {
          xlsxCell.v = cell.v as boolean;
          xlsxCell.t = 'b';
        } else {
          xlsxCell.v = cell.v != null ? String(cell.v) : '';
          xlsxCell.t = 's';
        }

        if (cell.s != null) {
          const styleData = typeof cell.s === 'string' ? styles[cell.s as string] : cell.s;
          if (styleData) {
            const font: any = {};
            if (styleData.bl) font.bold = true;
            if (styleData.it) font.italic = true;
            if (styleData.ul) font.underline = true;
            if (styleData.st) font.strike = true;
            if (styleData.fs) font.sz = styleData.fs;
            if (styleData.ff) font.name = styleData.ff;
            if (styleData.cl?.rgb) {
              const hex = String(styleData.cl.rgb).replace('#', '');
              font.color = { rgb: `FF${hex}` };
            }

            const fill: any = {};
            if (styleData.bg?.rgb) {
              const hex = String(styleData.bg.rgb).replace('#', '');
              fill.fgColor = { rgb: `FF${hex}` };
            }

            const alignment: any = {};
            if (styleData.ht === 2) alignment.horizontal = 'center';
            else if (styleData.ht === 3) alignment.horizontal = 'right';
            if (styleData.vt === 2) alignment.vertical = 'center';
            else if (styleData.vt === 3) alignment.vertical = 'bottom';
            if (styleData.tb === 2) alignment.wrapText = true;

            xlsxCell.s = {
              ...(Object.keys(font).length > 0 ? { font } : {}),
              ...(Object.keys(fill).length > 0 ? { fill } : {}),
              ...(Object.keys(alignment).length > 0 ? { alignment } : {}),
            };
          }
        }

        ws[cellRef] = xlsxCell;
      }
    }

    if (sheet.mergeData && sheet.mergeData.length > 0) {
      ws['!merges'] = sheet.mergeData.map((m: IRange) => ({
        s: { r: m.startRow, c: m.startColumn },
        e: { r: m.endRow, c: m.endColumn },
      }));
    }

    if (sheet.columnData) {
      ws['!cols'] = (sheet.columnData as any[]).map((col: any) => ({
        wpx: col?.w || 100,
        hidden: col?.hd === 1,
      }));
    }

    if (sheet.rowData) {
      ws['!rows'] = (sheet.rowData as any[]).map((row: any) => ({
        hpx: row?.h || 25,
        hidden: row?.hd === 1,
      }));
    }

    XLSX.utils.book_append_sheet(wb, ws, sheet.name || 'Sheet1');
  }

  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx', cellStyles: true });
  return buf;
}
