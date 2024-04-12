document.addEventListener('DOMContentLoaded', () => {
  const converter = new showdown.Converter();
  const fileNames = [];

  fetch('markdown/diary/0000-filenames.txt', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'//防止乱码，但其实重点是预处理中python里写入txt要声明utf-8
    }
  }).then(response => response.text())
    .then(data => {
      const names = data.split(',').map(name => name.trim());//也许有空格。但已经修正，可注销
      fileNames.push(...names);
      // fileNames.sort().reverse();//倒序排列 前期处理已经排序，这里不需要再写了，也许可以加快速度
      const promises = [];
      for (let i = 0; i < 3 && i < fileNames.length; i++) {//限制加载日记数量
        promises.push(loadMarkdown(fileNames[i], converter));
      }
      return Promise.all(promises); //等待所有异步操作完成，否则可能后来的先被展示
    })
    .then(markdowns => {
      const markdownList = document.querySelector('#markdown-list');
      markdowns.forEach(markdown => {
        const li = document.createElement('li');
        li.innerHTML = markdown;
        markdownList.appendChild(li);
      });
    });
});


async function loadMarkdown(filename, converter) {  
  const markdownContent = await fetch(`../markdown/diary/${filename}.md`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  }).then(response => response.text());
  const htmlContent = converter.makeHtml(markdownContent);

  const segments = filename.split('-');
  const date = `${segments[0]}-${segments[1]}-${segments[2]}`;
  const title = segments.slice(3).join('-');

  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
    return `<h2>${title}<span class="subtitle"><br>date：${date}</span></h2><div class="contentback">${htmlContent}</div>`;//移动样式
  }else{
    return `<h2>${title}<span class="subtitle"> date：${date}</span></h2><div class="contentback">${htmlContent}</div>`;//PC样式
  }
  
}
