// 检查 URL 参数，判断是否在 iframe 中
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('embedded') === 'true') {
    document.body.classList.add('embedded');
}

// Load JSON data
d3.json('./media/anime_song_rank.json').then(function(data) {
    const chartWidth = document.getElementById('chart').clientWidth;
    const w1 = Math.min(chartWidth, 1800); 
    const h1 = 900;
    // Set up SVG and margins
    const margin = {top: 20, right: 20, bottom: 40, left: 40};
    const width = w1 - margin.left - margin.right;
    const height = h1 - margin.top - margin.bottom;

    const svg = d3.select('#chart')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Set up scales with origin (0,0) in the center
    const xScale = d3.scaleLinear()
                    .domain([d3.min(data, d => d.x) - 10, d3.max(data, d => d.x) + 10])
                    .range([0, width]);

    const yScale = d3.scaleLinear()
                    .domain([d3.min(data, d => d.y) - 10, d3.max(data, d => d.y) + 10])
                    .range([height, 0]);

    // Adjust scales to center the origin
    const xCenter = width / 2;
    const yCenter = height / 2;

    xScale.domain([-d3.max(data, d => Math.abs(d.x)), d3.max(data, d => Math.abs(d.x))]);
    yScale.domain([-d3.max(data, d => Math.abs(d.y)), d3.max(data, d => Math.abs(d.y))]);

    // Create dots for the scatter plot
    svg.selectAll('.dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('cx', d => xScale(d.x))
    .attr('cy', d => yScale(d.y))
    .attr('r', 6)
    .style('fill', 'steelblue')
    .on('mouseover', function(event, d) {
        const infoBox = d3.select('#info-box');
        infoBox.style('display', 'block')
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 20) + 'px')
                .html(`<strong>Song:</strong> ${d.name}<br><strong>Anime:</strong> ${d.anime}`);
    })
    .on('mouseout', function() {
        // Do not hide the info box yet
    });

    // Add click event to hide info box when clicking anywhere else
    document.addEventListener('click', function(event) {
        const infoBox = d3.select('#info-box');
        if (!infoBox.node().contains(event.target) && !event.target.classList.contains('dot')) {
            infoBox.style('display', 'none');
        }
    });
    
    // Add axes
    svg.append('g')
    .attr('transform', 'translate(0,' + yCenter + ')')
    .call(d3.axisBottom(xScale))
    .selectAll('path, line')
    .style('stroke', 'white');  // 设置轴线和刻度线的颜色

    svg.append('g')
    .attr('transform', 'translate(' + xCenter + ',0)')
    .call(d3.axisLeft(yScale))
    .selectAll('path, line')
    .style('stroke', 'white');  // 设置轴线和刻度线的颜色

    // Add labels for axes
    svg.append('text')
    .attr('transform', 'translate(' + (width / 2) + ' ,' + -5 + ')')
    .style('text-anchor', 'middle')
    .text('First Image')
    .style('fill', 'white');  // 

    svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 15 + width)
    .attr('x', 0 - (height / 2))
    .style('text-anchor', 'middle')
    .text('Longtime Image')
    .style('fill', 'white');  //
});