const path = require("path");

const shaderFileRegex = /\.(?:glsl)$/i;

module.exports = {
    shaderFileRegex,
    jsFileRegex: /\.js(\?.*)?$/i,
    propMangleRegex: /^(?!([au]_|uniform)).+$/i,
    entry: "./src/main.js",
    output: {
        filename: "main.js",
        path: path.resolve("dist"),
    },
    rawLoader: {
        test: shaderFileRegex,
        loader: "raw-loader"
    }
};
