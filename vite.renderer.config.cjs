const path = require('path');
const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react-swc');
const babel = require('@rollup/plugin-babel');
const tailwindcss = require('@tailwindcss/vite');
const { tanstackRouter } = require('@tanstack/router-vite-plugin');

// https://vitejs.dev/config
module.exports = defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      plugins: ['babel-plugin-react-compiler'],
      include: ['src/**/*'],
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
