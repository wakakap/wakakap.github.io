// 检查 URL 参数，判断是否在 iframe 中
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('embedded') === 'true') {
    document.body.classList.add('embedded');
}

document.addEventListener("DOMContentLoaded", function () {
  // 使用 fetch 获取 JSON 数据
  fetch('data/spotify_list.json') // 替换为实际的 JSON 文件路径
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(playlists => {
      // 使用 D3.js 创建图表
      const chart = d3.select("#chart");
      const musicBar = d3.select("#infobar");
      musicBar.html('<h2 style="color: white;">点击方块查看详情</h2>');

      playlists.forEach((playlist, index) => {
        const level = index + 1;
        const tracks = playlist.tracks;

        // 创建一个容器 div 为每个 level（歌单）
        const levelContainer = chart.append("div")
          .attr("class", `level-container level-${level}`);

        // 添加等级标题
        levelContainer.append("div")
          .attr("class", "level-title")
          .text(`Level ${level}: ${playlist.name}`);

        // 创建歌曲方块并放入容器
        const trackGroups = levelContainer.selectAll(".track-group")
          .data(tracks)
          .enter()
          .append("div")
          .attr("class", "track-group");

        // 添加歌曲标题
        trackGroups.append("div")
          .attr("class", "track-title")
          .text(d => {
            const titleParts = d.title.split('-'); // 根据 - 符号分割
            let title = titleParts[0].trim(); // 获取分割后的第一部分，并去除空格
            title = title.replace(/[\(\[\{].*?[\)\]\}]/g, '').trim(); // 删除括号及其中的内容
            return title;
          });

        // 添加艺术家
        // trackGroups.append("div")
        //   .attr("class", "track-artist")
        //   .text(d => d.artists);

        // 鼠标悬停事件
        trackGroups.on("click", function (event, d) {
          d3.select(this).style("background-color", "rgba(255, 255, 255, 0.4)");

        // 鼠标左键点击更新 musicbar 内容
          musicBar.html(`
            <iframe style="border-radius:12px" 
                src="https://open.spotify.com/embed/track/${d.track_id}?utm_source=generator&theme=0" 
                width="100%" height="352" frameBorder="0" allowfullscreen="" 
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy">
            </iframe>
            <h2 style="color: white;">${d.title}</h2>
            <p>Artist: ${d.artists}</p>
            <p>Album: ${d.album}</p>
            <p>Release Year: ${d.release_year}</p>
          `);
        })
        // 鼠标右键点击事件
        .on("contextmenu", function (event, d) {
        });
      });
    })
    .catch(error => {
      console.error('Error fetching the JSON data:', error);
      d3.select("#chart").append("text")
        .attr("x", 50)
        .attr("y", 50)
        .attr("fill", "white")
        .text("Failed to load playlist data.");
    });

});