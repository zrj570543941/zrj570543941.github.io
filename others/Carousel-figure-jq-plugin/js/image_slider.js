function cssTransform(el,attr,val) {
	if(!el.transform){
		el.transform = {};
	}
	if(arguments.length>2) {
		el.transform[attr] = val;
		var sVal = "";
		for(var s in el.transform){
			switch(s) {
				case "rotate":
				case "skewX":
				case "skewY":
					sVal +=s+"("+el.transform[s]+"deg) ";
					break;
				case "translateX":
				case "translateY":
					sVal +=s+"("+el.transform[s]+"px) ";
					break;
				case "scaleX":
				case "scaleY":
				case "scale":
					sVal +=s+"("+el.transform[s]+") ";
					break;	
			}
			el.style.WebkitTransform = el.style.transform = sVal;
		}
	} else {
		val  = el.transform[attr];
		if(typeof val == "undefined" ) {
			if(attr == "scale" || attr == "scaleX" || attr == "scaleY"  ) {
				val = 1;
			} else {
				val = 0;
			}
		}
		return val;
	}
}
// 写插件的框架
(function($) {    //第一步，把所有写插件的代码都包在一个匿名函数里

	var defaults = {  //第三步，写默认参数
		img_src: ["img/1.jpg", "img/2.jpg", "img/3.jpg"], //移动版本img图片地址
		img_src_pc_version: ["img/1.jpg", "img/2.jpg", "img/3.jpg"], //pc版本img图片地址
		pc_img_height: "3.0625rem",   //pc版本所需的设置，img-slider，slider-img-wrapper，img-wrapper0img都会是这个宽度
		mobile_img_height: "5rem",  //移动端版本所需的设置，img-slider，slider-img-wrapper，img-wrapper0img都会是这个宽度
		mobile_img_sign_wrapper_pos_to_bottom: "0.3rem", //移动端版本圆形图标相对底部位置的设置
		transitionTime: "0.3s",
		autoPlayTime: 2000,
		click_btn_least_gap: 1000 //当两次点击之间时间间隔大于1s时才能继续切换图片，防止连续点击一直切换图片的问题

    };
    


    function specifyCssStyle(settings) {
    	var doc = document;
    	var doc_width = document.documentElement.clientWidth;
    	var $img_slider = $(".img-slider");
    	var img_src = settings.img_src;
    	var img_src_len = img_src.length;
    	var $slider_img_wrapper = $(".slider-img-wrapper");
    	var $img_slider_img  = $(".img-slider-img");

    	$img_slider.css("height", doc_width > 912 ? settings.pc_img_height : settings.mobile_img_height);
    	$slider_img_wrapper.css({
    		"width": doc_width > 912 ? img_src_len * doc_width + "px" : img_src_len * doc_width * 2 + "px",
    		"height": doc_width > 912 ? settings.pc_img_height : settings.mobile_img_height
    	});//根据图片张数确定img-wrapper宽度
    }






    //根据用户提供img_src的数目自动生成多少个img插入slider-img-wrapper中
    function createImg(settings) {
    	var doc = document;
    	var doc_width = document.documentElement.clientWidth;
    	var img_src = doc_width > 912 ? settings.img_src_pc_version : settings.img_src; //根据是移动版本还是pc选择合适的图片
    	var $slider_img_wrapper = $(".slider-img-wrapper");
    	var dom_frame = document.createDocumentFragment() ;

    	for (var i = img_src.length - 1; i >= 0; i--) {
    		var $new_img = $("<img>", {
    			"src":  img_src[i],
    			"class": "img-slider-img",
    			"height": settings.pc_img_height
    		});

   			$new_img.css("height", doc_width > 912 ? settings.pc_img_height : settings.mobile_img_height); //移动端和pc端不一样的图片高度设置

    		$new_img.css("width", doc_width + "px");
    		var $new_link = $("<a></a>");

    		$new_link.append($new_img);

    		$(dom_frame).prepend($new_link);
    	}
    	if (doc_width > 912) {
    		$slider_img_wrapper.append($(dom_frame));
    	} else {
    		$slider_img_wrapper.append($(dom_frame));
    		$slider_img_wrapper[0].innerHTML += $slider_img_wrapper[0].innerHTML;
    	}
    	
    }


    //根据用户提供img_src的数目自动生成多少个圆形标插入img-sign-wrapper中指示当前图片滑动状况之用
    function createImgSign(settings) {
    	var doc = document;
    	var doc_width = doc.documentElement.clientWidth;
    	var img_src = settings.img_src;
    	var img_src_len = img_src.length;
    	var $img_sign_wrapper = $(".img-sign-wrapper");
    	var $dom_frame = $( doc.createDocumentFragment() );

    	//根据img_src的长度动态设置img_sign_wrapper的宽度
    	if (doc_width < 912) {
    		$img_sign_wrapper.css({
    		"width": 0.4 * img_src_len + "rem",
    		"bottom": settings.mobile_img_sign_wrapper_pos_to_bottom
	    	});
    	} else {
    		$img_sign_wrapper.css({
    		"width": img_src_len * 16 * 2 + "px"
	    	});
    	}
    	

    	for (var i = img_src_len - 1; i >= 0; i--) {
    		var $new_sign = $("<span>", {
    			"class": "img-sign"
    		});


    		$dom_frame.prepend($new_sign);
    	}

    	$img_sign_wrapper.append($dom_frame);
    }




    
    
    function slideImgPcversion(settings) {
    	var img_src = settings.img_src;
    	var img_src_len = img_src.length;
    	var img_src_len_minus_one = img_src_len - 1;
    	var $image_slider = $(".image-slider");
		var $slider_img_wrapper = $(".slider-img-wrapper");
		var $go_former_link = $(".go-former-link");
		var $go_latter_link = $(".go-latter-link");
		var $img_sign = $(".img-sign");
		var img_index = 0;
		var vp_width = document.documentElement.clientWidth;
		var timer = null;


		// 点击向右轮播时图片会向左滑动，滑到最后一张时切换回第一张
		function autoSwitchPic(event) {
			var $slider_img_wrapper = $(".slider-img-wrapper");
			if (img_index >= img_src_len_minus_one) {
				img_index = 0;
				$slider_img_wrapper.animate({left: "0"});
				$img_sign.eq(img_index).addClass("img-sign-active")
				.siblings().removeClass("img-sign-active");
				return;
			}
			img_index++;
			
			$slider_img_wrapper.animate({left: "-=" + vp_width});

			$img_sign.eq(img_index).addClass("img-sign-active")
				.siblings().removeClass("img-sign-active");
		}
		// 为防止连续点击一直切换图片的问题
		var prev_clicked_time, cur_clicked_time;
		$go_latter_link.on("click", function(event) {
			cur_clicked_time = new Date();
			clearInterval(timer);
			//只有在第一次点击切换按钮时或两次点击之间时间间隔大于1s时才能继续切换图片，防止连续点击一直切换图片的问题
			if (!prev_clicked_time || cur_clicked_time - prev_clicked_time > settings.click_btn_least_gap) {
				autoSwitchPic(event);
			}
			
			prev_clicked_time = cur_clicked_time;
		});

		$go_former_link.on("click", function(event) {
			cur_clicked_time = new Date();
			clearInterval(timer);
			if (!prev_clicked_time || cur_clicked_time - prev_clicked_time > settings.click_btn_least_gap) {
				var $slider_img_wrapper = $(".slider-img-wrapper");
				//只有在第一次点击切换按钮时或两次点击之间时间间隔大于1s时才能继续切换图片，防止连续点击一直切换图片的问题
				if (img_index <= 0) {
					img_index = img_src_len_minus_one;
					$slider_img_wrapper.animate({left: -img_src_len_minus_one * vp_width + "px" });
					$img_sign.eq(img_index).addClass("img-sign-active")
					.siblings().removeClass("img-sign-active");
					return;
				}
				img_index--;
				
				$slider_img_wrapper.animate({left: "+=" + vp_width});

				$img_sign.eq(img_index).addClass("img-sign-active")
					.siblings().removeClass("img-sign-active");

			}
			
			prev_clicked_time = cur_clicked_time;

		});

		$img_sign.on("click", function(event) {
			clearInterval(timer);
			var $slider_img_wrapper = $(".slider-img-wrapper");
			var index = $(this).index();
			img_index = index;
			$(this).addClass("img-sign-active")
				.siblings().removeClass("img-sign-active");

			$slider_img_wrapper.animate({left: -1 * index * vp_width + "px" });
		});

		
		// 让图片可以自动轮播，当鼠标滑入时暂停，划出时继续轮播
		timer = setInterval(autoSwitchPic, settings.autoPlayTime);
		$slider_img_wrapper.on("mouseover", function() {
			clearInterval(timer);
		})
		.on("mouseout", function() {
			timer = setInterval(autoSwitchPic, settings.autoPlayTime);
		});
    }







	function slideImg(options) {

		


		var doc_width = document.documentElement.clientWidth;
		var timer = null;
		var time_num = 0; //记录开启定时器次数
		var settings = $.extend({}, defaults, options); //第四步，配置参数覆盖默认参数
		var img_src = settings.img_src;
		var img_sum = img_src.length;
		var $slider_img_wrapper = $(".slider-img-wrapper");
		var iCur_translate_X = 0; //记录图片move过程中translateX的值
		var iNow = 0;  //
		var iLast_translate_X = 0; //记录没move之前的translateX的值,也可以理解为上次的translate所在的位置
		var iStartX = 0; //记录手指触摸时的初始位置




		function autoPlayPic($slider_img_wrapper, settings, img_src) {
			
	    	var doc_width = document.documentElement.clientWidth;
	    	var oppo_doc_width = -doc_width; //doc_width的相反数
	    	var img_src_len = img_src.length; //3
	    	var i_opposite_img_sum_minus_one = -(img_sum - 1); //-2
	    	// var i_swipe_to_last_pic_pos = doc_width * i_opposite_img_sum_minus_one; //已划到最后一张图片时的translate值
	    	var i_swipe_to_last_pic_pos = -(img_sum * 2 - 1) * doc_width; //img_src总数目的双倍减一，表示当滑到最后一张图的translate值
	    	if (iCur_translate_X === i_swipe_to_last_pic_pos) {
	    		$slider_img_wrapper.css("transition", "none");
	    		iCur_translate_X = -(img_src_len - 1) * doc_width;
	    		cssTransform($slider_img_wrapper[0], "translateX", iCur_translate_X);
	    		setTimeout( rightAddOnePic,10);
	    		return;
	    	}

	    	function rightAddOnePic() {
	    		iCur_translate_X -= doc_width;
	    	
		    	$slider_img_wrapper.css({
		    		"transition": settings.transitionTime
		    		
		    		
		    	});
		    	cssTransform($slider_img_wrapper[0], "translateX", iCur_translate_X);
		    	//只有当第一次或因手指触摸过后而重新开启定时器时才执行此步骤 
	    		$slider_img_wrapper.on("transitionend", updateLastTranslateX);	
	    	}
	    	rightAddOnePic();
    		
	    	
	    }

	    // 在每次滑动过渡完毕后准确定位img-sign哪个该亮
	    function activeSpecificSign() {
	    	var $img_sign = $(".img-sign");
	    	iCur_translate_X = cssTransform($(".slider-img-wrapper")[0], "translateX");
			var index = -(iCur_translate_X / doc_width) % $img_sign.length;

			$img_sign
				.eq(index).addClass("img-sign-active")
				.siblings().removeClass("img-sign-active");
	    }
	    

	    function updateLastTranslateX() {
			iLast_translate_X = iCur_translate_X; //当每一次定时器里的transition完成后更新上一次滑动位置的值
		}

		function clearTimer() {
			clearInterval(timer);
			$slider_img_wrapper.off("transitionend", clearTimer);
		}

		// 手指触摸时立即清定时器，并把timer_num重设为0，以备下次重开定时器时可以继续正常的更新last_translate_x的值
		function getInitPicpos(e) {
			
			time_num = 0;

			$(this).off("transitionend", updateLastTranslateX);

			clearInterval(timer);

			$(this).css("transition", "none");

			iStartX = e.originalEvent.touches[0].clientX;
			if (iLast_translate_X === 0) {
				cssTransform(this, "translateX", - img_sum * doc_width );	
			} else if (iLast_translate_X === - (img_sum * 2 - 1) * doc_width ) {
				cssTransform(this, "translateX", - (img_sum - 1) * doc_width );
			}
			iLast_translate_X = cssTransform(this, "translateX");
		}


		function movePic(e) {
			var iCurX = e.originalEvent.touches[0].clientX; //记录手指移动时的不断变化的位置
			iCur_translate_X = iLast_translate_X + (iCurX - iStartX);
			// $slider_img_wrapper.css("transform",  "translateX(" + iCur_translate_X + "px)" );
			cssTransform(this, "translateX", iCur_translate_X);
			e.preventDefault();
		}
			
		function switchPic(e) {
			var doc_width = document.documentElement.clientWidth;
			var img_sum = img_src.length;
			var img_sum_minus_one = img_sum - 1;
			var opposite_img_sum_minus_one = -img_sum_minus_one; //img_sum_minus_one的相反数
			var last_pic_swipe_over_half_num = opposite_img_sum_minus_one - 0.5;//最后一张图片滑屏超过一半时所表示的数字，用来与下面的cur_scroll_ratio_with_vp_width比较
			var first_pic_swipe_over_half_num = 0.5;
			var doc_width = document.documentElement.clientWidth;

			//添加transition是为了让在手指滑动图片滑动到一半离开时能够平滑的切向下一张图片
			$(this).css("transition", settings.transitionTime);
			//在过渡完成后撤销transition效果，让transition只在手指离开时才起作用
			$(this).on("transitionend", function(e) {
				$(this).css("transition", "none");



			});
			 
			
			var changing_translateX_val_to_last_translateX = iCur_translate_X - iLast_translate_X; //手指将要松开瞬间translateX值相对于上次translateX的差值
			var changing_translateX_val_to_doc_width_ratio = changing_translateX_val_to_last_translateX / doc_width; //上面这行变量与屏幕宽度的比率

			var decimal_part, be_added_val;
			// 手指向左滑时
			if (changing_translateX_val_to_doc_width_ratio < 0) {
				decimal_part = Math.abs(changing_translateX_val_to_doc_width_ratio);  //得到小数部分， 如从第0张图片向右滑动到-0.8屏宽的translatex位置就得到0.8

				//比如从-1屏宽滑到-0.,2屏宽得到的小数部分为0.2，大于0.25，当前translatex值会从-0.8屏宽变为-0屏宽，即滑到前一张图片，若是从-1屏宽滑到-0.8屏宽得到的小数部分为0.2，小于0.25，当前translatex值不会变，即滑回原图
				be_added_val = decimal_part >= 0.25 ? Math.floor(changing_translateX_val_to_doc_width_ratio) * doc_width : Math.ceil(changing_translateX_val_to_doc_width_ratio) * doc_width;
				
				// if (iCur_translate_X < (opposite_img_sum_minus_one - 0.25) * doc_width) {
				// 	iCur_translate_X = 0;
				// //正常情况下在图片之间滑动时，根据当前translatex根据情况是否加值，即是否滑向后一张图片
				// } else {
				// 	iCur_translate_X = iLast_translate_X + be_added_val;
				// }
				

				iCur_translate_X = iLast_translate_X + be_added_val;
				
				
				

				
				
			// 手指向右滑时
			} else if (changing_translateX_val_to_doc_width_ratio > 0) {

				decimal_part = changing_translateX_val_to_doc_width_ratio; //举例，图片从0开始计数，当translatex从上次的-1屏宽滑到手指将要松开瞬间的-0.8屏宽时，此时小数部分为0.2，若是滑到了-0.2屏宽，此时小数部分为0.8

				//当小数部分小于0.25时，要加的值为0， 当大于0.25时，要加的值为1屏宽
				be_added_val = decimal_part >= 0.25 ? Math.ceil(changing_translateX_val_to_doc_width_ratio) * doc_width : Math.floor(changing_translateX_val_to_doc_width_ratio) * doc_width;

				// 当在第0张图了还向右滑动超过0.25屏幕就滑到最后一张图去，没超过则跟正常情况走
				// if (iCur_translate_X > 0.25 * doc_width) {
				// 	iCur_translate_X = opposite_img_sum_minus_one * doc_width;
				// //正常情况下在图片之间滑动时，根据当前translatex根据情况是否加值，即是否滑向后一张图片
				// } else {
				// 	iCur_translate_X = iLast_translate_X + be_added_val;
				// }
				
				iCur_translate_X = iLast_translate_X + be_added_val;

			}
			
			// $slider_img_wrapper.css("transform", "translateX(" + iCur_translate_X + "px)");
			cssTransform(this, "translateX", iCur_translate_X);
			iLast_translate_X = cssTransform(this, "translateX"); //滑动完成重置上一次滑动位置的值

			timer = setInterval(function() {
				autoPlayPic($slider_img_wrapper, settings, img_src);
			}, settings.autoPlayTime);
		}


		specifyCssStyle(settings);
		createImg(settings);
		createImgSign(settings);


		// 只在小和中屏下用此方法，否则用slideimg的pc版本来做轮播图
		if (document.documentElement.clientWidth > 912) {
			slideImgPcversion(settings);
			return;
		}



		timer = setInterval(function() {
			autoPlayPic($slider_img_wrapper, settings, img_src);
		}, settings.autoPlayTime); 
		
		$slider_img_wrapper.on("touchstart", getInitPicpos);
		$slider_img_wrapper.on("touchmove", movePic);
		$slider_img_wrapper.on("touchend", switchPic);

		$slider_img_wrapper.on("transitionend", activeSpecificSign);


		return this;  //第四步和第五步间写你想写的插件的功能，最后一步一定要返回jQuery对象保证后续可以继续进行链式操作
	}

	$.fn.extend({  //第二步，用$.fn.extend或$.extend来写插件，这里这样写以后就可以$(...).tabs()来调用
		sliding: slideImg
	});
}) (jQuery);

$(".img-slider").sliding({
	img_src: ["img/image-slider/1.jpg", "img/image-slider/2.jpg", "img/image-slider/3.jpg"],
	img_src_pc_version: ["img/image-slider/1_pc.jpg", "img/image-slider/2_pc.jpg", "img/image-slider/3_pc.jpg" ]
});