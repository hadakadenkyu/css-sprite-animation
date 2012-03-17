/* ----------------------------------------
css-sprite-animation.js 1.0.1
CSSでスプライトアニメする

Note:
Use:CSSでスプライトシートをアニメさせる
Required:webkit採用ブラウザであること、HTML5であること
Usage:
・新規作成
var anime = new CSSSA({name:"animation-name",src:"sprite.png",fps:12,width:240,height:160,frames:10});
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
	this.elem = document.createElement('div');
	var className = this.name + "_anime";
	this.elem.className = className;
	this.fps = settings.fps;
	this.frames = settings.frames;
	this.width = settings.width;
	this.height = settings.height;
	
	var spriteImg = new Image();
	spriteImg.src = settings.src;
	this.elem.appendChild(spriteImg);
	var self = this;

	// check if steps() is available
	var isAvailableSteps = false;
	// using steps on iOS5.* let the animation slow, so disable it.
	/*
	var tempElem = document.createElement("div");
	document.body.appendChild(tempElem);
	tempElem.style.webkitAnimationTimingFunction = "steps(10,end)";
	var style = tempElem.currentStyle || document.defaultView.getComputedStyle(tempElem, '');
	if(style.webkitAnimationTimingFunction.toLowerCase().indexOf('steps') != -1){
		isAvailableSteps = true;
	}
	document.body.removeChild(tempElem);
	delete style;
	delete tempElem;
	*/
	// 再生間隔
	var duration =~~(1000/this.fps*this.frames);

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
		for(var i=0;i<this.frames;i++){
			var frameX = this.width*-i;
			if(navigator.userAgent.indexOf("Android") != -1){
				keyframesArray[i] = "left:"+frameX + "px;\n";
			}else{
				keyframesArray[i] = "-webkit-transform:translate3d(" + frameX + "px,0,0);\n";
			}
		};

		// -webkit-keyframesのパーセントの桁数を再生間隔に応じて変える。差し当たり桁数でそのままやる。
		var digits = String(duration).length;
		var tick = Math.pow(0.1,digits);

		// @-webkit-keyframes を作成する
		var timingFunction = "";
		cssText += "@-webkit-keyframes kf-"+this.name+"{\n";
		// stepsが有効ならsteps使う
		if(isAvailableSteps){
			cssText += "from{\n";
			cssText += keyframesArray[0];
			cssText += "}\n";
			cssText += "to{\n";
			cssText += keyframesArray[this.frames-1];
			cssText += "}\n";
			timingFunction = "steps("+(this.frames-1)+", start)";
		} else {
			for(var i=0;i<this.frames;i++){
				var fromPercent = (i/this.frames*100).toFixed(digits)+"%";
				if(i == 0){
					var fromPercent = "from";
				}
				var toPercent = ((i+1)/this.frames*100-tick).toFixed(digits)+"%";
				if(i == (this.frames-1)){
					toPercent = "to";
				}
				cssText += fromPercent + "," + toPercent + "{\n";
				cssText += keyframesArray[i];
				cssText += "}\n";
			}
			timingFunction = "linear";
		}
		cssText += "}\n";
		// div.id.play で再生するようにする
		cssText += "." + className + "[data-play-state='play'] > img,\n";
		cssText += "." + className + "[data-play-state='pause'] > img{\n";
		cssText += "-webkit-animation-name:kf-"+this.name+";\n";
		cssText += "-webkit-animation-duration:" + duration + "ms;\n";
		cssText += "-webkit-animation-iteration-count:infinite;\n";
		cssText += "-webkit-animation-timing-function:"+ timingFunction +";\n";
		cssText += "}\n";
		cssText += "." + className + "[data-play-state='play'] > img{\n";
		cssText += "-webkit-animation-play-state:running;\n";
		cssText += "}\n";
		cssText += "." + className + "[data-play-state='pause'] > img{\n";
		cssText += "-webkit-animation-play-state:paused;\n";
		cssText += "}\n";

		// cssText結合
		var styleText = document.createTextNode(cssText);
		var styleTag = document.createElement("style");
		styleTag.id = this.name+"_style";
		styleTag.setAttribute("scoped","scoped");
		styleTag.appendChild(styleText);

		// scopedにしてelemにstyleタグ追加
		this.elem.appendChild(styleTag);
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
