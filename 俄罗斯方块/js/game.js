var canvas = document.getElementsByClassName('canvas')[0];
var start = document.getElementsByClassName('start')[0];
var resetStart = document.getElementsByClassName('resetStart')[0];
var oGc = canvas.getContext("2d");

var map = [];
var runRect = [];
var nextRect = [];
var timer = null;
var rectShape = null;
var score = null;
var startState;

init();
function init(){
	score = 0;
	map = [];
	runRect = [];
	nextRect = [];
	rectX = 0;
	startState = true;

	rectShape = createRectShape();

	// 创建主区域的方块背景
	oGc.fillStyle = "#000000";
	oGc.strokeStyle = "#ffffff";
	oGc.fillRect(0,0,450,600);
	oGc.clearRect(20,25,275,550);

	// 创建小窗体的方块背景
	oGc.fillStyle = "#ffffff";
	oGc.font = "20px 黑体";
	oGc.textAlign = "left";
	oGc.fillText("下一个:",325,50,100);
	oGc.clearRect(325,70,100,100);

	// 创建得分区域
	oGc.fillText("得分:",325,260,100);
	oGc.fillText("0",325,300,100);
	oGc.strokeStyle = "#cccccc";
	oGc.lineWidth = 1;
	oGc.fillStyle = "#3A70A3";

	/*
		创建二维数组：地图
		0： 无填充。默认全部无填充
		1： 有方块进行填充
	 */
	for (let i = 0; i < 22; i++) {
		let arr = [];
		for (let j = 0; j < 11; j++) {
			arr.push(0)
		}
		map.push(arr)
	}	

	// 创建游戏窗体	
	createMainReact();
	// 创建下一个游戏窗体
	createNextRect();

	// 开始游戏，方块进行下落运动	
	document.onkeydown = function (e) {
		switch (e.keyCode) {
			case 37: 
			case 65: 
				moveRect(-1, 0);
			break;

			case 38:
			case 87:
				rotateRect();
			break;

			case 39:
			case 68:
				moveRect(1, 0);
			break;

			case 40:
			case 83:
				moveRect(0, 1);
			break;
		}
	}
}

start.onclick = startGame;

// 重新开始游戏
resetStart.onclick = function () {
	clearInterval(timer);
	start.innerHTML = '重新开始';
	init();
	startGame();	
}

/*
	开始游戏
 */
function startGame () {
	if (startState) {
		this.innerHTML = '暂停'
		timer = setInterval(function () {
			moveRect(0, 1);
		}, 200);			
	} else {
		this.innerHTML = '开始游戏'
		clearInterval(timer)
	}
	startState = !startState;	
}
/*
	创建显示方块的区域
 */
function createMainReact () {
	for (let i = 0; i < map.length; i++) {
		for (let j = 0; j < map[i].length; j++) {
			let rectW = j * 25 + 20;
			let rectY = i * 25 + 25;
			oGc.clearRect(rectW, rectY, 25, 25);
			if (map[i][j]) {
				oGc.fillRect(rectW + 1, rectY + 1, 23, 23);
			} else {
				oGc.strokeRect(rectW, rectY, 25, 25);
			}
		}
	}
}

// 随机得到一个方块的形状
function ranRectShape () {
	let len = rectShape.length;
	return rectShape[Math.floor(Math.random() * len)];
}

// 创建下一个显示的方块
function createNextRect () {
	if (nextRect.length == 0) {
		runRect = ranRectShape();
	} else {
		runRect = nextRect;
	}
	
	runRect.top = -4;
	runRect.left = 4;
	nextRect = ranRectShape();

	createNextReactData();
}

function createNextReactData () {
	for (let i = 0; i < nextRect.length; i++) {
		for (let j = 0; j < nextRect[i].length; j++) {
			let rectW = j * 25 + 325;
			let rectY = i * 25 + 70;
			oGc.clearRect(rectW, rectY, 25, 25);

			if (nextRect[i][j]) {
				// oGc.strokeRect(rectW, rectW, 25, 25);
				oGc.fillRect(rectW + 1, rectY + 1, 23, 23);
			} else {
				oGc.strokeRect(rectW, rectY, 25, 25);
			}
		}
	}
}

