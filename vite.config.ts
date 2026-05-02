import { copyFile, rename, writeFile, readFile, appendFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import process from 'node:process';
import { defineConfig } from 'vite';
import builtins from 'builtin-modules';
import { univerPlugin } from '@univerjs/vite-plugin';

import pkg from './package.json';

const prod = !process.argv.includes('--watch');

function copyBuildOutput() {
  return {
    name: 'copy-build-output',
    async writeBundle() {
      const outDir = resolve(__dirname, 'dist');
      await writeFile(resolve(outDir, 'manifest.json'), `${JSON.stringify({
        id: pkg.name,
        name: 'Sheet Free',
        version: pkg.version,
        minAppVersion: '0.15.0',
        description: pkg.description,
        author: pkg.author,
        isDesktopOnly: false,
      }, null, 2)}\n`);
    },
    async closeBundle() {
      const outDir = resolve(__dirname, 'dist');
      const rootDir = resolve(__dirname);
      try {
        await copyFile(resolve(outDir, 'main.js'), join(rootDir, 'main.js'));
      } catch (e) { /* ignore */ }
      try {
        const styleCssPath = resolve(outDir, 'style.css');
        const stylesCssPath = resolve(outDir, 'styles.css');
        await rename(styleCssPath, stylesCssPath).catch(() => {});
        await copyFile(stylesCssPath, join(rootDir, 'styles.css'));
        const customCss = await readFile(resolve(rootDir, 'src/custom.css'), 'utf-8');
        await appendFile(join(rootDir, 'styles.css'), customCss);
      } catch (e) { /* ignore */ }
      try {
        await copyFile(resolve(outDir, 'manifest.json'), join(rootDir, 'manifest.json'));
      } catch (e) { /* ignore */ }
    },
  };
}

export default defineConfig(() => {
  const dev = process.argv.includes('--watch');

  return {
    esbuild: {
      tsconfigRaw: {
        compilerOptions: {
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
        },
      },
    },
    plugins: [
      copyBuildOutput(),
      univerPlugin(),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        'opentype.js/dist/opentype.module': resolve(__dirname, './node_modules/opentype.js/dist/opentype.mjs'),
      },
    },
    optimizeDeps: {
      dedupe: [
        '@univerjs/core',
        '@univerjs/sheets',
      ],
    },
    build: {
      outDir: 'dist',
      lib: {
        entry: './src/main.ts',
        name: 'main',
        fileName: () => 'main.js',
        formats: ['cjs'],
      },
      emptyOutDir: !dev,
      sourcemap: dev ? 'inline' : false,
      target: 'ESNext',
      rollupOptions: {
        output: {
          globals: {
            obsidian: 'obsidian',
          },
          manualChunks: () => 'main.js',
        },
        external: [
          'obsidian',
          'electron',
          '@codemirror/autocomplete',
          '@codemirror/collab',
          '@codemirror/commands',
          '@codemirror/language',
          '@codemirror/lint',
          '@codemirror/search',
          '@codemirror/state',
          '@codemirror/view',
          '@lezer/common',
          '@lezer/highlight',
          '@lezer/lr',
          ...builtins,
        ],
      },
      minify: prod,
    },
  };
});
