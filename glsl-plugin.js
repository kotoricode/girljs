/* eslint-disable max-len */
/* eslint-env node */
const fs = require("fs");
const path = require("path");

const glslFiles = /\.glsl$/;
const whitespace = /(?<!version|300|es|precision|[high|medium|low]p|uniform|sampler\w+|in|out|vec\d|mat\d|mat\dx\d|void|float|int|bool|double)\s/g;

module.exports = {
    name: "glsl-plugin",
    setup(build)
    {
        build.onLoad({ filter: glslFiles }, args =>
        {
            const fullPath = path.resolve(__dirname, args.path);
            const str = fs.readFileSync(fullPath).toString();
            //str = str.replace(whitespace, "");

            return {
                contents: str,
                loader: "text"
            };
        });
    }
};
