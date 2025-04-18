// 检查 URL 参数，判断是否在 iframe 中
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('embedded') === 'true') {
    document.body.classList.add('embedded');
}

// 注册扩展
showdown.extension('customListIndent', function () {
    return [{
        type: 'lang',
        filter: function (text) {
            const lines = text.split('\n');
            const adjustedLines = [];
            const stack = []; // 存储每一级的缩进值

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const listMatch = line.match(/^(\s*)([-+*])\s+(.*)$/);
                const spacesMatch = line.match(/^(\s*)(.*)$/);

                if (listMatch) {
                    const spaces = listMatch[1].length; // 当前缩进空格数
                    const marker = listMatch[2];
                    const content = listMatch[3];

                    // 调整栈：缩进减少时退出层级，缩进相同时保持层级
                    while (stack.length > 0 && stack[stack.length - 1] > spaces) {
                        stack.pop();
                    }

                    // 如果缩进相同，不增加层级；如果增加，则推入新层级
                    if (stack.length === 0 || stack[stack.length - 1] < spaces) {
                        stack.push(spaces);
                    }

                    const indentLevel = stack.length - 1; // 当前层级
                    const adjustedSpaces = ' '.repeat(indentLevel * 4);
                    adjustedLines.push(`${adjustedSpaces}${marker} ${content}`);
                } else if (spacesMatch && spacesMatch[1].length > 0 && spacesMatch[2]) {
                    // 非列表项但有缩进，作为上一列表项的延续
                    const spaces = spacesMatch[1].length;
                    while (stack.length > 0 && stack[stack.length - 1] > spaces) {
                        stack.pop();
                    }
                    const indentLevel = stack.length - 1;
                    const adjustedSpaces = ' '.repeat(indentLevel * 4 + 4);
                    adjustedLines.push(`${adjustedSpaces}${spacesMatch[2]}`);
                } else {
                    // 无缩进的行，直接添加
                    adjustedLines.push(line);
                    if (!line.trim()) stack.length = 0; // 空行重置栈
                }
            }

            return adjustedLines.join('\n');
        }
    }];
});

// 在 DOM 加载完成后处理 Markdown 文件
document.addEventListener('DOMContentLoaded', async () => {
    const converter = new showdown.Converter({
        tables: true,           // 支持表格
        tasklists: true,        // 支持任务列表
        strikethrough: true,    // 支持删除线
        simplifiedAutoLink: true, // 自动识别链接
        ghCodeBlocks: true,     // GitHub 风格的代码块
        extensions: ['customListIndent'] // 注册自定义扩展
    });
    const fileNames = await fetchFileNames();
    await loadAllMarkdown(fileNames, converter);
});

// 获取文件名列表
async function fetchFileNames() {
    const response = await fetch('markdown/tech/0000-filenames.txt', {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
    const data = await response.text();
    return data.split(',').map(name => name.trim());
}

// 加载所有 Markdown 文件
async function loadAllMarkdown(fileNames, converter) {
    const markdownList = document.querySelector('#markdown-list');
    const loadPromises = fileNames.map(filename => 
        loadMarkdown(filename, converter, markdownList)
    );
    await Promise.all(loadPromises);
}

// 加载单个 Markdown 文件并创建 DOM 元素
async function loadMarkdown(filename, converter, markdownList) {
    const markdownContent = await fetchMarkdown(filename);
    const { date, title } = parseFileName(filename);

    const li = document.createElement('li');
    const h2 = createTitle(date, title);
    const div = createContent(markdownContent, converter);
    const button = createToggleButton(div);

    h2.appendChild(button);
    li.appendChild(h2);
    li.appendChild(div);
    markdownList.appendChild(li);
}

// 创建标题元素
function createTitle(date, title) {
  const h2 = document.createElement('h2');
  h2.innerHTML = `${title}<span class="subtitle"><br>date：${date}</span>`;
  return h2;
}

// 创建内容元素
function createContent(markdownContent, converter) {
  const div = document.createElement('div');
  div.innerHTML = converter.makeHtml(markdownContent);
  div.hidden = true;
  div.classList.add('contentback');
  return div;
}

// 创建切换按钮
function createToggleButton(div) {
  const button = document.createElement('button');
  button.innerText = '展开';
  button.addEventListener('click', () => {
      div.hidden = !div.hidden;
      button.innerText = div.hidden ? '展开' : '收起';
  });
  return button;
}

// 获取 Markdown 文件内容
async function fetchMarkdown(filename) {
    const response = await fetch(`../markdown/tech/${filename}.md`, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
    return response.text();
}

// 解析文件名，提取日期和标题
function parseFileName(filename) {
    const segments = filename.split('-');
    const date = `${segments[0]}-${segments[1]}-${segments[2]}`;
    const title = segments.slice(3).join('-');
    return { date, title };
}