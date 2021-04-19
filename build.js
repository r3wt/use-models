const { build } = require('esbuild');
const pkg = require('./package.json');

const modulesToBuild = [
  {
    file: pkg.module,
    format: 'esm'
  },
  {
    file: pkg.main,
    format: 'cjs'
  }
];

Promise.all(modulesToBuild.map(mod=>build({
  entryPoints: [pkg.source],
  format: mod.format,
  outfile: mod.file,
  tsconfig: './tsconfig.build.json',
  minify: true,
  bundle: true,
  logLevel: 'info',
  sourcemap: true,
  external: ['react', 'react-dom']
}).then(()=>console.log('`%s` built successfully',mod.file))))
.then(() => {
  console.log('all modules built successfully');
})
.catch((errors) => {
  console.warn('one or more module builds failed', errors);
  process.exit(1);
});