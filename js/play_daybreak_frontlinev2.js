var i = 0;
var songtime = 0;
var animationFrames = [	
	'frame_14_delay-0.04s.png',
	'frame_02_delay-0.04s.png',
	'frame_04_delay-0.04s.png',
	'frame_06_delay-0.04s.png',
	'frame_07_delay-0.04s.png',
	'frame_08_delay-0.04s.png',
	'frame_10_delay-0.04s.png',
	'frame_12_delay-0.04s.png',
	'frame_14_delay-0.04s.png'
];

var currentFrame = 10000;
var isPlaying = false;
var timeInfo = [];

// audio.addEventListener("canplaythrough", function() {
// 	play();
// });

function play(){
	if (!isPlaying) {
		var audio = document.getElementById("myAudio");
		setTimeInfo();
		draw();
		updateTime();
		setTimeout(function() {
			audio.play();
		  }, 500); // 等待时间为 500 毫秒，可以根据需要进行调整
		isPlaying = true;
	}
}

function pause(){
	var audio = document.getElementById("myAudio");
	audio.pause();
	cancelAnimationFrame(draw);
	cancelAnimationFrame(updateTime);
	isPlaying = false;
}

function reset(){
	var audio = document.getElementById("myAudio");
	audio.pause();
	audio.currentTime = 0;
	cancelAnimationFrame(draw);
	cancelAnimationFrame(updateTime);
	isPlaying = false;
	i = 0;
	context.clearRect(0, 0, canvas.width, canvas.height);
}

//关键判断函数
function updateTime(){
	songtime = document.getElementById("myAudio").currentTime;
	if (i < timeInfo.length) {
		if(songtime >= timeInfo[i]){
			// console.log(timeInfo[i],songtime);
			currentFrame = 0;
			i++;
		}
	} else {
		reset();
	}
	requestAnimationFrame(updateTime);
}

function setTimeInfo() {
	var txtFile = new XMLHttpRequest();
	txtFile.open("GET", "../python/output.txt", true);
	txtFile.onreadystatechange = function() {
		if (txtFile.readyState === 4) {  // Makes sure the document is ready to parse.
			if (txtFile.status === 200) {  // Makes sure it's found the file.
				console.log(txtFile.status);
				var allText = txtFile.responseText;
				timeInfo = allText.trim().split('\n').map(function(x) { return parseFloat(x); });
			}
		}
	}
	txtFile.send(null);
}

function draw(){
	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");
	if (currentFrame >= animationFrames.length) {
	} else {
		var image = new Image();
		image.onload = function(){
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.drawImage(image, 0, 0);
			currentFrame++;
		};
		image.src = `../media/Kirbybeats/`+animationFrames[currentFrame];
	}
	requestAnimationFrame(draw,80);
}
