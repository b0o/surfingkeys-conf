import TerserPlugin from "terser-webpack-plugin"

export default {
  mode: "production",
  module: {
    rules: [
      {
        test: /\.json$/i,
        type: "asset/source",
      },
    ],
  },
  optimization: {
    // Disable terser's default behavior of creating a separate surfingkeys.js.LICENSE.txt file
    // because this trips up our gulpfile
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          format: {
            comments: false,
          },
        },
      }),
    ],
  },
  experiments: {
    topLevelAwait: true,
  },
}
