import { moment } from 'obsidian';
import en from './en';
import zhCN from './zh-cn';

const localeMap: Record<string, Record<string, string>> = {
  'zh-cn': zhCN,
  'zh': zhCN,
};

const locale = localeMap[moment.locale()];

export function t(key: string): string {
  return (locale && locale[key]) || en[key] || key;
}
