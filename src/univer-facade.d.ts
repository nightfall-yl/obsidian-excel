declare module '@univerjs/core/facade' {
  import type { Univer } from '@univerjs/core';

  export interface FUniver {
    Event: {
      LifeCycleChanged: string;
      CommandExecuted: string;
    };
    createWorkbook(data: any): any;
    getActiveWorkbook(): FWorkbook | null;
    addEvent(event: string, callback: (res: any) => void): void;
    disposeUnit(id: string): void;
    dispose(): void;
  }

  export interface FWorkbook {
    getId(): string;
    save(): any;
  }

  export const FUniver: {
    newAPI(univer: Univer): FUniver;
  };
}

declare module '@univerjs/design/lib/es/locale/zh-CN' {
  const value: Record<string, any>;
  export default value;
}
declare module '@univerjs/design/lib/es/locale/en-US' {
  const value: Record<string, any>;
  export default value;
}
declare module '@univerjs/docs-ui/lib/es/locale/zh-CN' {
  const value: Record<string, any>;
  export default value;
}
declare module '@univerjs/docs-ui/lib/es/locale/en-US' {
  const value: Record<string, any>;
  export default value;
}
declare module '@univerjs/sheets/lib/es/locale/zh-CN' {
  const value: Record<string, any>;
  export default value;
}
declare module '@univerjs/sheets/lib/es/locale/en-US' {
  const value: Record<string, any>;
  export default value;
}
declare module '@univerjs/sheets-ui/lib/es/locale/zh-CN' {
  const value: Record<string, any>;
  export default value;
}
declare module '@univerjs/sheets-ui/lib/es/locale/en-US' {
  const value: Record<string, any>;
  export default value;
}
declare module '@univerjs/sheets-formula/lib/es/locale/zh-CN' {
  const value: Record<string, any>;
  export default value;
}
declare module '@univerjs/sheets-formula/lib/es/locale/en-US' {
  const value: Record<string, any>;
  export default value;
}
declare module '@univerjs/sheets-formula-ui/lib/es/locale/zh-CN' {
  const value: Record<string, any>;
  export default value;
}
declare module '@univerjs/sheets-formula-ui/lib/es/locale/en-US' {
  const value: Record<string, any>;
  export default value;
}
declare module '@univerjs/sheets-numfmt-ui/lib/es/locale/zh-CN' {
  const value: Record<string, any>;
  export default value;
}
declare module '@univerjs/sheets-numfmt-ui/lib/es/locale/en-US' {
  const value: Record<string, any>;
  export default value;
}
declare module '@univerjs/sheets-filter-ui/lib/es/locale/zh-CN' {
  const value: Record<string, any>;
  export default value;
}
declare module '@univerjs/sheets-filter-ui/lib/es/locale/en-US' {
  const value: Record<string, any>;
  export default value;
}
declare module '@univerjs/sheets-sort/lib/es/locale/zh-CN' {
  const value: Record<string, any>;
  export default value;
}
declare module '@univerjs/sheets-sort/lib/es/locale/en-US' {
  const value: Record<string, any>;
  export default value;
}
declare module '@univerjs/sheets-sort-ui/lib/es/locale/zh-CN' {
  const value: Record<string, any>;
  export default value;
}
declare module '@univerjs/sheets-sort-ui/lib/es/locale/en-US' {
  const value: Record<string, any>;
  export default value;
}
declare module '@univerjs/find-replace/lib/es/locale/zh-CN' {
  const value: Record<string, any>;
  export default value;
}
declare module '@univerjs/find-replace/lib/es/locale/en-US' {
  const value: Record<string, any>;
  export default value;
}
declare module '@univerjs/ui/lib/es/locale/zh-CN' {
  const value: Record<string, any>;
  export default value;
}
declare module '@univerjs/ui/lib/es/locale/en-US' {
  const value: Record<string, any>;
  export default value;
}
declare module '@univerjs/thread-comment-ui/lib/es/locale/zh-CN' {
  const value: Record<string, any>;
  export default value;
}
declare module '@univerjs/thread-comment-ui/lib/es/locale/en-US' {
  const value: Record<string, any>;
  export default value;
}
declare module '@univerjs/sheets-thread-comment-ui/lib/es/locale/zh-CN' {
  const value: Record<string, any>;
  export default value;
}
declare module '@univerjs/sheets-thread-comment-ui/lib/es/locale/en-US' {
  const value: Record<string, any>;
  export default value;
}
declare module '@univerjs/sheets-hyper-link-ui/lib/es/locale/zh-CN' {
  const value: Record<string, any>;
  export default value;
}
declare module '@univerjs/sheets-hyper-link-ui/lib/es/locale/en-US' {
  const value: Record<string, any>;
  export default value;
}
declare module '@univerjs/sheets-note-ui/lib/es/locale/zh-CN' {
  const value: Record<string, any>;
  export default value;
}
declare module '@univerjs/sheets-note-ui/lib/es/locale/en-US' {
  const value: Record<string, any>;
  export default value;
}