/*
	方块下落函数
 */
function moveRect (rectX, rectY) {
	// 清除前面的方块
	clearRect();

	// 判断是否可以移动
	var state = isMove(rectX, rectY);
	
	if (state) {
		if (state != 2) {
			runRect.top += rectY;
			runRect.left += rectX;
		}

		showShape();	
	} else {
		showShape();

		// 判断方块满行的为哪一行
		var remove = [];
		for (let i = 0; i < map.length; i++) {
			var rowLen = 0
			for (let j = 0; j < map[i].length; j++) {
				if (map[i][j]) {
					rowLen++;
				}
			}

			if (rowLen == 11) {
				remove.push(i)
			}
		}

		// 删除满行的那一行数组
		for (let i = 0; i < remove.length; i++) {
			var row = remove.length - i - 1;
			map.splice(remove[row], 1);
			score += 100;
			getScore(score);
		}	

		// 重新添加一个空行
		for(i=0;i<remove.length;i++){
			var addRowTemp = [];
			for(j = 0; j < map[i].length; j++){
				addRowTemp.push(0);
			}
			map.unshift(addRowTemp);
		}

		// 到达顶端的时候，游戏结束
		for (let i = 0; i < map.length; i++) {
			if (map[0][i]) {
				alert('游戏结束');
				clearInterval(timer);
				return ;								
			}
		}			
		createNextRect();		
	}
	createMainReact();
}
/*
	清除前面的方块
 */
function clearRect () {
	for (let i = 0; i < runRect.length; i++) {
		for (let j = 0; j < runRect[i].length; j++) {		
			if (runRect[i][j] && (i + runRect.top >= 0)) {
				map[i + runRect.top][j + runRect.left] = 0;				
			}							
		}
	}		
}
/*
	旋转运动高度函数
 */
function rotateRect () {
	// 清除前面的方块
	clearRect();

	var rotateShape = [];
	for (let i = 0; i < runRect.length; i++) {
		rotateShape.unshift([]);
	}	

	for (let i = 0; i < runRect.length; i++) {
		for (let j = 0; j < runRect[i].length; j++) {
			rotateShape[j].unshift(runRect[i][j]);
		}
	}
	
	rotateShape.top = runRect.top;
	rotateShape.left = runRect.left;

	var temp = null;
	temp = runRect;  // 记录

	runRect = rotateShape;
	// 不能进行移动的时候。runRect不进行变化
	if (isMove(0, 0) != 1) {
		runRect = temp;
	}
	showShape();
	createMainReact();
}

/*
	判断是否可以移动
	0： 快速落下时： 不可移动
	1： 可以移动
	2： 左右到达边界时，不可移动
 */
function isMove (rectX, rectY) {
	var moveState = 1;
	for (let i = 0; i < runRect.length; i++) {
		for (let j = 0; j < runRect[i].length; j++) {
			if (runRect[i][j]) {
				var maxX = j + runRect.left + rectX;
				var maxY = i + runRect.top + rectY;

				if (maxX < 0) {
					return 2;
				}
				if (maxX > 10) {
					return 2;
				}
				if (maxY < 0) {
					continue;
				}
				if (maxY > 21) {
					return 0;
				}

				var moveArr = map[maxY][maxX];
				if (moveArr != 0) {
					if (rectX == 0) {
						return 0;
					}
					if (rectY == 0) {
						return 2;
					}
				}
			}
		}
	}

	return moveState;
}

/*
	方块在下落过程中的显示函数
 */
function showShape () {
	for (let i = 0; i < runRect.length; i++) {
		for (let j = 0; j < runRect[i].length; j++) {			
			if(runRect[i][j] && i + runRect.top >= 0){
				map[i + runRect.top][j + runRect.left] = 1;
			}			
		}
	}	
}

function getScore (score) {
	var fillcolor = oGc.fillStyle;
	oGc.fillStyle = "#000000";
	oGc.fillRect(325,280,100,20);
	oGc.fillStyle = "#ffffff";
	oGc.fillText(score,325,300,100);
	oGc.fillStyle = fillcolor;
}