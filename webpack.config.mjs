import { resolve as _resolve, join, dirname } from 'path'
import { fileURLToPath } from 'url'
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const commonConfig = {
    mode: process.env.NODE_ENV || 'development',
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
                test: /\.s?css$/,
                use: [
                    process.env.NODE_ENV === 'development'
                        ? 'style-loader'
                        : MiniCssExtractPlugin.loader,
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
            '@home': _resolve(__dirname, 'src', 'renderer', 'src'),
        },
    },
    optimization: {
        minimize: process.env.NODE_ENV !== 'development',
        splitChunks: {
            chunks: 'all',
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
        'child-process': './src/child-process/index.ts',
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
    entry: {},
    output: {
        path: _resolve(__dirname, 'release', 'app', 'dist', 'renderer'),
        filename: '[name].js',
    },
    plugins: [
        // These will be converted a value. i.g. if (...IS_BETA === true) => if (true === true)
        new webpack.DefinePlugin({
            envVersion: '"' + process.env.npm_package_version + '"',
            envBeta: process.env.npm_package_version.includes('beta'),
            envDev: process.env.NODE_ENV === 'development',
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

const pages = [
    'welcome',
    'main',
    'bookmarks',
    'anchors',
    'history',
    'popup',
    'keystrokes',
    'settings',
    'shortcuts',
    'find',
    'offline',
    'loading',
    'importer',
]

pages.forEach((page) => {
    renderer.entry[`renderer/${page}`] =
        `./src/renderer/src/entry-points/${page}.ts`
    renderer.plugins.push(
        new HtmlWebpackPlugin({
            template: `./src/renderer/templates/${page}.html`,
            filename: `${page}.html`,
            chunks: [`renderer/${page}`],
        }),
        new MiniCssExtractPlugin({
            filename: 'style.css',
        }),
    )
})

if (process.env.NODE_ENV === 'development') {
    mainConfig.devtool = 'source-map'
    renderer.devtool = 'source-map'
}

export default [mainConfig, renderer]
