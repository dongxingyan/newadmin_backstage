var path                  = require('path');
var fs                    = require('fs');
var HtmlwebpackPlugin     = require('html-webpack-plugin');
var merge                 = require('webpack-merge');
var webpack               = require('webpack');
var ROOT_PATH             = path.resolve(__dirname);
var APP_PATH              = path.resolve(ROOT_PATH, './source');
var BUILD_PATH            = path.resolve(ROOT_PATH, './dist');
var TARGET                = process.env.npm_lifecycle_event;
var exec                  = require('child_process').exec, child;
var OpenBrowserPlugin     = require('open-browser-webpack-plugin');
var CommonsChunkPlugin    = require("webpack/lib/optimize/CommonsChunkPlugin");
var TransferWebpackPlugin = require('transfer-webpack-plugin');
var CleanPlugin           = require('clean-webpack-plugin');
var autoprefixer        = require('autoprefixer');

/**webpack配置 */
var configObj = {};
/**通用配置 */
var commonConfig = {
    entry: {
        'bundle': path.resolve(__dirname, APP_PATH + '/entry'),
        'utils': ['angular', 'angular-ui-router']
    },
    output: {
        path: path.resolve(__dirname, BUILD_PATH),
        filename: "[name]_[hash].js"
    },
    externals: {
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: 'style-loader!css-loader' },
            { test: /\.html$/, loader: "html?minimize=false" },
            { test: /\.json$/, loader: "json" },
            { test: /\.less$/, loader: "style!css-loader?importLoaders=1!postcss-loader!less" },
            { test: /\.styl$/, loader: "style!css-loader?importLoaders=1!postcss-loader!stylus" },
            { test: /\.scss/, loader: "style!css-loader?importLoaders=1!postcss-loader!sass" },
            { test: /\.(jpg|gif|png|woff|woff2|svg|eot|ttf)(\?.*)?$/, loader: 'url-loader' },
            { test: /\.ts$/, loader: 'babel!ts' }
        ]
    },

    //配置短路径引用
    resolve: {
        // 模块别名列表（模块别名相对于当前上下文导入）
        alias: {
            source: path.resolve(__dirname, './source'),
            common: path.resolve(__dirname, './source/common'),
            components: path.resolve(__dirname, './source/components'),
            language: path.resolve(__dirname, './source/language'),
            libs: path.resolve(__dirname, './source/libs'),
            pages: path.resolve(__dirname, './source/pages'),
            static: path.resolve(__dirname, './source/static'),
            utils: path.resolve(__dirname, './source/utils')
        },
        extensions: ['', '.js', '.ts', '.html', '.json', '.less', '.css', '.scss', '.jpg', '.gif', '.png', '.woff', '.woff2', '.svg', '.eot', '.ttf']
    },
    postcss: function () {
        return [ autoprefixer];
    },
    plugins: [
        new CommonsChunkPlugin({ name: 'common', filename: 'common_[hash].js' }),
        new HtmlwebpackPlugin({
            title: 'DOM',
            filename: 'index.html',
            template: APP_PATH + '/index.html',
        }),
        new HtmlwebpackPlugin({
            title: 'DOM',
            filename: 'login.html',
            template: APP_PATH + '/login.html',
        }),
        new webpack.ProvidePlugin({
            $:"jquery",
            jQuery:"jquery",
            "window.jQuery":"jquery"
        }),

        new TransferWebpackPlugin([
            { from: './source/static/', to: './libs' }
            ], '')

    ],
};

if (TARGET === 'start') {
    // 开发时测试用的webpack-dev-server版本
    configObj = merge(commonConfig, {
        devServer: {
            hot: true,
            inline: true,
            progress: true,
            host: process.env.HOST,
            port: "31001"
        },
        devtool: "cheap-module-source-map",
        plugins: [
            new webpack.HotModuleReplacementPlugin(),
            new OpenBrowserPlugin({ url: "http://localhost:31001" })
        ]
    });
} else if (TARGET === 'build') {
    // 测试版发布
    configObj = merge(commonConfig, {
        output: {
            path: BUILD_PATH
        },
        plugins: []
    });
    configObj.plugins.push(new CleanPlugin(['build', 'dist'], { "verbose": true }))
} else if (TARGET === 'publish') {
    // 正式版发布
    configObj = merge(commonConfig, {
        output: {
            path: BUILD_PATH
        },
        plugins: [
            new webpack.optimize.UglifyJsPlugin({})
        ]
    });
    configObj.plugins.push(new CleanPlugin(['build', 'dist'], { "verbose": true }))
}

module.exports = configObj;
