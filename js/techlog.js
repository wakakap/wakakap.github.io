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
            //     const response = await fetch(`../markdown/tech/${filename}.md`);
            //     const lastModified = response.headers.get('last-modified');//获取文件最后修改日期
            //     return { filename, lastModified };
            // }));
        // })
        // .then(files => {
            // files.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));//按照日期从新到旧排序
            // const promises = [];
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
    const markdownContent = await fetch(`markdown/tech/${filename}.md`, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8'
        }
    }).then(response => response.text());
    const htmlContent = converter.makeHtml(markdownContent);

    const segments = filename.split('-');
    const title = segments.join(' ');

    return `<h2>${title}</h2><div class="contentback">${htmlContent}</div>`;
}
