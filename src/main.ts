import {
  Plugin,
  TFile,
  TFolder,
  WorkspaceLeaf,
  normalizePath,
  ViewState,
  MarkdownPostProcessorContext,
} from 'obsidian';
import { around } from 'monkey-around';
import { VIEW_TYPE_SHEET, FRONTMATTER_KEY, BLANK_CONTENT } from './constants';
import { SheetView } from './SheetView';
import { t } from './i18n';
import { setObsidianApp } from './ImportExportPlugin';
import { registerEmbedLinkProcessor } from './embed-link-processor';
import './custom.css';

const SHEET_FILE_EXT = 'sheet';

export default class SheetFreePlugin extends Plugin {
  async onload() {
    try {
      setObsidianApp(this.app);

      this.registerView(VIEW_TYPE_SHEET, (leaf: WorkspaceLeaf) => new SheetView(leaf));
      this.registerExtensions([SHEET_FILE_EXT], VIEW_TYPE_SHEET);

      this.addRibbonIcon('sheet', t('CREATE_SHEET'), () => {
        this.createAndOpenSheet('/');
      });

      this.addCommand({
        id: 'create-sheet',
        name: t('CREATE_SHEET'),
        callback: () => {
          this.createAndOpenSheet('/');
        },
      });

      this.registerEvent(
        this.app.workspace.on('file-menu', (menu, file) => {
          menu.addItem((item) => {
            item
              .setTitle(t('CREATE_SHEET'))
              .setIcon('sheet')
              .onClick(() => {
                const folder = file instanceof TFolder ? file.path : file.parent?.path || '/';
                this.createAndOpenSheet(folder);
              });
          });
        }),
      );

      this.registerMonkeyPatches();
      this.switchToSheetAfterLoad();
      registerEmbedLinkProcessor(this);
    } catch (e) {
      const errStr = e instanceof Error ? `${e.message}\n${e.stack || ''}` : String(e);
      console.error('[obsidian-excel] onload error:', errStr);
      try {
        await this.app.vault.adapter.write(
          'excel-error-log.txt',
          `[${new Date().toISOString()}]\n${errStr}`
        );
      } catch { /* ignore */ }
    }
  }

  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_SHEET);
  }

  private registerMonkeyPatches() {
    const self = this;

    this.register(
      around(WorkspaceLeaf.prototype, {
        setViewState(next) {
          return function (state: ViewState, ...rest: any[]) {
            if (
              state.type === 'markdown'
              && state.state?.file
            ) {
              const filepath = state.state.file as string;
              const cache = self.app.metadataCache.getCache(filepath);

              if (cache?.frontmatter && cache.frontmatter[FRONTMATTER_KEY]) {
                const newState = {
                  ...state,
                  type: VIEW_TYPE_SHEET,
                };
                return next.apply(this, [newState, ...rest]);
              }
            }

            return next.apply(this, [state, ...rest]);
          };
        },
      }),
    );
  }

  private switchToSheetAfterLoad(): void {
    this.app.workspace.onLayoutReady(() => {
      const markdownLeaves = this.app.workspace.getLeavesOfType('markdown');
      for (const leaf of markdownLeaves) {
        if (leaf.view instanceof SheetView) continue;
        const file = (leaf.view as any).file;
        if (file && this.isSheetFile(file)) {
          this.setSheetView(leaf);
        }
      }
    });
  }

  isSheetFile(f: TFile): boolean {
    if (f.extension === SHEET_FILE_EXT) return true;
    if (f.path.endsWith('.sheet.md')) return true;
    const cache = this.app.metadataCache.getFileCache(f);
    return !!(cache?.frontmatter && cache.frontmatter[FRONTMATTER_KEY]);
  }

  private async setSheetView(leaf: WorkspaceLeaf): Promise<void> {
    await leaf.setViewState({
      type: VIEW_TYPE_SHEET,
      state: leaf.view.getState(),
      popstate: true,
    } as ViewState);
  }

  private async createAndOpenSheet(folderPath: string): Promise<void> {
    const folder = normalizePath(folderPath);
    const filename = `Sheet ${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')}`;
    const filepath = normalizePath(`${folder}/${filename}.sheet.md`);

    let finalPath = filepath;
    let counter = 1;
    while (this.app.vault.getAbstractFileByPath(finalPath)) {
      finalPath = normalizePath(`${folder}/${filename} ${counter}.sheet.md`);
      counter++;
    }

    const file = await this.app.vault.create(finalPath, BLANK_CONTENT);
    await this.openSheetFile(file);
  }

  private async openSheetFile(file: TFile): Promise<void> {
    const leaf = this.app.workspace.getLeaf(false);
    await leaf.openFile(file);
    await this.setSheetView(leaf);
  }
}
