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

const rendererConfig = {
    ...commonConfig,
    target: ['web', 'electron-renderer'],
    name: 'renderer',
    entry: './src/renderer/index.ts',
    output: {
        path: _resolve(__dirname, 'release', 'app', 'dist', 'renderer'),
        filename: '[name].js',
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/renderer/templates/index.html', // Your HTML template for the renderer
            filename: 'index.html',
        }),
        // These will be converted a value. i.g. if (...IS_BETA === true) => if (true === true)
        new webpack.DefinePlugin({
            envVersion: '"' + process.env.npm_package_version + '"',
            envBeta: process.env.npm_package_version.includes('beta'),
        }),
    ],
}

if (process.env.NODE_ENV === 'development') {
    rendererConfig.devServer = {
        static: {
            directory: join(__dirname, 'release', 'app', 'dist', 'renderer'),
        },
        hot: true,
        port: process.env.PORT || 1212, // Port for the dev server
    }
}

export default [mainConfig, rendererConfig]
