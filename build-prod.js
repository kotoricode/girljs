/* eslint-env node */

const glslPlugin = require("./glsl-plugin");

require("esbuild").build({
    bundle: true,
    color: true,
    entryPoints: ["src/main.js"],
    minify: true,
    outfile: "dist/main.js",
    plugins: [glslPlugin],
    sourcemap: false,
    target: "es2020",
});
