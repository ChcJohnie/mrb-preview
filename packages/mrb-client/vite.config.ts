/// <reference types="vitest" />
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import presetWind from '@unocss/preset-wind'
import presetAttributify from '@unocss/preset-attributify'
import presetIcons from '@unocss/preset-icons'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Unocss({
      presets: [presetWind(), presetAttributify(), presetIcons()],
      theme: {
        colors: {
          header: '#0B5351',
          male: '#00A9A5',
          female: '#B8336A',
          neutral: '#544E61',
          even: '#EFEFEF',
        },
        fontFamily: {
          mrb: ['"Space Grotesk"', 'Arial'],
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
  },
})
