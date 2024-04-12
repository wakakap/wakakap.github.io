if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
  console.log("手机端");

  //更换meta viewport
  // var metaViewport = document.querySelector('meta[name="viewport"]');
  // if (metaViewport) {
  //   metaViewport.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0");
  //   console.log("更换meta viewport");
  // }

  //这个就不更换css了
}

document.addEventListener('DOMContentLoaded', () => {
  const converter = new showdown.Converter();
  const fileNames = [];

  fetch('markdown/tech/0000-filenames.txt', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'//防止乱码，但其实重点是预处理中python里写入txt要声明utf-8
    }
  }).then(response => response.text())
    .then(data => {
      const names = data.split(',').map(name => name.trim());//也许有空格。但已经修正，可注销
      fileNames.push(...names);
      const promises = [];
      // return Promise.all(fileNames.map(async (filename) => {
      //   const response = await fetch(`../markdown/tech/${filename}.md`);
      //   const lastModified = response.headers.get('last-modified');//获取文件最后修改日期
      //   return { filename, lastModified };
      // }));
    // })
    // .then(files => {
      // files.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));//按照日期从新到旧排序
      // const promises = [];
      for (let i = 0; i < fileNames.length; i++) {//限制加载日记数量
        promises.push(loadMarkdown(fileNames[i], converter));
      }
      return Promise.all(promises); //等待所有异步操作完成，否则可能后来的先被展示
    })
});




//

async function loadMarkdown(filename, converter) {
  const markdownContent = await fetch(`markdown/tech/${filename}.md`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  }).then(response => response.text());

  const segments = filename.split('-');
  const title = segments.join(' ');

  const li = document.createElement('li');

  // create button to toggle content visibility
  const button = document.createElement('button');
  button.innerText = '展开';
  button.addEventListener('click', () => {
    if (div.hidden) {
      div.hidden = false;
      button.innerText = '收起';
    } else {
      div.hidden = true;
      button.innerText = '展开';
    }
  });

  // create div to contain markdown content
  const div = document.createElement('div');
  div.innerHTML = converter.makeHtml(markdownContent);
  div.hidden = true;//可以将代码中的div.style.display = 'none'改成div.hidden = true。这样在一开始就不会加载所有内容，而是当点击展开按钮时才显示相应的内容。

  // add black background class
  div.classList.add('contentback');

  // append title and button to li element
  const h2 = document.createElement('h2');
  h2.innerHTML = `${title}<span class="subtitle"></span>`;
  h2.appendChild(button);
  li.appendChild(h2);

  // append div to li element
  li.appendChild(div);

  const markdownList = document.querySelector('#markdown-list');
  markdownList.appendChild(li);
}