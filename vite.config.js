import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

console.log("Copie des textures...");

export default defineConfig({
  base: './',
  plugins: [
    // On copie les textures qui ne sont pas automatiquement copiées par Vite
    viteStaticCopy({
      targets: [
        {
          src:  'asset/img/texture/*.jpg',
          dest: 'assets/texture/',
        },
        {
          src:  'asset/img/info-image/*.png',
          dest: 'assets/info-image/',
        }
      ],
    }),
  ]
})