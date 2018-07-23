;(function($){   //加分号，引入时闭合前一个script脚本

	var Carousel = function(poster){
		var _self_ = this;
		//保存单个旋转木马对象
		this.poster = poster;
		this.posterItemMain = poster.find("ul.poster-list");
		this.nextBtn = poster.find("div.poster-next-btn");
		this.prevBtn = poster.find("div.poster-prev-btn");
		this.posterItems = poster.find("li.poster-item");
		//偶数帧实现方式
		if(this.posterItems.length%2==0){
			this.posterItemMain.append(this.posterItems.eq(0).clone());
			this.posterItems = this.posterItemMain.children();
		};
		this.posterFirstItem = this.posterItems.first();
		this.posterLastItem = this.posterItems.last();
		this.rotateFlag = true;
		

		//默认配置参数
		this.setting = {
						 "width": 1000,  //幻灯片的的宽度
						 "height": 320,   //幻灯片的高度
						 "posterWidth":480,  //幻灯片第一帧的宽度
						 "posterHeight": 320,  //幻灯片第一帧的高度
						 "scale": 0.9,     //记录显示比例关系
						 "speed": 500,
						 "autoPlay":false,
						 "delay": 5000,
						 "verticalAlign": "middle"
						};
		$.extend(this.setting, this.getSetting());
		/*console.log(this.setting);
		console.log(this.getSetting());*/

		//设置配置参数值
		this.setSettingValue();
		this.setPosterPos();

		this.nextBtn.click(function() {
			if(_self_.rotateFlag){
				_self_.rotateFlag = false;
				_self_.carouseRotate("left");
			};
		});
		this.prevBtn.click(function() {
			if(_self_.rotateFlag){
				_self_.rotateFlag = false;
				_self_.carouseRotate("right");
			};
		});
		//是否开启自动播放
		if(this.setting.autoPlay){
			this.autoPlay();
			this.poster.hover(function(){
								window.clearInterval(_self_.timer);
							}, function(){
								_self_.autoPlay();
							})
		};
	};

	Carousel.prototype = {

		//
		autoPlay: function() {
			var self_ = this;
			this.timer = window.setInterval(function(){		
				self_.nextBtn.click();
			}, this.setting.delay);
		},

		//旋转
		carouseRotate: function(dir) {
			var _this_ = this;
			var zIndexArr = [];
			if(dir === "left"){
				this.posterItems.each(function(){
					var _self_ = $(this);
					var prev = _self_.prev().get(0) ? _self_.prev() :_this_.posterLastItem,
					width = prev.width(),
					height = prev.height(),
					zIndex = prev.css("zIndex"),
					opacity = prev.css("opacity"),
					left = prev.css("left"),
					top = prev.css("top");
					zIndexArr.push(zIndex);

					_self_.animate({
						width: width,
						height: height,
						zIndex: zIndex,
						opacity: opacity,
						left: left,
						top: top
					},_this_.setting.speed,function(){
						_this_.rotateFlag = true;
					});
				});
				this.posterItems.each(function(i){
                    $(this).css("zIndex", zIndexArr[i]);
				})
			}else if(dir === "right") {
				this.posterItems.each(function(){
					var _self_ = $(this);
					var next = _self_.next().get(0) ? _self_.next() :_this_.posterFirstItem,
					width = next.width(),
					height = next.height(),
					zIndex = next.css("zIndex"),
					opacity = next.css("opacity"),
					left = next.css("left"),
					top = next.css("top");

					_self_.animate({
						width: width,
						height: height,
						zIndex: zIndex,
						opacity: opacity,
						left: left,
						top: top
					},_this_.setting.speed,function(){
						_this_.rotateFlag = true;
					});
				});
			}			
		},

		//设置剩余的帧的位置关系
		setPosterPos: function(){
			var _self = this;
			var sliceItems = this.posterItems.slice(1),
			    sliceSize = sliceItems.length/2,
			    rightSlice = sliceItems.slice(0,sliceSize),
			    level = Math.floor(this.posterItems.length/2);
			    leftSlice = sliceItems.slice(sliceSize);



			//alert(level);

			//设置右边帧的位置关系和宽度高度top
			var rw = this.setting.posterWidth,
			    rh = this.setting.posterHeight,
			    gap = ((this.setting.width - this.setting.posterWidth)/2)/level;

            var firstLeft = (this.setting.width - this.setting.posterWidth)/2;
			var fixOffsetLeft = firstLeft + rw;

			
			rightSlice.each(function(i){

				level--;
				rw = rw * _self.setting.scale;
				rh = rh * _self.setting.scale;

				var j = i;

				$(this).css({
								zIndex: level, 
								width: rw,
								height: rh, 
								opacity: 0.99/(++j),
								left: fixOffsetLeft + (++i) * gap - rw,
								top: _self.setVertucalAlign(rh)/*(_self.setting.height - rh)/2*/
							})
			    });
			//设置左边的位置关系
			var lw = rightSlice.last().width(),
			    lh = rightSlice.last().height(),
			    oloop = Math.floor(this.posterItems.length/2);

			leftSlice.each(function(i){

				$(this).css({
								zIndex: i,
								width: lw,
								height: lh,
								opacity: 0.99/oloop,
								left: i * gap,
								top: _self.setVertucalAlign(lh)/*(_self.setting.height - lh)/2*/
				            });
				lw = lw/_self.setting.scale;
				lh = lh/_self.setting.scale;
				oloop--;									
			});
			    //alert(rightSlice.length);
		},

		//设置垂直排列对齐
		setVertucalAlign: function(height){
			var verticalType = this.setting.verticalAlign,
			    top = 0;
			if(verticalType === "middle") {
				top = (this.setting.height - height)/2;
			}else if(verticalType === "top") {
				top = 0;
			}else if(verticalType === "bottom") {
				top = this.setting.height - height;
			}else{
				top = (this.setting.height - height)/2;
			};
			return top;

		},

		//设置配置参数值去控制基本的宽度高度
		setSettingValue: function(){
			this.poster.css({
								width: this.setting.width,
								height: this.setting.height
							});
			this.posterItemMain.css({
				                width: this.setting.width,
								height: this.setting.height
							});
			//计算上下切换按钮的宽度
			var w = (this.setting.width - this.setting.posterWidth)/2;
			//alert(this.posterItms.size()/2);
			this.nextBtn.css({
								width: w,
								height: this.setting.height,
								zIndex: Math.ceil(this.posterItems.length/2)
							});
			this.prevBtn.css({
								width: w,
								height: this.setting.height,
								zIndex: Math.ceil(this.posterItems.length/2)
							});
			this.posterFirstItem.css({
										width: this.setting.posterWidth,
										height: this.setting.posterHeight,
										left: w,
										zIndex: Math.floor(this.posterItems.length/2)
									});
		},

		//获取人工配置参数
		getSetting: function(){

			var setting = this.poster.attr("data-setting");
			/*$.parseJSON(setting);
			return setting;*/
			if(setting && setting != "") {
				return $.parseJSON(setting);
			}else{
				return null;
			}
		}

	}

	Carousel.init = function(posters){
		var _this_ = this;
		posters.each(function(){
			new _this_($(this));
		});
	};

	window["Carousel"] = Carousel;



})(jQuery);