/* eslint-env node */
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "glsl-plugin",
    setup(build)
    {
        build.onLoad({ filter: /\.glsl$/ }, args =>
        {
            const fullPath = path.resolve(__dirname, args.path);
            const str = fs.readFileSync(fullPath);

            return {
                contents: str,
                loader: "text"
            };
        });
    }
};
