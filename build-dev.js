const rawLoader = require("esload").esload({
    name: "raw-loader",
    outdir: "dist",
    rules: [
        {
            test: /\.(?:glsl)$/i,
            use: ["raw-loader"]
        }
    ]
});

require("esbuild").build({
    bundle: true,
    color: true,
    define: { __webpack_public_path__: "\"/\"" },
    entryPoints: ["src/main.js"],
    minify: false,
    outfile: "dist/main.js",
    plugins: [rawLoader],
    sourcemap: true,
    target: ["esnext"],
});
