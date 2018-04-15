## 功能
自制基于jq的轮播图插件，pc端就是普通的向左向右功能，手机端则是无缝切换功能
## 如何使用

1. 先在html文件里写如下html模板：
```
<div class="img-slider">
			<div class="slider-img-wrapper">
			</div>
			<a href="javascript:;" class="go-former-link"><</a>
			<a href="javascript:;" class="go-latter-link">></a>
			<div class="img-sign-wrapper">
			</div>
</div>
```

2. 在你的html文件里引入css和js文件
3. 最后一步，在你的js文件里配置即可,如下：
```
$(".img-slider").sliding({
	img_src: ["img/image-slider/1.jpg", "img/image-slider/2.jpg", "img/image-slider/3.jpg"],
	img_src_pc_version: ["img/image-slider/1_pc.jpg", "img/image-slider/2_pc.jpg", "img/image-slider/3_pc.jpg" ]
});
```
##各配置项说明

- img_src和img_src_pc_version

前者指明移动端的图片地址，后者指明pc端的图片地址，图片地址都放在一个array当中

- mobile_img_height和pc_img_height

指定图片的高度，类型为字符串，如"3.0625rem"

- transitionTime

仅针对移动端的参数，指定每次手指脱离时切换两张图片时的运动的毫秒数

- click_btn_least_gap

仅针对pc的参数，指定用户两次点击切换图片按钮间的最少时间间隔的毫秒数，是为防止用户连续点击而连续切换图片。<br/>
