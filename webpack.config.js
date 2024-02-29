const path = require('path');

module.exports = (env, argv) => {
  return {
    mode: "production",
    watchOptions: {
      aggregateTimeout: 500,
    },
    entry: './webview-src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'index.js',
    },
    externals: {
      '@editorjs/editorjs': 'EditorJS'
    }
  };
};