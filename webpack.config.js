module.exports = {
  mode:   "production",
  module: {
    rules: [
      {
        test: /\.css$/i,
        type: "asset/source",
      },
      {
        test: /\.json$/i,
        type: "asset/source",
      },
    ],
  },
}
