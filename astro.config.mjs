// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: 'https://arno-o.github.io',
  base: 'j31-fish-tinder',
  vite: {
    plugins: [tailwindcss()],
  },
  devToolbar: {
    enabled: false
  } 
});