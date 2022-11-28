import copy from 'rollup-plugin-copy';
import css from 'rollup-plugin-import-css';
import resolve from '@rollup/plugin-node-resolve';
import clear from 'rollup-plugin-clear';
import eslint from '@rollup/plugin-eslint';
import vue from 'rollup-plugin-vue';
import injectProcessEnv from 'rollup-plugin-inject-process-env';
import WindiCSS from 'rollup-plugin-windicss';
import commonjs from '@rollup/plugin-commonjs';

export default [
  {
    input: 'src/style/index.js',
    output: {
      file: 'dist/style.js',
      format: 'cjs'
    },
    plugins: [
      clear({
        targets: ['dist'],
        watch: true
      }),
      copy({
        targets: [
          { src: 'src/style/inject-iconmonstr.css', dest: 'dist' }
        ]
      }),
      WindiCSS(),
      css()
    ]
  },
  {
    input: 'src/background/background.js',
    output: {
      file: 'dist/background.js',
      format: 'cjs'
    },
    plugins: [
      clear({
        targets: ['dist/style.js'],
        watch: true
      }),
      eslint(),
      copy({
        targets: [
          { src: 'src/manifest.json', dest: 'dist' },
          { src: 'src/_locales/*', dest: 'dist/_locales' },
          { src: ['src/assets/*'], dest: 'dist/assets' }
        ]
      }),
      resolve({
        preferBuiltins: false
      }),
      commonjs()
    ]
  },
  {
    input: 'src/content/content.js',
    output: {
      file: 'dist/content.js',
      format: 'cjs',
    },
    plugins: [
      vue(),
      injectProcessEnv({ 
        NODE_ENV: 'development',
      }),
      resolve({
        preferBuiltins: false
      })
    ]
  },
  {
    input: 'src/options/options.js',
    output: {
      file: 'dist/options.js',
      format: 'cjs'
    },
    plugins: [
      copy({
        targets: [
          { src: 'src/options/options.html', dest: 'dist' }
        ]
      }),
      vue(),
      injectProcessEnv({ 
        NODE_ENV: 'development',
      }),
      resolve({
        preferBuiltins: false
      })
    ]
  },
]