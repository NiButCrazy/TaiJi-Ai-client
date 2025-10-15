import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  main: {
    plugins: [ externalizeDepsPlugin() ],
    publicDir: './static',
    build: {
      outDir: '.out/main',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/main.ts')
        }
      }
    },
    resolve: {
      alias: {
        '@static': resolve(__dirname, './static')
      }
    }
  },
  preload: {
    plugins: [ externalizeDepsPlugin() ],
    publicDir: './static',
    build: {
      outDir: '.out/preload',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/preload.ts')
        }
      }
    }
  },
  renderer: {
    build: {
      outDir: '.out/renderer'
    },
    resolve: {
      alias: {
        '@renderer': resolve(__dirname, './src/renderer/src'),
        '@components': resolve(__dirname, './src/renderer/src/components'),
        '@utils': resolve(__dirname, './src/renderer/src/utils'),
        '@global': resolve(__dirname, './src/renderer/src/global')
      }
    },
    css: {
      devSourcemap: true,
      modules: {
        localsConvention: 'dashesOnly',
        generateScopedName: '[local]-[hash:5]'
      }
    },
    plugins: [
      react()
    ]
  }
})
