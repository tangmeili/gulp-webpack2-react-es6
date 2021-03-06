/**
 * Created by Administrator on 2017/5/5.
 */

var gulp_build_config  = require('./gulp_dist_common')

module.exports = function (gulp) {
  let env = 'dist'      // 环境名称(要跟.workflowrc文件里面env对象属性下面的环境名称相对应)
 
  gulp.task('dist_build', function (cb) {
    gulp_build_config.gulp_build(env)
  });
  gulp.task('dist_sftp', function (cb) {
    gulp_build_config.gulp_sftp(env)
  });

};

