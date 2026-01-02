export {};

// Build configuration for SillyTavern-MemoryBooks extension
// This handles relative imports from the parent SillyTavern codebase

const result = await Bun.build({
  entrypoints: ['./index.js', './style.css'],
  outdir: './dist',
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
          // Mark all parent directory imports as external
          // These will be resolved at runtime by SillyTavern
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

console.log('✓ Build complete: dist/index.js');
console.log('  Note: SillyTavern imports are marked as external and will be resolved at runtime');
