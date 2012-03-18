/* ----------------------------------------
css-sprite-animation.js 1.2.0
CSSでスプライトアニメする

Note:
Use:CSSでスプライトシートをアニメさせる
Required:webkit採用ブラウザであること、HTML5であること
Usage:
・新規作成
var anime = new CSSSA({name:"animation-name",src:"sprite.png",fps:12,width:240,height:160,frames:10,column:10,iterationCount:"infinite"});
・elemプロパティに生成されたDOMオブジェクトが入っているので必要な場所にappendChildする
document.getElementById("stage").appendChild(anime.elem);
・再生
anime.play();
・一時停止
anime.pause();
・停止
anime.stop();
---------------------------------------- */
var CSSSA = function(settings){
	this.name = settings.name;
	var className = this.name + "-anime";
	this.fps = settings.fps;
	this.frames = settings.frames;
	var column;
	if (settings.column === undefined){
		column = settings.frames;
	} else{
		column = settings.column;
	}
	this.width = settings.width;
	this.height = settings.height;
	if (settings.iterationCount === undefined){
		this.iterationCount = 1;
	} else{
		this.iterationCount = settings.iterationCount;
	}
	// 再生間隔
	var duration = this.duration =~~(1000/this.fps*this.frames);

	// DOM要素作成
	this.elem = document.createElement('div');
	this.elem.className = className;
	var spriteImg = new Image();
	spriteImg.src = settings.src;
	this.elem.appendChild(spriteImg);

	var styleId = this.name+"-style";
	var styleTag = document.createElement("style");
	// 既にCSSがあればreturnする
	if(document.getElementById(styleId)){
		return;
	}
	styleTag.id = styleId;
	document.getElementsByTagName('head')[0].appendChild(styleTag);

	var cssText = "";
	// デフォルト時のCSSを作る
	// 外のdiv
	cssText += "." + className + "{\n";
	cssText += "position:relative;\n";
	cssText += "width:"+this.width+"px;\n";
	cssText += "height:"+this.height+"px;\n";
	cssText += "overflow:hidden;\n";
	cssText += "}\n";
	// 中のimg
	cssText += "." + className + "> img{\n";
	cssText += "position:absolute;\n";
	cssText += "left:0;\n";
	cssText += "top:0;\n";
	cssText += "}\n";

	var keyframesArray = [];
	var frameX;
	var frameY;
	for(var i=0;i<this.frames;i++){
		frameX = i%column * this.width * -1;
		frameY = Math.floor(i/column)*this.height * -1;
		if(navigator.userAgent.indexOf("Android") != -1){
			keyframesArray[i] = "left:" + frameX + "px;\n";
			keyframesArray[i] += "top:" + frameY + "px;\n";
		}else{
			keyframesArray[i] = "-webkit-transform:translate3d(" + frameX + "px," + frameY + "px,0);\n";
		}
	};

	// -webkit-keyframesのパーセントの桁数を再生間隔に応じて基本単位の増減が1ms以下になるように変える。
	// つまり1秒なら1000ms*0.1%で1msとなるので0.1が基本単位になる。
	// 念のため更に1/10し、その上わかりやすさのために最終桁を1にする。
	var tick = String(1/duration*100*0.1).match(/[0\.]+/)+"1";
	tick = Number(tick);
	// fpsを%換算する際の最適桁数算出
	var digits = 0;
	if(tick<1){
		digits = String(tick).match(/^0\.([0-9]+)/)[1].length;
	}

	// @-webkit-keyframes を作成する
	cssText += "@-webkit-keyframes kf-"+this.name+"{\n";
	for(var i=0;i<this.frames;i++){
		var fromPercent = (i/this.frames*100).toFixed(digits)+"%";
		if(i == 0){
			fromPercent = "from";
		}
		var toPercent = ((i+1)/this.frames*100-tick).toFixed(digits)+"%";
		if(i == (this.frames-1)){
			toPercent = "to";
		}
		cssText += fromPercent + "," + toPercent + "{\n";
		cssText += keyframesArray[i];
		cssText += "}\n";
	}
	cssText += "}\n";
	// div.id.play で再生するようにする
	cssText += "." + className + "[data-play-state='play'] > img,\n";
	cssText += "." + className + "[data-play-state='pause'] > img{\n";
	cssText += "-webkit-animation-name:kf-"+this.name+";\n";
	cssText += "-webkit-animation-duration:" + duration + "ms;\n";
	cssText += "-webkit-animation-iteration-count:"+this.iterationCount+";\n";
	cssText += "-webkit-animation-timing-function:linear;\n";
	cssText += "}\n";
	cssText += "." + className + "[data-play-state='play'] > img{\n";
	cssText += "-webkit-animation-play-state:running;\n";
	cssText += "}\n";
	cssText += "." + className + "[data-play-state='pause'] > img{\n";
	cssText += "-webkit-animation-play-state:paused;\n";
	cssText += "}\n";

	// cssText結合
	var styleText = document.createTextNode(cssText);
	styleTag.appendChild(styleText);
}
CSSSA.prototype = {
	play: function(){
		this.elem.setAttribute("data-play-state","play");
	},
	pause: function(){
		this.elem.setAttribute("data-play-state","pause");
	},
	stop: function(){
		this.elem.setAttribute("data-play-state","stop");
	}
}
