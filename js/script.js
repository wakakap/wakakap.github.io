//动态检测屏幕
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
  console.log("手机端");

  //更换meta viewport
  var metaViewport = document.querySelector('meta[name="viewport"]');
  if (metaViewport) {
    metaViewport.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0");
    console.log("更换meta viewport");
  }

  //更换css，放到html中直接改了
  // var linkElement = document.querySelector('link[href="css/style.css"]');
  // if (linkElement) {
  //   linkElement.setAttribute('href', 'css/style_forphone.css');
  //   console.log("更换style_forphone.css");
  // }
  

  //twitter相关
  var toggleButton = document.querySelector('.togglebutton');
  var twitterbox = document.querySelector('#twitterbox');

  // const tweetElement = document.querySelector("#my-tweets");

  // tweetElement.setAttribute("data-width", "100%");
  // tweetElement.setAttribute("data-height", "800");

  if (twitterbox) {
    // 显示Twitter
    twitterbox.style.display = 'none';
    
    // 绑定按钮触摸事件
    toggleButton.addEventListener('touchstart', function() {
      if (twitterbox.style.display === 'block') {
        // 隐藏 Twitter 
        twitterbox.style.display = 'none';
        toggleButton.innerText = 'Show Tweets';
        
      } else {
        // 显示 Twitter 
        twitterbox.style.display = 'block';
        toggleButton.innerText = 'Hide Tweets';
      }
    });
  }


  //修改spotify
  // const sptifymusic = document.getElementById('spotifymusic');
  // sptifymusic.style.width = '100%';
  // sptifymusic.style.height = '200px';


  //live2d放在live2d.js中

}

//电脑端
else{
  //推特相关
  var toggleButton = document.querySelector('.togglebutton');
  var twitterbox = document.querySelector('#twitterbox');

  if (twitterbox) {
    // 显示Twitter
    twitterbox.style.display = 'block';
    
    // 绑定按钮点击事件
    toggleButton.addEventListener('click', function() {
      if (twitterbox.style.display === 'block') {
        // 隐藏 Twitter 
        twitterbox.style.display = 'none';
        toggleButton.innerText = 'Show Tweets';
        
      } else {
        // 显示 Twitter 
        twitterbox.style.display = 'block';
        toggleButton.innerText = 'Hide Tweets';
      }
    });
  }
}

//公用

//跳转到指定位置
function smoothScroll(target) {
    var targetPosition = document.querySelector(target).offsetTop-68;
    var startPosition = window.pageYOffset;
    var distance = targetPosition - startPosition;
    var duration = 500; // 设置滚动时间
  
    var start = null;
    window.requestAnimationFrame(function step(timestamp) {
      if (!start) start = timestamp;
      var progress = timestamp - start;
      var newPosition = easeInOutQuad(progress, startPosition, distance, duration);
      window.scrollTo(0, newPosition);
      if (progress < duration) window.requestAnimationFrame(step);
    });
  }
  
  // 缓动函数，可选
  function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }