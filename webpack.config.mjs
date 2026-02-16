import { resolve as _resolve, join, dirname } from 'path'
import { fileURLToPath } from 'url'
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const commonConfig = {
    mode: process.env.NODE_ENV || 'development',
    devtool: 'source-map',
    output: {
        clean: true, // Clean the output directory before emit.
        library: { type: 'commonjs2' },
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.s?(c|a)ss$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            sourceMap: true,
                            importLoaders: 1,
                        },
                    },
                    'sass-loader',
                ],
                include: /\.module\.s?(c|a)ss$/,
            },
            {
                test: /\.s?css$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader',
                    'postcss-loader',
                ],
                exclude: /\.module\.s?(c|a)ss$/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'], // Resolve .ts and .js extensions
        alias: {
            '@main': _resolve(__dirname, 'src', 'main'),
            '@src': _resolve(__dirname, 'src'),
            '@home': _resolve(__dirname, 'src', 'renderer'),
        },
    },
}

const mainConfig = {
    ...commonConfig,
    target: 'electron-main',
    name: 'main',
    entry: {
        'main/index': './src/main/index.ts',
        preload: './src/preload.ts',
        'adblocker-preload':
            './node_modules/@ghostery/adblocker-electron-preload/dist/index.cjs',
    },
    output: {
        path: _resolve(__dirname, 'release', 'app', 'dist'),
        filename: '[name].js',
        chunkFilename: '[name].chunk.js',
    },
    plugins: [
        // These will be converted a value. i.g. if (...IS_BETA === true) => if (true === true)
        new webpack.EnvironmentPlugin({
            VERSION: process.env.npm_package_version,
            IS_BETA: process.env.npm_package_version.includes('beta'),
        }),
    ],
}

const renderer = {
    ...commonConfig,
    target: ['web', 'electron-renderer'],
    name: 'renderer',
    entry: {
        'renderer/index': './src/renderer/src/index.ts',
        'renderer/dashboard': './src/renderer/src/entries/dashboard.ts',
        'renderer/main': './src/renderer/src/entries/main.ts',
        'renderer/bookmarks': './src/renderer/src/entries/bookmarks.ts',
        'renderer/anchors': './src/renderer/src/entries/anchors.ts',
        'renderer/history': './src/renderer/src/entries/history.ts',
        'renderer/popup': './src/renderer/src/entries/popup.ts',
        'renderer/keystrokes': './src/renderer/src/entries/keystrokes.ts',
        'renderer/settings': './src/renderer/src/entries/settings.ts',
        'renderer/shortcuts': './src/renderer/src/entries/shortcuts.ts',
        'renderer/find': './src/renderer/src/entries/find.ts',
    },
    output: {
        path: _resolve(__dirname, 'release', 'app', 'dist', 'renderer'),
        filename: '[name].js',
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/renderer/templates/index.html',
            filename: 'index.html',
            chunks: ['renderer/index'],
        }),
        new HtmlWebpackPlugin({
            template: './src/renderer/templates/dashboard.html',
            filename: 'dashboard.html',
            chunks: ['renderer/dashboard'],
        }),
        new HtmlWebpackPlugin({
            template: './src/renderer/templates/main.html',
            filename: 'main.html',
            chunks: ['renderer/main'],
        }),
        new HtmlWebpackPlugin({
            template: './src/renderer/templates/bookmarks.html',
            filename: 'bookmarks.html',
            chunks: ['renderer/bookmarks'],
        }),
        new HtmlWebpackPlugin({
            template: './src/renderer/templates/anchors.html',
            filename: 'anchors.html',
            chunks: ['renderer/anchors'],
        }),
        new HtmlWebpackPlugin({
            template: './src/renderer/templates/history.html',
            filename: 'history.html',
            chunks: ['renderer/history'],
        }),
        new HtmlWebpackPlugin({
            template: './src/renderer/templates/popup.html',
            filename: 'popup.html',
            chunks: ['renderer/popup'],
        }),
        new HtmlWebpackPlugin({
            template: './src/renderer/templates/keystrokes.html',
            filename: 'keystrokes.html',
            chunks: ['renderer/keystrokes'],
        }),
        new HtmlWebpackPlugin({
            template: './src/renderer/templates/settings.html',
            filename: 'settings.html',
            chunks: ['renderer/settings'],
        }),
        new HtmlWebpackPlugin({
            template: './src/renderer/templates/shortcuts.html',
            filename: 'shortcuts.html',
            chunks: ['renderer/shortcuts'],
        }),
        new HtmlWebpackPlugin({
            template: './src/renderer/templates/find.html',
            filename: 'find.html',
            chunks: ['renderer/find'],
        }),
        // These will be converted a value. i.g. if (...IS_BETA === true) => if (true === true)
        new webpack.DefinePlugin({
            envVersion: '"' + process.env.npm_package_version + '"',
            envBeta: process.env.npm_package_version.includes('beta'),
        }),
    ],
    devServer:
        process.env.NODE_ENV === 'development'
            ? {
                  static: {
                      directory: join(
                          __dirname,
                          'release',
                          'app',
                          'dist',
                          'renderer',
                      ),
                  },
                  hot: true,
                  port: process.env.PORT || 1212, // Port for the dev server
              }
            : undefined,
}

export default [mainConfig, renderer]
