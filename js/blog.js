$(document).ready(function() {
    // 创建Showdown对象
    var converter = new showdown.Converter();

    // 扫描markdown目录并获取文件列表
    $.ajax({
        url: '../markdown/diary/',
        success: function(data) {
            var fileNames = [];    
            $(data).find("a:contains('.md')").each(function(){
                var href = $(this).attr('href');
                var segments = href.split('/');
                var filename = segments[segments.length - 1];
                fileNames.push(filename);
            });

            // 排序文件名，倒序
            fileNames.sort();
            fileNames.reverse();

            // 取前三个文件名加载
            for (var i = 0; i < 3 && i < fileNames.length; i++) {
                loadMarkdown(fileNames[i], converter);
            }
        }
    });

    function loadMarkdown(filename, converter) {
        // 使用jQuery的get方法异步加载Markdown文件
        $.get('../markdown/diary/' + filename, function(markdownContent) {
            // 将Markdown内容转换为HTML
            var htmlContent = converter.makeHtml(markdownContent);

            // 从文件名中提取无日期纯标题
            var segfilename = filename.substring(0, filename.length - 3).split('-');
            var title = segfilename[segfilename.length - 1];
            var date = segfilename.slice(0, segfilename.length - 1).join('-');
            // 创建新的list item元素，并将标题和HTML内容添加到其中
            var listItem = $('<li>');
            var titleElement = $('<h2>').text(title).append($('<span>').text(date).addClass('subtitle')); // 将日期作为副标题，使用小字号
            var contentElement = $('<div>').html(htmlContent);
            listItem.append(titleElement).append(contentElement);

            // 将新的list item元素添加到列表中
            $('#markdown-list').append(listItem);

            // 对列表进行排序，按照标题倒序
            $('#markdown-list li').sort(function(b, a) {
                return $(a).find('h2').text().localeCompare($(b).find('h2').text());
            }).appendTo('#markdown-list');
        });
    }
});
