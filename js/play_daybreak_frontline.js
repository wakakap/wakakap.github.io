var i = 0;
var songtime = 0;
var intervalId;
var canvas;
var context;
var currentFrame = 0;
var isPlaying = false

var animationFrames = [
	'frame_02_delay-0.04s.png',
	'frame_04_delay-0.04s.png',
	'frame_06_delay-0.04s.png',
	'frame_08_delay-0.04s.png',
	'frame_10_delay-0.04s.png',
	'frame_12_delay-0.04s.png',
	'frame_14_delay-0.04s.png',
	'frame_16_delay-0.04s.png',
];


function play(){
	if (!isPlaying) {
		var audio = document.getElementById("myAudio");
		audio.play();
		setTimeInfo();
		intervalId = setInterval(draw, 58);
		setInterval(updateTime, 5);
		isPlaying = true;
	  }
}

function pause(){
	var audio = document.getElementById("myAudio");
	audio.pause();
	clearInterval(intervalId);
	clearInterval(updateTime);
	isPlaying = false;
}

function updateTime(){
	songtime = Math.floor(document.getElementById("myAudio").currentTime);
	if (i < timeInfo.length && songtime >= timeInfo[i]) {
		currentFrame = 0;
		i++;
	}
}

function setTimeInfo() {
	var txtFile = new XMLHttpRequest();
	txtFile.open("GET", "../python/beat_times.txt", true);
	txtFile.onreadystatechange = function() {
		if (txtFile.readyState === 4) {  // Makes sure the document is ready to parse.
			if (txtFile.status === 200) {  // Makes sure it's found the file.
				console.log(txtFile.status);
				var allText = txtFile.responseText;
				timeInfo = allText.trim().split('\n').map(function(x) { return parseInt(x); });
				document.getElementById("timeInfo").innerHTML = "<pre>" + allText + "</pre><pre>" + JSON.stringify(timeInfo) + "</pre>"; // 输出时间信息到页面中
			}
		}
	}
	txtFile.send(null);
}

function draw(){
	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");
	if (currentFrame >= animationFrames.length) {
		
		// clearInterval(intervalId);
	} else {
		var image = new Image();
		image.onload = function(){
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.drawImage(image, 0, 0);
			currentFrame++;
		};
		image.src = `../media/Kirbybeats/`+animationFrames[currentFrame];
	}
}