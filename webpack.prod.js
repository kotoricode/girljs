const TerserPlugin = require("terser-webpack-plugin");
const {
    shaderFileRegex,
    propMangleRegex,
    jsFileRegex,
    entry,
    output,
    rawLoader
} = require("./webpack-template");

module.exports = {
    mode: "production",
    entry,
    output,
    module: {
        rules: [
            rawLoader,
            {
                test: shaderFileRegex,
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
                test: jsFileRegex,
                terserOptions: {
                    mangle: {
                        toplevel: true,
                        properties: {
                            regex: propMangleRegex,
                        },
                    },
                    module: true
                }
            })
        ],
    },
};
