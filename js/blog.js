document.addEventListener('DOMContentLoaded', () => {
  const converter = new showdown.Converter();
  const fileNames = [];

  fetch('../markdown/diary/0000-filenames.txt')
    .then(response => response.text())
    .then(data => {
      const names = data.split(',').map(name => name.trim());//也许有空格。但已经修正，可注销
      fileNames.push(...names);
      // fileNames.sort().reverse();//倒序排列 前期处理已经排序，这里不需要再写了，也许可以加快速度
      for (let i = 0; i < 3 && i < fileNames.length; i++) {//限制加载日记数量
        loadMarkdown(fileNames[i], converter);
      }
    });
});


async function loadMarkdown(filename, converter) {
  const markdownContent = await fetch(`../markdown/diary/${filename}.md`).then(response => response.text());
  const htmlContent = converter.makeHtml(markdownContent);

  const segments = filename.split('-');
  const date = `${segments[0]}-${segments[1]}-${segments[2]}`;
  const title = segments.slice(3).join('-');
  const li = document.createElement('li');
  li.innerHTML = `<h2>${title}<span class="subtitle"> date：${date}</span></h2><div>${htmlContent}</div>`;

  const markdownList = document.querySelector('#markdown-list');
  markdownList.appendChild(li);
}