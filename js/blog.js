document.addEventListener('DOMContentLoaded', () => {
  // 创建Showdown对象
  const converter = new showdown.Converter();
  const fileNames = [];

  // 读取文件名列表
  fetch('../markdown/diary/filenames.txt')
    .then(response => response.text())
    .then(data => {
      // 将文件名用逗号分隔，并添加到fileNames数组中
      const names = data.split(',');
      fileNames.push(...names);

      // 排序文件名，倒序
      fileNames.sort().reverse();

      // 取前三个文件名加载
      for (let i = 0; i < 3 && i < fileNames.length; i++) {
        loadMarkdown(fileNames[i], converter);
      }
    });

  function loadMarkdown(filename, converter) {
    // 使用fetch方法异步加载Markdown文件
    fetch(`../markdown/diary/${filename}.md`)
      .then(response => response.text())
      .then(markdownContent => {
        // 将Markdown内容转换为HTML
        const htmlContent = converter.makeHtml(markdownContent);

        // 从文件名中提取无日期纯标题
        const segfilename = filename.substring(0, filename.length).split('-');
        const title = segfilename[segfilename.length - 1];
        const date = segfilename.slice(0, segfilename.length - 1).join('-');
        // 创建新的list item元素，并将标题和HTML内容添加到其中
        const listItem = document.createElement('li');
        const titleElement = document.createElement('h2');
        titleElement.textContent = title;
        const subtitleElement = document.createElement('span');
        subtitleElement.textContent = date;
        subtitleElement.classList.add('subtitle');
        titleElement.appendChild(subtitleElement);
        const contentElement = document.createElement('div');
        contentElement.innerHTML = htmlContent;
        listItem.appendChild(titleElement);
        listItem.appendChild(contentElement);

        // 将新的list item元素添加到列表中
        const markdownList = document.querySelector('#markdown-list');
        markdownList.appendChild(listItem);

        // 对列表进行排序，按照标题倒序
        const lis = Array.from(markdownList.getElementsByTagName('li'));
        lis.sort((a, b) => {
          return b.querySelector('h2').textContent.localeCompare(a.querySelector('h2').textContent)
        }).forEach(li => markdownList.appendChild(li));
      });
  }
});
