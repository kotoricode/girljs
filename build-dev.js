const esbuild = require("esbuild");
const glslPlugin = require("./glsl-plugin");
const { entryPoints, outfile, target } = require("./build-common");

esbuild.build({
    bundle: true,
    color: true,
    entryPoints,
    minify: false,
    outfile,
    plugins: [glslPlugin],
    target,
});
