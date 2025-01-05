import { defineConfig } from "vite"
import vue from '@vitejs/plugin-vue'
import react from '@vitejs/plugin-react'
import path from 'path';

export default defineConfig({
    plugins: [vue(), react()],
    build: {
        lib: {
            entry: {
                core: path.resolve(__dirname, 'src/core/index.ts'),
                react: path.resolve(__dirname, 'src/react/index.tsx'),
                vue: path.resolve(__dirname, 'src/vue/index.ts'),
            },
            name: 'VueReactLibrary',
            formats: ['es', 'cjs'],
            fileName: (format, entryName) => `${entryName}/index.js`,
        },
        rollupOptions: {
            external: ['react', 'vue'],
            output: {
                globals: {
                    react: 'React',
                    vue: 'Vue'
                }
            }
        }
    }
})