const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    mode: "production",
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
            },
            {
                test: /\.(?:glsl)$/i,
                loader: "string-replace-loader",
                options: {
                    multiple: [
                        // {
                        //     search: /[\r\n]+/g,
                        //     replace: "\n",
                        // }
                    ]
                }
            }
        ],
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                test: /\.js(\?.*)?$/i,
                terserOptions: {
                    mangle: {
                        toplevel: true,
                        properties: {
                            regex: /^(?!([au]_|uniform)).+$/i,
                        },
                    },
                    module: true
                }
            })
        ],
    },
};
