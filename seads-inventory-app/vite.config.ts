import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// 本番は GitHub Pages の /xbp/seads-inventory/ 配下で配信する。
// ビルド出力は隣の seads-inventory/ に吐き出し、公開URLを変えない。
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  base: mode === 'production' ? '/xbp/seads-inventory/' : '/',
  build: {
    outDir: '../seads-inventory',
    emptyOutDir: true,
  },
}));
