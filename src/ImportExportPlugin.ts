import type { ICommand, Injector } from '@univerjs/core';
import {
  CommandType,
  ICommandService,
} from '@univerjs/core';
import {
  ComponentManager,
  ContextMenuGroup,
  ContextMenuPosition,
  IMenuManagerService,
  MenuItemType,
  RibbonOthersGroup,
} from '@univerjs/ui';
import { FolderIcon, ExportIcon, LinkIcon } from '@univerjs/icons';
import { AddHyperLinkCommand } from '@univerjs/sheets-hyper-link';
import type { FUniver } from '@univerjs/core/facade';
import type { IWorkbookData } from '@univerjs/core';
import { xlsxToWorkbookData, workbookDataToXlsx } from './xlsx-converter';
import type { App, TFile } from 'obsidian';

type OnImportCallback = (data: IWorkbookData) => void;

export function setupImportExport(
  injector: Injector,
  univerAPI: FUniver,
  onImport: OnImportCallback,
): () => void {
  const commandService = injector.get(ICommandService);
  const menuManagerService = injector.get(IMenuManagerService);
  const componentManager = injector.get(ComponentManager);

  componentManager.register('FolderOpenIcon', FolderIcon);
  componentManager.register('ExportXlsxIcon', ExportIcon);
  componentManager.register('OutgoingLinkIcon', LinkIcon);

  const importCommandId = 'sheet-free.import-xlsx';
  const exportCommandId = 'sheet-free.export-xlsx';
  const addOutgoingLinkId = 'sheet-free.add-outgoing-link';
  const addEmbedLinkId = 'sheet-free.add-embed-link';

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const buffer = await file.arrayBuffer();
        const workbookData = xlsxToWorkbookData(buffer, file.name.replace(/\.xlsx?$/i, ''));
        onImport(workbookData);
      } catch (err) {
        console.error('Import xlsx error:', err);
      }
    };
  };

  const handleExport = () => {
    const activeWorkbook = univerAPI.getActiveWorkbook();
    if (!activeWorkbook) return;

    try {
      const workbookData = activeWorkbook.save();
      const buffer = workbookDataToXlsx(workbookData);

      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'export.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export xlsx error:', err);
    }
  };

  const importCommand: ICommand = {
    type: CommandType.OPERATION,
    id: importCommandId,
    handler: () => {
      handleImport();
      return true;
    },
  };

  const exportCommand: ICommand = {
    type: CommandType.OPERATION,
    id: exportCommandId,
    handler: () => {
      handleExport();
      return true;
    },
  };

  const addOutgoingLinkCommand: ICommand = {
    type: CommandType.OPERATION,
    id: addOutgoingLinkId,
    handler: () => {
      showOutgoingLinkModal(univerAPI, appInstance!);
      return true;
    },
  };

  const addEmbedLinkCommand: ICommand = {
    type: CommandType.OPERATION,
    id: addEmbedLinkId,
    handler: () => {
      copyEmbedLink(univerAPI);
      return true;
    },
  };

  commandService.registerCommand(importCommand);
  commandService.registerCommand(exportCommand);
  commandService.registerCommand(addOutgoingLinkCommand);
  commandService.registerCommand(addEmbedLinkCommand);

  menuManagerService.mergeMenu({
    [RibbonOthersGroup.OTHERS]: {
      [importCommandId]: {
        order: 10,
        menuItemFactory: () => ({
          id: importCommandId,
          title: 'importXlsx',
          tooltip: 'importXlsx',
          icon: 'FolderOpenIcon',
          type: MenuItemType.BUTTON,
        }),
      },
      [exportCommandId]: {
        order: 11,
        menuItemFactory: () => ({
          id: exportCommandId,
          title: 'exportXlsx',
          tooltip: 'exportXlsx',
          icon: 'ExportXlsxIcon',
          type: MenuItemType.BUTTON,
        }),
      },
    },
    [ContextMenuPosition.MAIN_AREA]: {
      [ContextMenuGroup.OTHERS]: {
        order: 0,
        'sheet.operation.insert-hyper-link': { order: 1 },
        [addOutgoingLinkId]: {
          order: 2,
          menuItemFactory: () => ({
            id: addOutgoingLinkId,
            title: 'addOutgoingLink',
            icon: 'OutgoingLinkIcon',
            type: MenuItemType.BUTTON,
          }),
        },
        'sheet.operation.show-comment-modal': { order: 3 },
        'sheet.operation.add-note-popup': { order: 4 },
        [addEmbedLinkId]: {
          order: 5,
          menuItemFactory: () => ({
            id: addEmbedLinkId,
            title: 'addEmbedLink',
            icon: 'OutgoingLinkIcon',
            type: MenuItemType.BUTTON,
          }),
        },
      },
    },
  });

  return () => {
    try {
      commandService.unregisterCommand(importCommandId);
      commandService.unregisterCommand(exportCommandId);
      commandService.unregisterCommand(addOutgoingLinkId);
      commandService.unregisterCommand(addEmbedLinkId);
    } catch (e) {
      // ignore
    }
  };
}

