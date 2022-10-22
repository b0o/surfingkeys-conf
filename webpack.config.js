export default {
  mode:   "production",
  module: {
    rules: [
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
