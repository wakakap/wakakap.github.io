var resourcesPath = 'live2d/CubismSdkForWeb-4-r.6.2/Samples/Resources/';  // 模型保存的路径
var backImageName = ''; // 背景图片
var modelDir = 'Hiyori';  // 需要加载的模型
var viewscale = 2;

//手机端
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
  viewscale = 1.3;
  var canvas = document.getElementById("live2d");
  canvas.width = 200;
  canvas.height = 500;

}

init();  // 初始化模型，属于message.js文件

// 初始化
function init() {
  var resourcesPaths = `${resourcesPath}`;
  var backImageNames = `${backImageName}`;
  var modelDirString = `${modelDir}`;
  var modelDirs = modelDirString.split(',');
  var viewscales = `${viewscale}`;
  initDefine(resourcesPaths, backImageNames, modelDirs, viewscales);  // lappdefine.ts开放的接口用于初始化常量被编译到bundle.js文件里
}

// var canvas = document.getElementById('live2d');
// var live2dbubble = document.getElementById('live2dbubble');

// canvas.addEventListener('click', function () {
//   // Show the bubble with a message
//   live2dbubble.innerHTML = 'live2d还在建设中~没有更多互动~';
//   live2dbubble.style.opacity =  1;
//   // Hide the bubble after 5 seconds
//   setTimeout(function () {
//     live2dbubble.style.opacity = 0;
//   }, 5000);
// });




// window.addEventListener('resize', () => {
//   // 获取新的视口宽度和高度
//   const newViewportWidth = window.innerWidth;
//   const newViewportHeight = window.innerHeight;

//   // 更新 canvas 的宽度和高度
//   canvas.width = newViewportWidth;
//   canvas.height = newViewportHeight;


// });

// // 监听复制（这里简单添加了一些事件，可以添加更多的事件，比如报时等）
// (function() {
//   document.addEventListener('copy',(e)=>{
//     e.preventDefault();
//     e.stopPropagation();
//     showMessage('copy，欸嘿嘿~', 5000, true); // 显示信息
//   })
// }());
// // 工具栏的点击事件
// $('.tool .fui-home').click(function (){
// });

// $('.tool .fui-eye').click(function (){
// });

// $('.tool .fui-chat').click(function (){
// });

// $('.tool .fui-user').click(function (){
// });

// $('.tool .fui-info-circle').click(function (){
// });

// $('.tool .fui-cross').click(function (){
// });

// $('.tool .fui-photo').click(function (){
// });


// function showMessage(text, timeout, flag){
//   if(flag || sessionStorage.getItem('waifu-text') === '' || sessionStorage.getItem('waifu-text') === null){
//       if(Array.isArray(text)) text = text[Math.floor(Math.random() * text.length + 1)-1];
//       //console.log(text);
//       if(flag) sessionStorage.setItem('waifu-text', text);
//       $('.live2d-tips').stop();
//       $('.live2d-tips').html(text).fadeTo(200, 1);
//       if (timeout === undefined) timeout = 5000;
//       hideMessage(timeout);
//   }
// }

// function hideMessage(timeout){
//   $('.live2d-tips').stop().css('opacity',1);
//   if (timeout === undefined) timeout = 5000;
//   window.setTimeout(function() {sessionStorage.removeItem('waifu-text')}, timeout);
//   $('.live2d-tips').delay(timeout).fadeTo(200, 0);
// }
