/* ----------------------------------------
jQuery Colorize Image 1.0.0
色抜き画像作成＆色抜き画像で元画像を覆う

Use:Flashによくある、徐々に白くなって元に戻る、みたいなエフェクトをかけたい時に使う
Note:元画像を覆うのはjQuery依存
Required:画像が読み込まれてから使うこと
Usage:

単に色抜き画像が欲しいなら
var img = $.colorizeImage(imgObj,color);

※webkit-transformを使わないなら
maskWithWhiteImage(imgObj);
でもいい。但しwebkit-transform使うと一瞬マスクされない状態が表示されてしまう。
---------------------------------------- */
$.extend({
	coloredImageCanvas:function(imgObj,color){
		if(!color){
			color = "#FFF";
		}
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext('2d');
		canvas.width = imgObj.width;
		canvas.height = imgObj.height;
		ctx.beginPath();
		ctx.fillStyle=color;
		ctx.fillRect(0, 0, imgObj.width, imgObj.height);
		ctx.closePath();
		ctx.globalCompositeOperation = "destination-in";
		ctx.drawImage(imgObj, 0, 0);
		return canvas;
	},
	coloredImage:function(imgObj,color){
		var img = new Image();
		img.src = $.coloredImageCanvas(imgObj,color).toDataURL();
		return img;
	}
}).fn.extend({
	coverWithColoredCanvas: function(color) {
		return this.each(function() {
			if(this.tagName != 'IMG' || $.data(this,"colored")){
				return;
			}
			var imgObj = this;
			var elem = $(this);
			var tempImg = new Image();
			tempImg.onload = function(){
				$.data(this,"colored",true);
				var img = $.coloredImageCanvas(this,color);
				$(img).addClass('colored-cover').css({opacity:0,position:"absolute",top:0,left:0});
				var w = this.width;
				var h = this.height;
				if(w == 0){
					w = 'auto';
				}
				if(h == 0){
					h = 'auto';
				}
				if(typeof(w)=='number'){
					w += "px";
				}
				if(typeof(h)=='number'){
					h += "px";
				}
				elem.wrap("<div>").before(img).parent().addClass("img-wrapper").css({display:"inline-block",position:"relative",width:w,height:h});
			}
			tempImg.src = imgObj.src;
		});
	},
	coloredCover: function(color) {
		return this.each(function() {
			if(this.tagName != 'IMG' || $.data(this,"colored")){
				return;
			}
			var imgObj = this;
			var elem = $(this);
			var msk = document.createElement("div");
			var w = imgObj.width;
			var h = imgObj.height;
			if(w == 0){
				w = 'auto';
			}
			if(h == 0){
				h = 'auto';
			}
			if(typeof(w)=='number'){
				w += "px";
			}
			if(typeof(h)=='number'){
				h += "px";
			}
			$(msk).addClass('colored-cover').css({opacity:0,position:"absolute",top:0,left:0,webkitMaskImage:"url("+imgObj.src+")",background:"-webkit-gradient(linear,0% 0%,0% 100%,from(#FFF),to(#FFF))",width:"100%",height:"100%"});
			elem.wrap("<div class='img-wrapper' style='display: inline-block;position:relative;width:"+w+";height:"+h+";'>").before(msk);
			$.data(imgObj,"colored",true);
		});
	},
	colorize: function(color){
		return this.each(function() {
			var temp = document.createElement('div');
			temp.style.color = color;
			color = temp.style.color;
			var rgbPart = color.match(/rgb(\([^\)]+)/i);
			rgbPart = rgbPart[1];
			//console.log(rgbPart);
			var elem = $(this);
			elem.add(elem.find("*")).each(function(){
				var obj = {};
				if(this.tagName == "IMG"){
					/*
					// 幅と高さを入れ、contentを入れ、inline-blockにして指定色を入れ、元のsrcをマスクにする
					obj.backgroundImage = "-webkit-gradient(linear,0% 0%,0% 100%,from("+color+"),to("+color+"))";
					obj.webkitMaskImage="url("+this.src+")";
					obj.webkitMaskRepeat = "no-repeat";
					var img = document.createElement('img');
					var self = this;
					img.onload = function(){
						img.width = img.width;
						img.height = img.height;
						img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12NgYAAAAAMAASDVlMcAAAAASUVORK5CYII=";
						$(self).replaceWith($(this).css(obj));
					}
					img.src = this.src;
					*/
					var img = document.createElement('img');
					var self = this;
					img.onload = function(){
						var canvas = $.coloredImageCanvas(this,color);
						$(self).replaceWith(canvas);
					}
					img.src = this.src;
				} else{
					// 色系プロパティがあったら全部変更
					var styleObj = getComputedStyle(this, '');
					for(var i in styleObj){
						var key = styleObj[i];
						var val = styleObj[key];
						if(typeof(val) == 'string' && val.match(/(rgba*\(.+?\)|#[0-9]{6}|#[0-9]{3})/i)){
							obj[key]=val.replace(/(rgb\(.+?\)|#[0-9]{6}|#[0-9]{3})/ig,color).replace(/rgba\([^,\)]+,[^,\)]+,[^,\)]+/ig,"rgba"+rgbPart);
						}
					}
					$(this).css(obj);
				}
			})
		});
	}
});