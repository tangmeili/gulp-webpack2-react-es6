/**
 * Created by Administrator on 2017/6/29.
 */

var async = require('async');
var del = require('del');
var webpack = require('webpack');
var gulp = require('gulp');
var webpackConfig = require('../webpack/webpack.config.common');
var replace = require('gulp-replace');
var sftp = require("gulp-sftp");
var changed = require("gulp-changed");
var util = require('gulp-util');
var minifyCss = require("gulp-minify-css");
var minifyHtml = require("gulp-minify-html");
var uglify = require("gulp-uglify");
var sass = require('gulp-sass');
var less = require('gulp-less');
var imagemin = require('gulp-imagemin')
var pngquant = require('imagemin-pngquant');
var config = require('rc')('workflow')
var GulpSSH = require('gulp-ssh')

var outputDir = "build";

module.exports.gulp_build= function (env) {
  // 构建以后全部放在build目录下
  env = outputDir + '/' + env;

  async.series([
    function (cb) {
      del([`./${env}/**/*`]).then(function () {
      });
      cb();
    },
    // function(cb){
    //   gulp.src(`./src/**/*.scss`)
    //     .pipe(sass().on('error', sass.logError))
    //     .pipe(minifyCss()) //压缩css
    //     .pipe(gulp.dest(`./src/`));
    //
    //   gulp.src(`./src/**/*.less`)
    //     .pipe(less().on('error', sass.logError))
    //     .pipe(minifyCss()) //压缩css
    //     .pipe(gulp.dest(`./src/`));
    //   cb()
    // },
    function (cb) {
      util.log("start web config");
      // var webConfig = Object.create(webpackConfig(env, config.env[`${env}`]['domain'] + config['projectName'] + '/'));
      var webConfig = Object.create(webpackConfig(env));
      // run webpack
      webpack(webConfig, function (err, stats) {
        if (err) throw new gutil.PluginError("webpack:_task", err);
        util.log("[webpack:_task]", stats.toString({colors: true}));
        cb();
      });
      // cb()
    },
    function (cb) {
      gulp.src(`./${env}/**/*.swf`)
        .pipe(gulp.dest(`./${env}/`))

      gulp.src([`./${env}/*.html`, `./${env}/**/*.html`])
        .pipe(replace(/\bhttp:\/\/localhost.*?\.js\b/g, ""))
        .pipe(minifyHtml())
        .pipe(gulp.dest(`./${env}/`))

      gulp.src(`./${env}/**/*.css`)
        .pipe(minifyCss()) //压缩css
        .pipe(gulp.dest(`./${env}/`))

      gulp.src([`./${env}/**/*.{png|jpg|gif}`,`./${env}/*.{png|jpg|gif}`])
        .pipe(imagemin({
          progressive: true,
          use: [pngquant()] //使用pngquant深度压缩png图片的imagemin插件
        })) //压缩图片
        .pipe(gulp.dest(`./${env}/`))

      gulp.src(`./src/assets/**/*`)
        .pipe(gulp.dest(`./${env}/assets/`))

      // gulp.src([path.join(__dirname, '..', '..', stats.json), path.join(__dirname, '..', '..', 'src/html/*.html')])
      //   .pipe( revCollector({
      //     replaceReved: true,
      //   }) )
      //   .pipe( gulp.dest('./test/') );
      cb()
    }
  ], function (err) {
    if(err){
      util.log(err);
      return;
    }
    else {
      util.log('ok')
      // task_sftp(['./test/**/*'],cb);
    }
  })
}

module.exports.gulp_sftp = function (envoriment) {
  var ftpConfig = config.env[`${envoriment}`]['ftp']
  // ftpConfig.remotePath = ftpConfig.remotePath + config['projectName']

  async.series({
    delete: function (cb) {
      console.log('删除服务器上现有文件...')
      var gulpSSH = new GulpSSH({
        ignoreErrors: false,
        sshConfig: {
          host: ftpConfig.host,
          port: ftpConfig.port,
          username: ftpConfig.user,
          password: ftpConfig.pass
        }
      })
      gulpSSH.exec(`rm -rf ${ftpConfig.remotePath}/`).on('end', function () {
        process.exit();
        gulpSSH.close()
      })
      cb(null, 'delete')
    },
    upload: function (cb) {
      setTimeout(uploader, 2000)
      function uploader() {
        console.log('开始上传项目文件...')
        gulp.src([`./${outputDir}/${envoriment}/**/*`], {buffer: false})
          .pipe(sftp(ftpConfig))
          .on('error', function (err) {
            console.log(err.message)
          })
        cb(null, 'upload')
      }
    }
  }, function (error, result) {

  })

}

module.exports.gulp_sftp_mock = function (envoriment) {
  var ftpConfig = config.env[`${envoriment}`]['ftp']
  ftpConfig.remotePath = ftpConfig.remotePath + '/mock'

  async.series({
    delete: function (cb) {
      console.log('删除服务器上现有文件...')
      var gulpSSH = new GulpSSH({
        ignoreErrors: false,
        sshConfig: {
          host: ftpConfig.host,
          port: ftpConfig.port,
          username: ftpConfig.user,
          password: ftpConfig.pass
        }
      })
      gulpSSH.exec(`rm -rf ${ftpConfig.remotePath}/`).on('end', function () {
        process.exit();
        gulpSSH.close()
      })
      cb(null, 'delete')
    },
    upload: function (cb) {
      setTimeout(uploader, 2000)
      function uploader() {
        console.log('开始上传项目文件...')
        gulp.src([`./mock/**/*`], {buffer: false})
          .pipe(sftp(ftpConfig))
          .on('error', function (err) {
            console.log(err.message)
          })
        cb(null, 'upload')
      }
    }
  }, function (error, result) {

  })
}



