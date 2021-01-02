const {
    entry,
    output,
    rawLoader
} = require("./webpack-template");

module.exports = {
    mode: "development",
    entry,
    output,
    module: {
        rules: [rawLoader],
    }
};
