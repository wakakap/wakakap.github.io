// 检查 URL 参数，判断是否在 iframe 中
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('embedded') === 'true') {
    document.body.classList.add('embedded');
}

// 当前显示的信息节点
let currentInfoNode = null;
const chartWidth = document.getElementById('chart').clientWidth;
const width = Math.min(chartWidth, 1800); 
const height = 900;
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// 异步加载数据并绘图
async function loadData() {
    try {
        const data = await d3.json("data/sorted_anime_by_year.json");
        // console.log("数据加载成功:", data); // 调试输出1：检查数据是否正确加载

        // 准备节点和链接数据
        const nodes = [];
        const links = [];
        
        // 检查是否有内容
        if (!data || Object.keys(data).length === 0 ) {
            console.error("数据为空或格式不正确");
            return;
        }

        // 添加年份节点
        Object.keys(data).forEach(year => {
            const animeCount = data[year].length; // 计算该年份的动画节点数量
            // 添加年份节点
            nodes.push({ id: year, type: 'year', animeCount: animeCount }); // 添加 animeCount 属性
            // 添加动画节点
            // console.log(`处理年份 ${year}:`, data[year]); // 调试输出2：检查每个年份的数据
            data[year].forEach(anime => {
                nodes.push({ 
                    id: anime.subject_id, 
                    type: 'anime', 
                    collection_type: anime.type,
                    data: anime,
                    radius: anime.type === 3? 11 : Math.max(5, -15 + anime.rate * 3) // 评分影响大小，但如果是正在看的 赋予11
                });
                links.push({ source: year, target: anime.subject_id });
            });
        });

        // console.log("节点:", nodes); // 调试输出3：检查生成的节点
        // console.log("链接:", links); // 调试输出4：检查生成的链接

        // 力导向图模拟 - 分开设置不同类型节点的参数
        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(70)) // 连结长度
            .force("charge", d3.forceManyBody().strength(d => d.type === 'year' ? -40 : -10)) // 年份节点更强排斥力
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide(10)) // 碰撞检测
            .force("x", d3.forceX().x(width / 2).strength(d => d.type === 'year' ? 0.00005 * Math.max(d.animeCount*10, 100) : 0.01)) // 年份节点吸引力随连接数增加，上限10
            .force("y", d3.forceY().y(height / 2).strength(d => d.type === 'year' ? 0.00005 * Math.max(d.animeCount*10, 100) : 0.01)); // 同上

        // 绘制链接
        const link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter()
            .append("line")
            .attr("class", "link");

        // 绘制节点
        const node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(nodes)
            .enter()
            .append("g");

        // 添加圆点
        const circles = node.append("circle")
        .attr("r", d => d.type === 'year' ? 20 : d.radius)
        .attr("class", d => 
            d.type === 'year' 
                ? 'year-node' 
                : d.collection_type === 2 
                    ? 'anime-node' 
                    : 'anime-watching-node'
        )
        .each(function(d) { 
            d.originalColor = d3.select(this).style("fill"); 
        });      

        // 年份节点添加文本
        node.filter(d => d.type === 'year')
            .append("text")
            .text(d => d.id)
            .attr("text-anchor", "middle")
            .attr("dy", 5)
            .attr("fill", "white");

        // 添加缓冲区
        // const bufferCircles = node.append("circle")
        //     .attr("r", d => Math.min(d.radius * 2, 15)) // 缓冲区半径为原半径2倍
        //     .attr("fill", "none") // 无填充
        //     .attr("pointer-events", "all") // 接收鼠标事件
        //     .attr("opacity", 0) // 不可见
        //     .attr("class", 'anime-node' 
        //     )
        //     .each(function(d) { 
        //     d.originalr = d3.select(this).attr("r"); 
        // });      

        // 将交互绑定到circles
        circles.filter(d => d.type === 'anime')
            .on("mouseenter", (event, d) => {
                const currentCircle = d3.select(event.currentTarget);
                const parentG = d3.select(event.currentTarget.parentNode);
                const anime = d.data;
                const subject = anime.subject;
                const year = subject.date.split('-')[0];
                const safeName = subject.name.replace(/[\/\\:*?"<>|]/g, ''); // 将非法字符替换为
                const imagePath = `media/image/${safeName}_${subject.id}_common.jpg`;

                currentCircle
                    .transition()
                    .duration(150)
                    .attr("r", d.radius * 1.7)
                    .style("fill", "#ff6b6b");

                // bufferCircles
                //     .transition()
                //     .duration(1)
                //     .attr("r", d.radius * 1.7)

                const ripple1 = parentG.append("circle")
                    .attr("r", d.radius)
                    .attr("fill", "none")
                    .attr("stroke", "#ff6b6b")
                    .attr("stroke-width", 2)
                    .attr("opacity", 0.8);

                ripple1.transition()
                    .duration(3000)
                    .ease(d3.easeCubicOut)
                    .attr("r", d.radius * 30)
                    .attr("stroke-width", 0)
                    .attr("opacity", 0)
                    .on("end", () => ripple1.remove());

                const infoDiv = d3.select("#info");
                infoDiv.html(`
                    <img src="${imagePath}" alt="${safeName}">
                    <div id="info-text">
                    <h3>${subject.name}</h3>
                    <p>中文名: ${subject.name_cn}</p>
                    <p>年份: ${year}</p>
                    <p>评分: ${subject.score}</p>
                    <p>我的评分: ${anime.rate}</p>
                    <p>我的评价: ${anime.comment || '我没有写评价'}</p>
                    </div>
                `);
            })
            .on("mouseleave", (event, d) => {
                const currentCircle = d3.select(event.currentTarget);
                currentCircle
                    .transition()
                    .duration(200)
                    .attr("r", d.radius)
                    .style("fill", d.originalColor);
            });

        // 全局右键清除信息
        svg.on("contextmenu", (event) => {
            event.preventDefault();
            currentInfoNode = null;
            d3.select("#info").html(`
                <p>鼠标悬浮在动画节点上查看详情</p>
            `);
        });

        // 添加拖拽功能
        const drag = d3.drag()
            .on("start", dragStarted) // 开始拖拽时触发
            .on("drag", dragged)      // 拖拽过程中触发
            .on("end", dragEnded);    // 拖拽结束时触发

        node.call(drag); // 将拖拽行为绑定到所有节点

        // 拖拽事件处理函数
        function dragStarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart(); // 重新激活仿真
            d.fx = d.x; // 固定当前节点的x位置
            d.fy = d.y; // 固定当前节点的y位置
        }

        function dragged(event, d) {
            d.fx = event.x; // 更新固定位置到鼠标x坐标
            d.fy = event.y; // 更新固定位置到鼠标y坐标
        }

        function dragEnded(event, d) {
            if (!event.active) simulation.alphaTarget(0); // 停止仿真
            d.fx = null; // 释放固定x位置
            d.fy = null; // 释放固定y位置
        }

        // 更新位置
        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

                node
            .attr("transform", d => {
                // 限制节点位置，避免超出边界，使用动态半径
                const radius = d.type === 'year' ? 150 : d.radius;
                d.x = Math.max(radius, Math.min(width - radius, d.x));
                d.y = Math.max(radius, Math.min(height - radius, d.y));
                return `translate(${d.x},${d.y})`;
            });
        });
    } catch (error) {
        console.error("加载数据时出错:", error); // 调试输出6：捕获加载错误的详细信息
    }
}

// 调用加载函数
loadData();
