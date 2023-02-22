const { addBeforeLoader, loaderByName } = require('@craco/craco');
const webpack = require('webpack');

module.exports = {
  style: {
    postcss: {
      plugins: [require('tailwindcss')]
    }
  },
  webpack: {
    // though we don't use @ledgerhq, it is a dependency of a dependency, and has
    // caused problems. Seems to require React scripts 5.
    // see: https://github.com/solana-labs/wallet-adapter/issues/499
    plugins: {
      add: [
        new webpack.NormalModuleReplacementPlugin(
          /@ledgerhq\/devices\/hid-framing/,
          '@ledgerhq/devices/lib/hid-framing'
        )
      ]
    },
    configure: (webpackConfig) => {
      // take granular chunking https://github.com/vercel/next.js/issues/7631
      const FRAMEWORK_BUNDLES = [
        'react',
        'react-dom',
        'scheduler',
        'prop-types',
        'element-react',
        'element-theme-default'
      ];
      webpackConfig.optimization.splitChunks.cacheGroups = {
        default: false,
        vendors: false,
        framework: {
          name: 'framework',
          test: new RegExp(
            `(?<!node_modules.*)[\\\\/]node_modules[\\\\/](${FRAMEWORK_BUNDLES.join(
              `|`
            )})[\\\\/]`
          ),
          priority: 40,
          enforce: true
        },
        commons: {
          name: 'commons',
          minChunks: 2,
          priority: 20
        },
        lib: {
          test(module) {
            return (
              module.size() > 160000 &&
              /node_modules[/\\]/.test(module.identifier())
            );
          },
          name(module) {
            const rawRequest =
              module.rawRequest &&
              module.rawRequest.replace(/^@(\w+)[/\\]/, '$1-');
            if (rawRequest) return `${rawRequest}-lib`;

            const identifier = module.identifier();
            const trimmedIdentifier = /(?:^|[/\\])node_modules[/\\](.*)/.exec(
              identifier
            );
            const processedIdentifier =
              trimmedIdentifier &&
              trimmedIdentifier[1].replace(/^@(\w+)[/\\]/, '$1-');

            return `${processedIdentifier || identifier}-lib`;
          },
          priority: 30,
          minChunks: 1,
          reuseExistingChunk: true
        },
        shared: {
          name(module, chunks) {
            const cryptoName = crypto
              .createHash('sha1')
              .update(
                chunks.reduce((acc, chunk) => {
                  return acc + chunk.name;
                }, '')
              )
              .digest('base64')
              .replace(/\//g, '');
            return `shared-${cryptoName}`;
          },
          priority: 10,
          minChunks: 2,
          reuseExistingChunk: true
        }
      };

      webpackConfig.module.rules.push({
        test: /\.(js|ts)$/,
        loader: require.resolve('@open-wc/webpack-import-meta-loader')
      });

      const wasmExtensionRegExp = /\.wasm$/;
      webpackConfig.resolve.extensions.push('.wasm');

      webpackConfig.module.rules.forEach((rule) => {
        (rule.oneOf || []).forEach((oneOf) => {
          if (oneOf.loader && oneOf.loader.indexOf('file-loader') >= 0) {
            oneOf.exclude.push(wasmExtensionRegExp);
          }
        });
      });

      const wasmLoader = {
        test: /\.wasm$/,
        exclude: /node_modules/,
        loaders: ['wasm-loader']
      };

      addBeforeLoader(webpackConfig, loaderByName('file-loader'), wasmLoader);

      return webpackConfig;
    }
  }
};
