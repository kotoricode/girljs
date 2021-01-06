const esbuild = require("esbuild");
const glslPlugin = require("./glsl-plugin");
const { entryPoints, outfile, target } = require("./build-common");

esbuild.build({
    bundle: true,
    color: true,
    entryPoints,
    minify: true,
    outfile,
    plugins: [glslPlugin],
    target,
});
