const {
    entry,
    output,
    rawLoader
} = require("./webpack-common");

module.exports = {
    mode: "development",
    entry,
    output,
    module: {
        rules: [rawLoader],
    }
};
