import resolve from '@rollup/plugin-node-resolve';
import esbuild from 'rollup-plugin-esbuild';
import postcss from 'rollup-plugin-postcss';
import dts from 'rollup-plugin-dts';

const external = ['react', 'react-dom', 'react/jsx-runtime'];

export default [
  {
    input: 'src/index.ts',
    external,
    output: {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true,
    },
    plugins: [
      resolve({ extensions: ['.js', '.jsx', '.ts', '.tsx'] }),
      esbuild({ jsx: 'automatic', sourceMap: true }),
      postcss({
        modules: true,
        extract: 'index.css',
        sourceMap: true,
      }),
    ],
  },
  {
    input: 'src/index.ts',
    external,
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
];
