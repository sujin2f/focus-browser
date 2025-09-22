const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

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
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader',
                        options: {
                            minimize: true, // Minify HTML
                        },
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'], // Resolve .ts and .js extensions
        alias: {
            '@main': path.resolve(__dirname, 'src', 'main'),
            '@src': path.resolve(__dirname, 'src'),
            '@controllers': path.resolve(
                __dirname,
                'src',
                'main',
                'controllers',
            ),
            '@home': path.resolve(__dirname, 'src', 'renderer'),
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
    },

    output: {
        path: path.resolve(__dirname, 'release', 'app', 'dist'),
        filename: '[name].js',
    },
    node: {
        __dirname: false,
        __filename: false,
    },
}

const rendererConfig = {
    ...commonConfig,
    target: ['web', 'electron-renderer'],
    name: 'renderer',
    entry: './src/renderer/controller.ts',
    output: {
        path: path.resolve(__dirname, 'release', 'app', 'dist', 'renderer'),
        filename: '[name].js',
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/renderer/index.html', // Your HTML template for the renderer
            filename: 'index.html',
        }),
        new HtmlWebpackPlugin({
            template: './src/renderer/welcome.html',
            filename: 'welcome.html',
        }),
    ],
}

if (process.env.NODE_ENV === 'development') {
    rendererConfig.devServer = {
        static: {
            directory: path.join(
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
}

module.exports = [mainConfig, rendererConfig]
