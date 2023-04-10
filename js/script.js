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