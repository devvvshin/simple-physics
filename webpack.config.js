var path = require('path');

module.exports = {
    entry: {
      main: './src/main.js'
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: 'main.js'
    },
    externals:
    {
      "fs": "require('fs')",
    },
    module: {
      preLoaders: [
        {
          test: /\.(obj|glsl|vert|frag)$/,
          exclude: /node_modules/,
          loader: 'raw'
        },
        {
          test: /\.(glsl|vert|frag)$/,
          exclude: /node_modules/,
          loader: 'glslify'
        }
      ],
      loaders: [
          {
            loader: 'babel',
            exclude: /node_modules/,
            query: {
              presets: ['es2015', 'react'],
            }
          }
      ]
    }
};
