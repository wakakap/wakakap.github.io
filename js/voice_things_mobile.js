// 获取DOM元素
const canvas = document.getElementById('canvas');
const grid = document.getElementById('grid');
const ctx = canvas.getContext('2d');

// 设置画布大小
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// 加载并绘制背景图片
function loadBackground(imageSrc) {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
}

// 初始加载默认背景
loadBackground('media/hits/1.png');

// 创建24个方块
let blocks = [];
function createGrid() {
    grid.innerHTML = ''; // 清空现有内容
    for (let i = 0; i < 24; i++) {
        const block = document.createElement('div');
        block.className = 'block';
        grid.appendChild(block);
        blocks.push(block);
    }
}
createGrid();

// 存储 txt 文件内容的映射
const audioMap = new Map(); // 键为方块名称，值为 [firstAudio, secondAudio] 二元组

// 读取txt文件并设置方块名称和音频映射
fetch('data/japanese.txt')
    .then(response => response.text())
    .then(text => {
        const lines = text.trim().split('\n');
        let index = 0;
        const usedIndices = new Set();  // 记录已使用的索引
        while (index < blocks.length) {
            if (usedIndices.size >= lines.length) {
                break;  // 如果所有行都用完了就退出
            }
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * lines.length);
            } while (usedIndices.has(randomIndex));
            
            const selectedLine = lines[randomIndex];
            const [name, secondName] = selectedLine.split(',').map(part => part.trim());
            
            blocks[index].textContent = name;
            audioMap.set(name, [
                `media/voice/${name}.wav`,
                `media/voice/${secondName}.wav`
            ]);
            usedIndices.add(randomIndex);
            index += 1;
        }
    })
    .catch(err => console.error('Error loading txt file:', err));

// 音频播放设置
const audio = new Audio('/media/music/music.mp3');
audio.volume = 0.5;
audio.loop = true;
window.onload = () => {
    audio.play().catch(err => console.error('Error playing audio:', err));
};

// 计时器参数
const offset = 0.5;  // 延迟0.5秒开始计时
const hit = 4;     // 每周期4拍
const BPM = 160.5;  
const hittime = 60 / BPM; // 每拍时间

// 预处理：假设 media/hits/ 中以 "1" 开头的文件列表
const hit1Images = [
    'media/hits/1_1.png',
    'media/hits/1_2.png',
    'media/hits/1_3.png'
];

// 计算节拍
let currentBeat = 1;
let isPlayingHit1 = false;
let hit1Index = 0;

function startBeatTimer() {
    setTimeout(() => {
        const beatInterval = setInterval(() => {
            currentBeat = (currentBeat % hit) + 1;
            if (currentBeat === 1) {
                isPlayingHit1 = true;
                hit1Index = 0;
                playHit1Animation();
            } else {
                isPlayingHit1 = false;
                loadBackground(`media/hits/${currentBeat}.png`);
            }
        }, hittime * 1000);
    }, offset * 1000);
}

function playHit1Animation() {
    if (!isPlayingHit1 || hit1Index >= hit1Images.length) {
        return;
    }

    loadBackground(hit1Images[hit1Index]);
    hit1Index++;

    if (hit1Index < hit1Images.length) {
        setTimeout(playHit1Animation, 100);
    }
}

startBeatTimer();

// 获取文字显示容器
const textOverlay = document.getElementById('textOverlay');
const textSize = 120;
textOverlay.style.fontSize = `${textSize}px`;

// 显示文字并触发动画
function showText(text) {
    textOverlay.textContent = text;
    textOverlay.classList.add('active');
    setTimeout(() => {
        textOverlay.classList.remove('active');
    }, 1000);
}

let audioBuffer = null;
let audioBuffer2 = null;

// 方块交互逻辑（手机端使用触摸事件）
blocks.forEach(block => {
    let isTouched = false;

    // 触摸开始事件（相当于mousedown）
    block.addEventListener('touchstart', (e) => {
        e.preventDefault(); // 防止页面滚动
        isTouched = true;
        block.style.transition = 'opacity 0.1s ease-out';
        block.style.opacity = '0.5';
        if (block.textContent) {
            audioBuffer = audioMap.get(block.textContent);
        }
    }, { passive: false });

    // 触摸结束事件（相当于mouseup）
    block.addEventListener('touchend', (e) => {
        e.preventDefault();
        isTouched = false;
        block.style.transition = 'opacity 1s ease-out';
        block.style.opacity = '0.1';
    }, { passive: false });
});

// 在第一拍和第三拍播放缓冲区的音频
setInterval(() => {
    if (audioBuffer && currentBeat === 1) {
        audioBuffer2 = audioBuffer;
        const [firstAudio] = audioBuffer2;
        const voiceAudio = new Audio(firstAudio);
        const text = firstAudio.split('/').pop().replace('.wav', '');
        showText(text);
        voiceAudio.play().catch(err => console.error('Error playing voice:', err));
        audioBuffer = null;
    }
    else if (audioBuffer2 && currentBeat === 3) {
        const [, secondAudio] = audioBuffer2;
        const voiceAudio = new Audio(secondAudio);
        const text = secondAudio.split('/').pop().replace('.wav', '');
        showText(text);
        voiceAudio.play().catch(err => console.error('Error playing voice:', err));
        audioBuffer2 = null;
    }
}, hittime * 1000);