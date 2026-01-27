import { defineConfig } from 'vite';
import vueRouter from 'unplugin-vue-router/vite';
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path';
import vue from '@vitejs/plugin-vue';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import AutoImport from 'unplugin-auto-import/vite';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    vueRouter({
      routesFolder: 'src/js/screens',
      dts: 'src/js/types/typed-router.d.ts',
    }),
    vue(),
    tailwindcss(),
    AutoImport({
                imports: [
                    'vue',
                    '@vueuse/core',
                    { dayjs: [['default', 'dayjs']] },
                    { '@inertiajs/vue3': ['useForm', 'usePage', 'Head', 'Link'] },
                    { 'vue-i18n': ['useI18n'] },
                ],
                dts: 'resources/js/types/auto-imports.d.ts',
            }),
            VueI18nPlugin({
                include: path.resolve(dirname(fileURLToPath(import.meta.url)), './locales/**'),
            }),
  ],
  root: './src',
  build: {
    outDir: '../dist',
    minify: false,
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/js'),
      '@css': path.resolve(__dirname, './src/css'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '#': path.resolve(__dirname),
    },
  },
});
