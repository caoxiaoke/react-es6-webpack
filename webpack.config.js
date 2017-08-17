/**
 * __dirname是node.js中的一个全局变量，它指向当前执行脚本所在的目录
 * 注意这里是exports不是export
 */

/**
 * resolve属性中的extensions数组中用于配置程序可以自行补全哪些后缀
 * 比如说我们要require一个common.js文件，添加了这个配置我们只要写：require('common')
 */

const webpack = require('webpack');
const path = require('path');
const glob = require('glob');
//获取入口js
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
// 删除文件夹
var CleanPlugin = require('clean-webpack-plugin');

var entries = getEntry('src/**/*.js', 'src');
var prod = process.env.NODE_ENV === 'production' ? true : false;

module.exports = {
    entry: entries,      //获取项目入口js文件
    output: {//输出目录
        path: path.join(__dirname, "build"), //文件输出目录
        publicPath: 'build',
        filename: "[name].min.js",      //根据入口文件输出的对应多个文件名
    },
    module: {
        rules:  [
            //css和sass处理
            {
                test: /\.css|\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'sass-loader', 'resolve-url-loader'],
                })
            },
            { test: /\.less/,loader: 'style-loader!css-loader!less-loader'},
            {
                test: /\.(png|jpg|jpeg|gif)$/, loader: 'url-loader',
                query:{
                    limit:'10000', name:'img/[name].[ext]'
                }
            },
            // image & font
            { test: /\.(woff|woff2|eot|ttf|otf)$/i, loader: 'url-loader?limit=8192&name=[name].[ext]'},
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                query: {
                    presets:['react','es2015']
                }
            }
        ]
    },
    resolve:{
        extensions:['.js','.json']
    },
    devtool: prod ? null : 'source-map',//生成sourcemap,便于开发调试
    plugins: [
        // new  webpack.optimize.CommonsChunkPlugin({
        //     // 与 entry 中的 entries 对应
        //     name: entries,
        //     // 输出的公共资源名称
        //     filename: 'common.min.js',
        //     // 对所有entry实行这个规则
        //     minChunks: Infinity
        // }),

        // 构建之前先删除dist目录下面的文件夹
        new CleanPlugin(['build','dist']),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendors',
            filename: 'common/vendors.js',
            minChunks: 3
        }),
        // 分离css extractTextPlugin 指定生成的css文件路径
        // new ExtractTextPlugin('[name].min.css'),
        new ExtractTextPlugin({
            filename:  (getPath) => {
                return getPath('css/[name].min.css').replace('\\js', '').replace('\\', '');
            },
            allChunks: true
        }),
        //new ExtractTextPlugin('css/style.css'),
        //如果你想设置更多，可以这样写：
        // new ExtractTextPlugin({
        //     filename:'[name].css'
        // }),

        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("production")
            }
        }),
        // 自动刷新插件
        new BrowserSyncPlugin({
            // browse to http://localhost:3000/src/views during development,
            host: 'localhost',
            port: 3000,
            server: { baseDir: ['./'] }
        })
    ],
};

if (process.env.NODE_ENV === 'production') {// 判断开发环境还是生产环境,添加uglify等插件
    module.exports.plugins = (module.exports.plugins || [])
        .concat([
            new webpack.DefinePlugin({
                "process.env": {
                    NODE_ENV: JSON.stringify("production")
                }
            }),
            // 压缩插件 自带  //混合压缩js
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false,
                    drop_console: false,
                },
                mangle: {
                    except: ['$super', '$', 'exports', 'require']
                    //以上变量‘$super’, ‘$’, ‘exports’ or ‘require’，不会被混淆
                },
            }),
            //css压缩 需要安装 optimize-css-assets-webpack-plugin
            new OptimizeCssAssetsPlugin({
                cssProcessorOptions: {
                    discardComments: {
                        removeAll: true
                    }
                },
                canPrint: false
            }),
        ]);
} else {
    //dev
    console.log('dev');
    // module.exports.devServer = {
    //     contentBase: './src/views',//本地服务器所加载的页面所在的目录
    //     historyApiFallback: true,//不跳转
    //     inline: true,//实时刷新
    //     colors:  true,//终端中输出结果为彩色
    // };
}
/**
 * 获取入口的函数
 */
function getEntry(globPath, pathDir) {
    var files = glob.sync(globPath);
    var entries = {},
        entry, dirname, basename, pathname, extname;

    for (var i = 0; i < files.length; i++) {
        entry = files[i];
        dirname = path.dirname(entry);
        extname = path.extname(entry);
        basename = path.basename(entry, extname);
        pathname = path.join(dirname, basename);
        pathname = pathDir ? pathname.replace(new RegExp('^' + pathDir), '') : pathname;
        entries[pathname] = ['./' + entry];
    }
    return entries;
}

/**
 * 配置plugins
 */
var pages = Object.keys(getEntry('src/*/*.html', 'src'));

pages.forEach(function(pathname) {
    var conf = {
        filename: pathname + '.html', //生成的html存放路径，相对于path
        template: 'src' + pathname + '.html', //html模板路径
        inject: false,    //js插入的位置，true/'head'/'body'/false
    };
    if (pathname in entries) {
        conf.inject = false;
        conf.chunks = ['vendors', pathname];//引入特定的js
    }
    module.exports.plugins.push(new HtmlWebpackPlugin(conf));
});
