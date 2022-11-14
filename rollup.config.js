import ts from 'rollup-plugin-ts';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
export default {
  input: 'src/sketch.ts',
  output: {
    file: 'public/sketch.js',
    format: 'cjs',
  },
  plugins: [ts(), resolve(), commonjs({ sourceMap: false }), terser()],
};
