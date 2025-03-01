// 检测设备类型并动态调整
document.addEventListener("DOMContentLoaded", function() {
  // 获取视口宽度
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

  // 检查是否为移动端（这里以768px为分界点，可调整）
  if (viewportWidth <= 768) {
      document.body.classList.add('mobile');
      console.log("检测到移动设备");
  } else {
      document.body.classList.remove('mobile');
      console.log("检测到桌面设备");
  }

  // 监听窗口大小变化
  window.addEventListener('resize', function() {
      const newWidth = window.innerWidth || document.documentElement.clientWidth;
      if (newWidth <= 768) {
          document.body.classList.add('mobile');
      } else {
          document.body.classList.remove('mobile');
      }
  });
});