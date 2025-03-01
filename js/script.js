// 动态检测屏幕
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
  console.log("手机端");

  // Twitter相关
  var toggleButton = document.querySelector('.togglebutton');
  var twitterbox = document.querySelector('#twitterbox');
  var fixedTwitter = document.querySelector('.fixed-twitter');

  if (twitterbox && fixedTwitter && toggleButton) {
    // 默认隐藏Twitter内容
    twitterbox.style.display = 'none';
    fixedTwitter.classList.remove('expanded'); // 确保初始状态未展开

    // 绑定按钮触摸事件
    toggleButton.addEventListener('touchstart', function(e) {
      e.preventDefault(); // 防止触摸事件冲突
      if (twitterbox.style.display === 'block') {
        // 收起
        twitterbox.style.display = 'none';
        fixedTwitter.classList.remove('expanded');
        toggleButton.innerText = 'Show Tweets';
      } else {
        // 展开到接近全屏
        twitterbox.style.display = 'block';
        fixedTwitter.classList.add('expanded');
        toggleButton.innerText = 'Hide Tweets';
      }
    });

    // 增加点击事件兼容（部分设备可能不触发touchstart）
    toggleButton.addEventListener('click', function(e) {
      e.preventDefault();
      if (twitterbox.style.display === 'block') {
        twitterbox.style.display = 'none';
        fixedTwitter.classList.remove('expanded');
        toggleButton.innerText = 'Show Tweets';
      } else {
        twitterbox.style.display = 'block';
        fixedTwitter.classList.add('expanded');
        toggleButton.innerText = 'Hide Tweets';
      }
    });
  }

  // 修改Spotify（如果需要，保留原注释代码）
  // const sptifymusic = document.getElementById('spotifymusic');
  // sptifymusic.style.width = '100%';
  // sptifymusic.style.height = '200px';

  // live2d 相关逻辑已在 live2d.js 中，这里不处理
}

// 电脑端
else {
  console.log("电脑端");

  // Twitter相关
  var toggleButton = document.querySelector('.togglebutton');
  var twitterbox = document.querySelector('#twitterbox');

  if (twitterbox && toggleButton) {
    // 默认显示Twitter
    twitterbox.style.display = 'block';

    // 绑定按钮点击事件
    toggleButton.addEventListener('click', function() {
      if (twitterbox.style.display === 'block') {
        // 隐藏Twitter
        twitterbox.style.display = 'none';
        toggleButton.innerText = 'Show Tweets';
      } else {
        // 显示Twitter
        twitterbox.style.display = 'block';
        toggleButton.innerText = 'Hide Tweets';
      }
    });
  }
}

// 公用 - 平滑滚动函数
function smoothScroll(target) {
  var targetPosition = document.querySelector(target).offsetTop - 68;
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

// 缓动函数
function easeInOutQuad(t, b, c, d) {
  t /= d / 2;
  if (t < 1) return c / 2 * t * t + b;
  t--;
  return -c / 2 * (t * (t - 2) - 1) + b;
}