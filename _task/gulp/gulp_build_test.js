var gulp_build_config  = require('./gulp_dist_common')

module.exports = function (gulp) {
  let env = 'test'      // 环境名称(要跟.xsiliworkflowrc文件里面env对象属性下面的环境名称相对应)

  gulp.task('test_build', function (cb) {
    gulp_build_config.gulp_build(env)
  });
  gulp.task('test_sftp', function (cb) {
    gulp_build_config.gulp_sftp(env)
  });
  gulp.task('mock_sftp', function () {
    gulp_build_config.gulp_sftp_mock(env)
  })
};