const { build } = require('esbuild');
const pkg = require('./package.json');

const modulesToBuild = [pkg.module,pkg.main];

Promise.all(modulesToBuild.map(moduleName=>build({
  entryPoints: [pkg.source],
  format: 'esm',
  outfile: pkg.module,
  tsconfig: './tsconfig.build.json',
  minify: true,
  bundle: true,
  logLevel: 'info',
  sourcemap: true,
  external: ['react', 'react-dom']
}).then(()=>console.log('`%s` built successfully',moduleName))))
.then(() => {
  console.log('all modules built successfully');
})
.catch((errors) => {
  console.warn('one or more module builds failed', errors);
  process.exit(1);
});