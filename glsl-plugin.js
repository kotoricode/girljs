/* eslint-env node */
const fs = require("fs");
const path = require("path");

const glslFiles = /\.(?:vert|frag)$/;

module.exports = {
    name: "glsl-plugin",
    setup(build)
    {
        build.onLoad({ filter: glslFiles }, args =>
        {
            const fullPath = path.resolve(__dirname, args.path);
            const str = fs.readFileSync(fullPath).toString();

            return {
                contents: str,
                loader: "text"
            };
        });
    }
};
