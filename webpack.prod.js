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
                parallel: true,
                terserOptions: {
                    mangle: {
                        toplevel: true,
                        properties: {
                            // keep true. webpack-dev uses filepaths as keys
                            keep_quoted: true,
                            regex: /^(?!([au]_|uniform)).+$/i,
                            reserved: []
                        },
                    },
                    module: true,
                    toplevel: true,
                }
            })
        ],
    },
};
