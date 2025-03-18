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
            // 生成随机索引，直到找到未使用的
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
            usedIndices.add(randomIndex);  // 标记此索引已使用
            index += 1;
        }
    })
    .catch(err => console.error('Error loading txt file:', err));

// 音频播放设置
const audio = new Audio('media/music/music.mp3');
audio.volume = 0.4; // 设置音量为50%，范围是0.0到1.0
audio.loop = true;
window.onload = () => {
    audio.play().catch(err => console.error('Error playing audio:', err));
};

// 计时器参数
const offset = 0.5;  // 延迟1秒开始计时
const hit = 4;     // 每周期4拍
const BPM = 164.5;  
const hittime = 60 / BPM ; // 每拍0.3秒 

// 预处理：假设 media/hits/ 中以 "1" 开头的文件列表
const hit1Images = [
    'media/hits/1_1.png',
    'media/hits/1_2.png',
    'media/hits/1_3.png'
];
// 计算节拍
let currentBeat = 1;
let isPlayingHit1 = false; // 标记是否正在播放第一拍动画
let hit1Index = 0; // 第一拍图片播放索引

function startBeatTimer() {
    setTimeout(() => {
        const beatInterval = setInterval(() => {
            currentBeat = (currentBeat % hit) + 1;
            if (currentBeat === 1 || currentBeat === 3) {
                // 第一拍特殊处理：开始播放 hit1Images 列表
                isPlayingHit1 = true;
                hit1Index = 0;
                playHit1Animation();
            } else {
                // 其他拍直接加载单张图片
                isPlayingHit1 = false; // 停止第一拍动画
                loadBackground(`media/hits/${currentBeat}.png`);
            }
        }, hittime * 1000);
    }, offset * 1000);
}

// 播放第一拍的动画
function playHit1Animation() {
    if (!isPlayingHit1 || hit1Index >= hit1Images.length) {
        return; // 如果不是第一拍模式或播放完毕，停止
    }

    loadBackground(hit1Images[hit1Index]);
    hit1Index++;

    if (hit1Index < hit1Images.length) {
        // 如果还有图片未播放，继续下一张
        setTimeout(playHit1Animation, 70); // 每张图片间隔 100ms，可调整
    }
    // 最后一张保持显示，直到下一次节拍变化
}

startBeatTimer();


// 获取文字显示容器
const textOverlay = document.getElementById('textOverlay');

// 参数：文字大小（单位：像素）
const textSize = 120; // 可调整，例如 32, 64 等
textOverlay.style.fontSize = `${textSize}px`;

// 显示文字并触发动画
function showText(text) {
    textOverlay.textContent = text;
    textOverlay.classList.add('active');
    // 1秒后淡出（可调整时间）
    setTimeout(() => {
        textOverlay.classList.remove('active');
    }, 1300);
}

let audioBuffer = null;// 缓冲区
let audioBuffer2 = null;// 二层缓冲区

// 方块交互逻辑
blocks.forEach(block => {
    let isPressed = false;

    // 鼠标按下事件
    block.addEventListener('mousedown', (e) => {
        if (e.button === 0) { // 左键
            isPressed = true;
            block.style.transition = 'opacity 0.1s ease-out';
            block.style.opacity = '0.5';
            // 将对应音频加入缓冲区
            if (block.textContent) {
                audioBuffer = audioMap.get(block.textContent); // 存储二元组
            }
        }
    });
    // 鼠标松开事件
    block.addEventListener('mouseup', () => {
        isPressed = false;
        block.style.transition = 'opacity 1s ease-out';
        block.style.opacity = '0.1';
    });

    // 鼠标离开事件
    block.addEventListener('mouseleave', () => {
        if (isPressed) {
            isPressed = false;
            block.style.transition = 'opacity 1s ease-out';
            block.style.opacity = '0.1';
        }
    });

    // 鼠标进入事件，处理按下状态下移入新方块
    block.addEventListener('mouseenter', (e) => {
        if (e.buttons === 1) { // 检查左键是否处于按下状态
            isPressed = true;
            block.style.transition = 'opacity 0.1s ease-out';
            block.style.opacity = '0.5';
            // 将对应音频加入缓冲区，覆盖之前的
            if (block.textContent) {
                audioBuffer = audioMap.get(block.textContent); // 存储二元组
            }
        }
    });
});
// 在第一拍时播放缓冲区的音频
setInterval(() => {
    if (audioBuffer && currentBeat === 1) {
        audioBuffer2 = audioBuffer
        const [firstAudio] = audioBuffer2; // 取二元组第一个音频
        const voiceAudio = new Audio(firstAudio);
        const text = firstAudio.split('/').pop().replace('.wav', '');
        showText(text);
        voiceAudio.play().catch(err => console.error('Error playing voice:', err));
        audioBuffer = null; // 立马第一层清空缓冲区 让用户操作最大程度有效
    }
    else if (audioBuffer2 && currentBeat === 3) {
        const [, secondAudio] = audioBuffer2; // 取二元组第二个音频
        const voiceAudio = new Audio(secondAudio);
        const text = secondAudio.split('/').pop().replace('.wav', '');
        showText(text);
        voiceAudio.play().catch(err => console.error('Error playing voice:', err));
        audioBuffer2 = null; // 第三拍播放后清空第二层缓冲区
    }
}, hittime * 1000);// 注意这的参数