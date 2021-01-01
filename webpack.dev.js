const path = require("path");

module.exports = {
    mode: "development",
    entry: "./src/main.js",
    output: {
        filename: "main.js",
        path: path.resolve("dist"),
    },
    module: {
        rules: [
            {
                test: /\.(?:glsl)$/i,
                loader: "raw-loader"
            }
        ],
    }
};
