const { build } = require('esbuild');
const pkg = require('./package.json');

// build esnext
build({
  entryPoints: [pkg.source],
  format: 'esm',
  outfile: pkg.module,
  tsconfig: './tsconfig.build.json',
  minify: true,
  bundle: true,
  logLevel: 'info',
  sourcemap: true,
  external: ['react', 'react-dom']
})
.then(() => {
  console.log('build succeeded');
})
.catch((err) => {
  console.warn('build failed', err);
  process.exit(1);
});

// build commonjs
build({
  entryPoints: [pkg.source],
  format: 'cjs',
  outfile: pkg.main,
  tsconfig: './tsconfig.json',
  minify: true,
  bundle: true,
  logLevel: 'info',
  sourcemap: true,
  external: ['react', 'react-dom']
})
.then(() => {
  console.log('build succeeded');
})
.catch((err) => {
  console.warn('build failed', err);
  process.exit(1)
});
