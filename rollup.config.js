import copy from 'rollup-plugin-copy';
import css from 'rollup-plugin-css-only';
import resolve from '@rollup/plugin-node-resolve';
import clear from 'rollup-plugin-clear'

export default [
  {
    input: 'src/background/background.js',
    output: {
      file: 'dist/background/background.js',
      format: 'cjs'
    },
    plugins: [
      clear({
        targets: ['dist'],
        watch: true
      }),
      copy({
        targets: [
          { src: 'src/manifest.json', dest: 'dist' },
          { src: 'src/_locales/*', dest: 'dist/_locales' },
          { src: ['src/assets/*'], dest: 'dist/assets' }
        ]
      }),
      resolve({
        preferBuiltins: false
      })
    ]
  },
  {
    input: 'src/content/content.js',
    output: {
      file: 'dist/content/content.js',
      format: 'cjs'
    },
    plugins: [
      css({
        output: 'style.css'
      })
    ]
  }
]