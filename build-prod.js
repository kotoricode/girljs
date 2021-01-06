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
    minify: true,
    outfile: "dist/main.js",
    plugins: [rawLoader],
    sourcemap: false,
    target: "es2020",
});
