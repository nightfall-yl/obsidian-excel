import '@univerjs/design/lib/index.css';
import '@univerjs/ui/lib/index.css';
import '@univerjs/docs-ui/lib/index.css';
import '@univerjs/sheets-ui/lib/index.css';
import '@univerjs/sheets-formula-ui/lib/index.css';
import '@univerjs/sheets-numfmt-ui/lib/index.css';
import '@univerjs/sheets-filter-ui/lib/index.css';
import '@univerjs/sheets-sort-ui/lib/index.css';
import '@univerjs/find-replace/lib/index.css';
import '@univerjs/thread-comment-ui/lib/index.css';
import '@univerjs/sheets-thread-comment-ui/lib/index.css';
import '@univerjs/sheets-hyper-link-ui/lib/index.css';
import '@univerjs/sheets-note-ui/lib/index.css';

import { IAuthzIoService, LocaleType, LogLevel, Tools, Univer, UserManagerService } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { defaultTheme } from '@univerjs/themes';
import { MockAuthzService } from './MockAuthzService';
import type { App } from 'obsidian';
import { Platform } from 'obsidian';

import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { CalculationMode, UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import { UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui';
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt';
import { UniverSheetsNumfmtUIPlugin } from '@univerjs/sheets-numfmt-ui';
import { UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import { UniverSheetsSortPlugin } from '@univerjs/sheets-sort';
import { UniverSheetsSortUIPlugin } from '@univerjs/sheets-sort-ui';
import { UniverFindReplacePlugin } from '@univerjs/find-replace';
import { UniverThreadCommentPlugin } from '@univerjs/thread-comment';
import { UniverThreadCommentUIPlugin } from '@univerjs/thread-comment-ui';
import { UniverSheetsThreadCommentPlugin } from '@univerjs/sheets-thread-comment';
import { UniverSheetsThreadCommentUIPlugin } from '@univerjs/sheets-thread-comment-ui';
import { UniverSheetsHyperLinkPlugin } from '@univerjs/sheets-hyper-link';
import { UniverSheetsHyperLinkUIPlugin } from '@univerjs/sheets-hyper-link-ui';
import { UniverSheetsNotePlugin } from '@univerjs/sheets-note';
import { UniverSheetsNoteUIPlugin } from '@univerjs/sheets-note-ui';
import { UniverMobileUIPlugin, UniverUIPlugin } from '@univerjs/ui';
import { UniverSheetsMobileUIPlugin, UniverSheetsUIPlugin } from '@univerjs/sheets-ui';

import '@univerjs/sheets/facade';
import '@univerjs/ui/facade';
import '@univerjs/docs-ui/facade';
import '@univerjs/sheets-ui/facade';
import '@univerjs/engine-formula/facade';
import '@univerjs/sheets-filter/facade';
import '@univerjs/sheets-formula/facade';
import '@univerjs/sheets-numfmt/facade';
import '@univerjs/sheets-hyper-link-ui/facade';
import '@univerjs/sheets-thread-comment/facade';
import '@univerjs/sheets-note/facade';

import designZhCN from '@univerjs/design/lib/es/locale/zh-CN';
import docsUiZhCN from '@univerjs/docs-ui/lib/es/locale/zh-CN';
import sheetsZhCN from '@univerjs/sheets/lib/es/locale/zh-CN';
import sheetsUiZhCN from '@univerjs/sheets-ui/lib/es/locale/zh-CN';
import sheetsFormulaZhCN from '@univerjs/sheets-formula/lib/es/locale/zh-CN';
import sheetsFormulaUiZhCN from '@univerjs/sheets-formula-ui/lib/es/locale/zh-CN';
import sheetsNumfmtUiZhCN from '@univerjs/sheets-numfmt-ui/lib/es/locale/zh-CN';
import sheetsFilterUiZhCN from '@univerjs/sheets-filter-ui/lib/es/locale/zh-CN';
import sheetsSortZhCN from '@univerjs/sheets-sort/lib/es/locale/zh-CN';
import sheetsSortUiZhCN from '@univerjs/sheets-sort-ui/lib/es/locale/zh-CN';
import findReplaceZhCN from '@univerjs/find-replace/lib/es/locale/zh-CN';
import uiZhCN from '@univerjs/ui/lib/es/locale/zh-CN';
import threadCommentUiZhCN from '@univerjs/thread-comment-ui/lib/es/locale/zh-CN';
import sheetsThreadCommentUiZhCN from '@univerjs/sheets-thread-comment-ui/lib/es/locale/zh-CN';
import sheetsHyperLinkUiZhCN from '@univerjs/sheets-hyper-link-ui/lib/es/locale/zh-CN';
import sheetsNoteUiZhCN from '@univerjs/sheets-note-ui/lib/es/locale/zh-CN';

import designEnUS from '@univerjs/design/lib/es/locale/en-US';
import docsUiEnUS from '@univerjs/docs-ui/lib/es/locale/en-US';
import sheetsEnUS from '@univerjs/sheets/lib/es/locale/en-US';
import sheetsUiEnUS from '@univerjs/sheets-ui/lib/es/locale/en-US';
import sheetsFormulaEnUS from '@univerjs/sheets-formula/lib/es/locale/en-US';
import sheetsFormulaUiEnUS from '@univerjs/sheets-formula-ui/lib/es/locale/en-US';
import sheetsNumfmtUiEnUS from '@univerjs/sheets-numfmt-ui/lib/es/locale/en-US';
import sheetsFilterUiEnUS from '@univerjs/sheets-filter-ui/lib/es/locale/en-US';
import sheetsSortEnUS from '@univerjs/sheets-sort/lib/es/locale/en-US';
import sheetsSortUiEnUS from '@univerjs/sheets-sort-ui/lib/es/locale/en-US';
import findReplaceEnUS from '@univerjs/find-replace/lib/es/locale/en-US';
import uiEnUS from '@univerjs/ui/lib/es/locale/en-US';
import threadCommentUiEnUS from '@univerjs/thread-comment-ui/lib/es/locale/en-US';
import sheetsThreadCommentUiEnUS from '@univerjs/sheets-thread-comment-ui/lib/es/locale/en-US';
import sheetsHyperLinkUiEnUS from '@univerjs/sheets-hyper-link-ui/lib/es/locale/en-US';
import sheetsNoteUiEnUS from '@univerjs/sheets-note-ui/lib/es/locale/en-US';

const zhCNLocale = Tools.deepMerge(
  {},
  designZhCN,
  docsUiZhCN,
  sheetsZhCN,
  sheetsUiZhCN,
  sheetsFormulaZhCN,
  sheetsFormulaUiZhCN,
  sheetsNumfmtUiZhCN,
  sheetsFilterUiZhCN,
  sheetsSortZhCN,
  sheetsSortUiZhCN,
  findReplaceZhCN,
  uiZhCN,
  threadCommentUiZhCN,
  sheetsThreadCommentUiZhCN,
  sheetsHyperLinkUiZhCN,
  sheetsNoteUiZhCN,
  {
    hyperLink: { menu: { add: '添加外链' } },
    importXlsx: '导入 xlsx',
    exportXlsx: '导出 xlsx',
    addOutgoingLink: '添加内链',
    addEmbedLink: '生成嵌入链接',
  },
);

const enUSLocale = Tools.deepMerge(
  {},
  designEnUS,
  docsUiEnUS,
  sheetsEnUS,
  sheetsUiEnUS,
  sheetsFormulaEnUS,
  sheetsFormulaUiEnUS,
  sheetsNumfmtUiEnUS,
  sheetsFilterUiEnUS,
  sheetsSortEnUS,
  sheetsSortUiEnUS,
  findReplaceEnUS,
  uiEnUS,
  threadCommentUiEnUS,
  sheetsThreadCommentUiEnUS,
  sheetsHyperLinkUiEnUS,
  sheetsNoteUiEnUS,
  {
    hyperLink: { menu: { add: 'Add external link' } },
    importXlsx: 'Import xlsx',
    exportXlsx: 'Export xlsx',
    addOutgoingLink: 'Add internal link',
    addEmbedLink: 'Generate embed link',
  },
);

export function getObsidianLocale(): LocaleType {
  const locale = window.moment?.locale?.() || 'en';
  switch (locale) {
    case 'zh-cn':
    case 'zh':
      return LocaleType.ZH_CN;
    default:
      return LocaleType.EN_US;
  }
}

export function createUniverInstance(
  container: string | HTMLElement,
  darkMode: boolean = false,
  app?: App,
  mobilePreviewMode: boolean = false,
) {
  const obsidianLocale = getObsidianLocale();
  const isMobile = !Platform.isDesktopApp;

  const univer = new Univer({
    theme: defaultTheme,
    darkMode,
    locale: obsidianLocale,
    logLevel: LogLevel.ERROR,
    locales: {
      [LocaleType.ZH_CN]: zhCNLocale,
      [LocaleType.EN_US]: enUSLocale,
    },
    override: [
      [IAuthzIoService, { useClass: MockAuthzService }],
    ],
  });

  const injector = univer.__getInjector();
  const userManagerService = injector.get(UserManagerService);
  userManagerService.setCurrentUser({
    userID: 'obsidian-user',
    name: 'Obsidian User',
  });

  if (isMobile) {
    if (mobilePreviewMode) {
      registerMobilePreviewPlugins(univer, container);
    } else {
      registerMobileEditPlugins(univer, container);
    }
  } else {
    registerDesktopPlugins(univer, container, app);
  }

  const univerAPI = FUniver.newAPI(univer);
  return { univerAPI, univer };
}

function registerDesktopPlugins(univer: Univer, container: string | HTMLElement, app?: App) {
  univer.registerPlugin(UniverDocsPlugin);
  univer.registerPlugin(UniverRenderEnginePlugin);
  univer.registerPlugin(UniverUIPlugin, {
    container,
    header: true,
    footer: true,
    toolbar: true,
    contextMenu: true,
  });
  univer.registerPlugin(UniverDocsUIPlugin);
  univer.registerPlugin(UniverSheetsPlugin);
  univer.registerPlugin(UniverSheetsUIPlugin);
  univer.registerPlugin(UniverSheetsNumfmtPlugin);
  univer.registerPlugin(UniverSheetsNumfmtUIPlugin);
  univer.registerPlugin(UniverFormulaEnginePlugin);
  univer.registerPlugin(UniverSheetsFormulaPlugin, {
    initialFormulaComputing: CalculationMode.FORCED,
  });
  univer.registerPlugin(UniverSheetsFormulaUIPlugin);
  univer.registerPlugin(UniverFindReplacePlugin);
  univer.registerPlugin(UniverSheetsFilterPlugin);
  univer.registerPlugin(UniverSheetsSortPlugin);
  univer.registerPlugin(UniverSheetsSortUIPlugin);
  univer.registerPlugin(UniverThreadCommentPlugin);
  univer.registerPlugin(UniverThreadCommentUIPlugin);
  univer.registerPlugin(UniverSheetsThreadCommentPlugin);
  univer.registerPlugin(UniverSheetsThreadCommentUIPlugin);
  univer.registerPlugin(UniverSheetsHyperLinkPlugin);
  univer.registerPlugin(UniverSheetsHyperLinkUIPlugin, {
    urlHandler: {
      navigateToOtherWebsite: (url: string) => {
        if (url.startsWith('[[') && url.endsWith(']]') && app) {
          const linkText = url.slice(2, -2);
          app.workspace.openLinkText(linkText, '', 'split');
        } else {
          window.open(url, '_blank');
        }
      },
    },
  });
  univer.registerPlugin(UniverSheetsNotePlugin);
  univer.registerPlugin(UniverSheetsNoteUIPlugin);
}

function registerMobilePreviewPlugins(univer: Univer, container: string | HTMLElement) {
  univer.registerPlugin(UniverDocsPlugin);
  univer.registerPlugin(UniverRenderEnginePlugin);
  univer.registerPlugin(UniverMobileUIPlugin, {
    container,
    contextMenu: false,
    header: false,
    footer: false,
    toolbar: false,
  });
  univer.registerPlugin(UniverDocsUIPlugin);
  univer.registerPlugin(UniverSheetsPlugin);
  univer.registerPlugin(UniverSheetsMobileUIPlugin);
  univer.registerPlugin(UniverSheetsFilterPlugin);
  univer.registerPlugin(UniverSheetsNumfmtPlugin);
  univer.registerPlugin(UniverFormulaEnginePlugin);
  univer.registerPlugin(UniverSheetsFormulaPlugin, {
    initialFormulaComputing: CalculationMode.FORCED,
  });
}

function registerMobileEditPlugins(univer: Univer, container: string | HTMLElement) {
  univer.registerPlugin(UniverDocsPlugin);
  univer.registerPlugin(UniverRenderEnginePlugin);
  univer.registerPlugin(UniverMobileUIPlugin, {
    container,
    contextMenu: true,
    header: true,
    footer: true,
    toolbar: true,
    disableAutoFocus: false,
  });
  univer.registerPlugin(UniverDocsUIPlugin);
  univer.registerPlugin(UniverSheetsPlugin);
  univer.registerPlugin(UniverSheetsMobileUIPlugin, {
    disableAutoFocus: false,
  });
  univer.registerPlugin(UniverSheetsFilterPlugin);
  univer.registerPlugin(UniverSheetsNumfmtPlugin);
  univer.registerPlugin(UniverSheetsNumfmtUIPlugin);
  univer.registerPlugin(UniverFormulaEnginePlugin);
  univer.registerPlugin(UniverSheetsFormulaPlugin, {
    initialFormulaComputing: CalculationMode.FORCED,
  });
  univer.registerPlugin(UniverSheetsFormulaUIPlugin);
  univer.registerPlugin(UniverSheetsHyperLinkPlugin);
  univer.registerPlugin(UniverSheetsHyperLinkUIPlugin);
  univer.registerPlugin(UniverSheetsNotePlugin);
  univer.registerPlugin(UniverSheetsNoteUIPlugin);
}