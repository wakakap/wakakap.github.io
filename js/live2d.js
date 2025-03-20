var resourcesPath = './live2d/CubismSdkForWeb-4-r.6.2/Samples/Resources/';  // 使用相对路径
var backImageName = 'back_class_normal.png';  // 确保有扩展名
var modelDir = 'Hiyori';
var viewscale = 2;

// 手机端适配
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
  viewscale = 1.3;
  var canvas = document.getElementById("live2d");
  canvas.width = 200;
  canvas.height = 500;
}

init();

function init() {
  var resourcesPaths = `${resourcesPath}`;
  var backImageNames = `${backImageName}`;
  var modelDirString = `${modelDir}`;
  var modelDirs = modelDirString.split(',');
  var viewscales = `${viewscale}`;
  initDefine(resourcesPaths, backImageNames, modelDirs, viewscales);
}