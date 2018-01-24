/**
 * Created by Administrator on 2017/5/4.
 */
var path = require('path');
var fs = require('fs')

var entryList = {}
var htmlTrunk = {}
var Entry

function readdirs(dirPath) {
  var files = fs.readdirSync(dirPath) //拿到文件目录下的所有文件名
  files.map(function(file) {
    var subPath = path.resolve(dirPath, file) //拼接为绝对路径
    var stats = fs.statSync(subPath) //拿到文件信息对象
    if (stats.isDirectory()) { //判断是否为文件夹类型
      return readdirs(subPath) //递归读取文件夹
    }
    let index = subPath.indexOf('js\\') + 3
    if(subPath.indexOf('.jsx')>0){
      entryList[subPath.substring(index, subPath.length - 4).replace(/\\/g,'\/')] = subPath.substring(0, subPath.length - 4)
    } else {
      entryList[subPath.substring(index, subPath.length - 3).replace(/\\/g,'\/')] = subPath.substring(0, subPath.length - 3)
    }
  })
  return entryList
}
Entry = readdirs(path.join(__dirname, '../../src/js'))

for (var key of Object.keys(Entry)) {
  htmlTrunk[key] = {
    title: '',                  // 自动生成网页标题
    filename: 'html/' + key + '.html',     // 文件名字
    template: Entry[key].replace(/js/,'html') +　'.html', // 模板地址
    chunks: [key]              // 使用chunks 需要指定entry 入口文件中的哪一个模块  从上面的Entry里面选择填写
  }
}

module.exports.Entry = Entry
module.exports.htmlTrunk = htmlTrunk
