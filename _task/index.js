/**
 * Created by Administrator on 2017/5/4.
 */
var fs = require('fs')
var path = require('path')

module.exports = function (gulp) {
  fs.readdirSync(path.join(__dirname, './gulp/')).filter(function (file) {
    return (file.indexOf('.') !==0 ) && (file.indexOf('gulp_build_') === 0);
  }).forEach(function (file) {
    var registerTask = require(path.join(__dirname, './gulp', file));
    registerTask(gulp)
  })
}