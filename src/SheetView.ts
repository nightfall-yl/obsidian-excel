import type { FUniver } from '@univerjs/core/facade';
import type { IWorkbookData, Univer } from '@univerjs/core';
import { CommandType, LifecycleStages } from '@univerjs/core';
import type { TFile, WorkspaceLeaf } from 'obsidian';
import { TextFileView, debounce, Notice } from 'obsidian';
import { createUniverInstance } from './setup-univer';
import { parseSheetFile, workbookDataToMarkdown, createBlankSheetData } from './data-utils';
import { BLANK_CONTENT, VIEW_TYPE_SHEET } from './constants';
import { t } from './i18n';
import { setupImportExport } from './ImportExportPlugin';

export class SheetView extends TextFileView {
  private univer: Univer | null = null;
  private univerAPI: FUniver | null = null;
  private lastWorkbookData: IWorkbookData | null = null;
  private sheetContainerEl: HTMLElement | null = null;
  private isSaving = false;
  private disposeImportExport: (() => void) | null = null;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType(): string {
    return VIEW_TYPE_SHEET;
  }

  getDisplayText(): string {
    return this.file?.basename || 'Sheet';
  }

  setViewData(data: string, _: boolean): void {
    if (!this.file) return;
    this.data = data;

    const workbookData = parseSheetFile(data, this.file.path) || createBlankSheetData(this.file.path);
    this.lastWorkbookData = workbookData;

    this.renderUniver(workbookData);
  }

  async onUnloadFile(file: TFile): Promise<void> {
    this.save();
    this.disposeUniver();
  }

  onunload(): void {
    this.disposeUniver();
  }

  onload(): void {
    super.onload();
  }

  clear(): void {
    this.data = BLANK_CONTENT;
  }

  getViewData(): string {
    if (this.lastWorkbookData) {
      return workbookDataToMarkdown(this.lastWorkbookData);
    }
    return this.data || BLANK_CONTENT;
  }

  async save(): Promise<void> {
    if (this.isSaving) return;
    this.isSaving = true;

    try {
      if (!this.file || !this.app.vault.getAbstractFileByPath(this.file.path)) {
        this.isSaving = false;
        return;
      }

      if (this.lastWorkbookData) {
        this.data = workbookDataToMarkdown(this.lastWorkbookData);
      }

      await super.save();
    } catch (e) {
      console.error('SheetFree save error:', e);
    } finally {
      this.isSaving = false;
    }
  }

  private autoSave = debounce(async () => {
    await this.save();
  }, 5000);

  private renderUniver(workbookData: IWorkbookData): void {
    this.disposeUniver();

    this.contentEl.style.padding = '0';
    this.contentEl.empty();

    this.sheetContainerEl = this.contentEl.createDiv({ cls: 'sheet-free-container' });
    this.sheetContainerEl.style.width = '100%';
    this.sheetContainerEl.style.height = '100%';

    const isDark = this.app.isDarkMode();
    const { univerAPI, univer } = createUniverInstance(this.sheetContainerEl, isDark, this.app);
    this.univerAPI = univerAPI;
    this.univer = univer;

    univerAPI.createWorkbook(workbookData);

    univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, (res: any) => {
      if (res.stage === LifecycleStages.Rendered) {
        this.setupDataSync();
        this.setupImportExportFeature();
      }
    });
  }

  private setupDataSync(): void {
    if (!this.univerAPI) return;

    this.univerAPI.addEvent(this.univerAPI.Event.CommandExecuted, (res: any) => {
      if (res.type !== CommandType.MUTATION || res.options?.fromCollab || res.options?.onlyLocal) {
        return;
      }
      if (res.id === 'doc.mutation.rich-text-editing') return;

      const activeWorkbook = this.univerAPI!.getActiveWorkbook();
      if (activeWorkbook) {
        this.lastWorkbookData = activeWorkbook.save();
        this.autoSave();
      }
    });
  }

  private setupImportExportFeature(): void {
    if (!this.univer || !this.univerAPI) return;

    const injector = (this.univer as any).__getInjector();
    if (!injector) return;

    try {
      this.disposeImportExport = setupImportExport(
        injector,
        this.univerAPI,
        (data: IWorkbookData) => this.handleImportData(data),
      );
    } catch (e) {
      console.error('SheetFree: failed to setup import/export:', e);
    }
  }

  private async handleImportData(workbookData: IWorkbookData): Promise<void> {
    try {
      new Notice(t('IMPORTING'));

      if (this.file) {
        workbookData.name = this.file.path;
        workbookData.id = this.file.path;
      }

      this.lastWorkbookData = workbookData;
      await this.save();
      this.renderUniver(workbookData);

      new Notice(t('IMPORT_SUCCESS'));
    } catch (err) {
      new Notice(t('IMPORT_FAILED') + err);
      console.error('Import error:', err);
    }
  }

  private disposeUniver(): void {
    if (this.disposeImportExport) {
      try {
        this.disposeImportExport();
      } catch (e) {
        // ignore
      }
      this.disposeImportExport = null;
    }

    if (this.univerAPI) {
      try {
        const activeWorkbook = this.univerAPI.getActiveWorkbook();
        if (activeWorkbook) {
          this.univerAPI.disposeUnit(activeWorkbook.getId());
        }
        this.univerAPI.dispose();
      } catch (e) {
        // ignore
      }
      this.univerAPI = null;
    }
    if (this.univer) {
      try {
        this.univer.dispose();
      } catch (e) {
        // ignore
      }
      this.univer = null;
    }
    this.sheetContainerEl = null;
  }

  public getUniverAPI(): FUniver | null {
    return this.univerAPI;
  }
}