let appInstance: App | null = null;

export function setObsidianApp(app: App) {
  appInstance = app;
}

function showOutgoingLinkModal(univerAPI: FUniver, app: App): void {
  const activeWorkbook = univerAPI.getActiveWorkbook();
  if (!activeWorkbook) return;

  const activeSheet = activeWorkbook.getActiveSheet();
  if (!activeSheet) return;

  const selection = activeSheet.getSelection();
  if (!selection) return;

  const files = app.vault.getFiles();
  const container = document.body.createDiv({ cls: 'sheet-free-outgoing-link-modal-overlay' });

  const modal = container.createDiv({ cls: 'sheet-free-outgoing-link-modal' });
  const header = modal.createDiv({ cls: 'sheet-free-outgoing-link-modal-header' });
  header.createEl('h3', { text: '添加内链' });
  const closeBtn = header.createEl('button', { text: '✕', cls: 'sheet-free-outgoing-link-close' });

  const searchBox = modal.createDiv({ cls: 'sheet-free-outgoing-link-search' });
  const input = searchBox.createEl('input', {
    type: 'text',
    placeholder: '搜索笔记...',
    cls: 'sheet-free-outgoing-link-input',
  });

  const listEl = modal.createDiv({ cls: 'sheet-free-outgoing-link-list' });

  const renderList = (filter: string) => {
    listEl.empty();
    const filtered = filter
      ? files.filter(f => f.path.toLowerCase().includes(filter.toLowerCase()) && f.extension === 'md')
      : files.filter(f => f.extension === 'md');

    filtered.slice(0, 50).forEach(file => {
      const item = listEl.createDiv({ cls: 'sheet-free-outgoing-link-item' });
      item.createSpan({ text: file.basename, cls: 'sheet-free-outgoing-link-item-name' });
      item.createSpan({ text: file.path, cls: 'sheet-free-outgoing-link-item-path' });

      item.addEventListener('click', () => {
        insertOutgoingLink(univerAPI, app, file);
        container.remove();
      });
    });
  };

  input.addEventListener('input', () => renderList(input.value));
  renderList('');

  const handleClose = () => container.remove();
  closeBtn.addEventListener('click', handleClose);
  container.addEventListener('click', (e) => {
    if (e.target === container) handleClose();
  });

  input.focus();
}

function insertOutgoingLink(univerAPI: FUniver, app: App, file: TFile): void {
  const activeWorkbook = univerAPI.getActiveWorkbook();
  if (!activeWorkbook) return;

  const sourcePath = activeWorkbook.getId();
  const linkText = app.metadataCache.fileToLinktext(file, sourcePath, true);
  const wikiLink = `[[${linkText}]]`;

  const activeSheet = activeWorkbook.getActiveSheet();
  if (!activeSheet) return;

  const range = activeSheet.getSelection()?.getActiveRange();
  if (!range) return;

  const row = range.getRow();
  const col = range.getColumn();

  try {
    univerAPI.executeCommand(AddHyperLinkCommand.id, {
      unitId: activeWorkbook.getId(),
      subUnitId: activeSheet.getSheet().id,
      link: {
        id: `outgoing-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        row,
        column: col,
        payload: wikiLink,
        display: file.basename,
      },
    });
  } catch (e) {
    console.error('SheetFree: insert outgoing link error:', e);
  }
}

function copyEmbedLink(univerAPI: FUniver): void {
  const activeWorkbook = univerAPI.getActiveWorkbook();
  if (!activeWorkbook) return;

  const workbookId = activeWorkbook.getId();
  const activeSheet = activeWorkbook.getActiveSheet();
  if (!activeSheet) return;

  const sheetName = activeSheet.getSheet().name;
  const selection = activeSheet.getSelection()?.getActiveRange();

  let rangeStr = '';
  if (selection) {
    const startRow = selection.getRow();
    const startCol = selection.getColumn();
    const endRow = startRow + selection.getHeight() - 1;
    const endCol = startCol + selection.getWidth() - 1;
    rangeStr = `|${colToLetter(startCol)}${startRow + 1}:${colToLetter(endCol)}${endRow + 1}`;
  }

  const embedLink = `![[${workbookId}#${sheetName}${rangeStr}]]`;

  navigator.clipboard.writeText(embedLink).then(() => {
    console.log('Embed link copied:', embedLink);
  }).catch(() => {
    const textarea = document.createElement('textarea');
    textarea.value = embedLink;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  });
}

function colToLetter(col: number): string {
  let result = '';
  let c = col;
  while (c >= 0) {
    result = String.fromCharCode(65 + (c % 26)) + result;
    c = Math.floor(c / 26) - 1;
  }
  return result;
}

export function handleOutgoingLinkClick(url: string, app: App): void {
  if (url.startsWith('[[') && url.endsWith(']]')) {
    const linkText = url.slice(2, -2);
    app.workspace.openLinkText(linkText, '', 'split');
  }
}
