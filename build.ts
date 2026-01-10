export {};

const result = await Bun.build({
  entrypoints: ['./index.js', './style.css'],
  outdir: './',
  naming: "[dir]/[name].build.[ext]",
  minify: true,
  sourcemap: 'external',
  target: 'browser',
  format: 'esm',
  splitting: false,

  // Plugin to mark all parent directory imports as external
  // This ensures SillyTavern imports aren't bundled
  plugins: [
    {
      name: 'externalize-sillytavern-imports',
      setup(build) {
        // Match any import that goes to parent directories (../)
        build.onResolve({ filter: /^\.\.\/.*/ }, (args) => {
          return {
            path: args.path,
            external: true,
          };
        });
      },
    },
  ],
});

if (!result.success) {
  console.error('❌ Build failed:');
  for (const message of result.logs) {
    console.error(message);
  }
  process.exit(1);
}

console.log('✓ Build complete: index.build.js');
console.log('  Note: SillyTavern imports are marked as external and will be resolved at runtime');
