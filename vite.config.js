import { fileURLToPath, URL } from 'node:url'
import copy from 'rollup-plugin-copy'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'

export default defineConfig({
  base: process.env.VITE_BASE_URL || '/vue2-components-plus/',
  plugins: [
    vue(),
    copy({
      targets: [
        {
          src: 'src/views/*',
          dest: 'public/ComponentDemo',
        },
      ],
      hook: 'writeBundle',
      verbose: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      packages: fileURLToPath(new URL('./packages', import.meta.url)),
      '@pkg': fileURLToPath(new URL('./packages', import.meta.url)),
    },
  },

  build: {
    outDir: 'dist',
    lib: {
      entry: fileURLToPath(new URL('./packages/index.js', import.meta.url)),
      name: 'Vue2ComponentsPlus',
      fileName: 'vue2-components-plus',
    },
    rollupOptions: {
      external: ['vue', 'element-ui', /^element-ui\/.*/],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          'element-ui': 'ELEMENT',
        },
        assetFileNames: 'vue2-components-plus.[ext]',
      },
    },

    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
  },
})

