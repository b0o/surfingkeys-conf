export default {
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
  experiments: {
    topLevelAwait: true,
  },
}
