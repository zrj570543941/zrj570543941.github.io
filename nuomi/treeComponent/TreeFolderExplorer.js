/*
	参数解释：支持普通标签名，伪类选择器，类选择器，id选择器等
	返回一个数组，每个数组元素为满足selector的cssRule对象
	解释：cssRule指的是<style>或<link>中每个定义选择器以及其定义的样式，在js中以对象表示
*/
function ruleSelector(selector) {
    function uni(selector) {
        return selector.replace(/::/g, ':')
    }
    return Array.prototype.filter.call(Array.prototype.concat.apply([], Array.prototype.map.call(document.styleSheets, function(x) {
        return Array.prototype.slice.call(x.cssRules);
    })), function(x) {
        return uni(x.selectorText) === uni(selector);
    });
}

function extend(defaults, configs) {
	for (var attr in configs) {
		defaults[attr] = configs[attr];
	}
	return defaults;
}
/*
	configs格式{
		data,
		rootName //表示当前根节点的名称
	}
	data接受的格式：
	var data = 
	[
		{
			name: "父节点1", 
			children: [ {name: "子节点1"}, {name: "子节点2"} ]
		}, 
	 	{
	 		name: "父节点2", 
	 		children: [ 
		 		{name: "子节点3"}, {name: "子节点4", children:[ {name:"子节点5"} ]} 
	 		]
	 	} 
	];
*/
function TreeFolderExplorer(configs) {
	this.defaults = {};
	extend(this.defaults, configs);

	// this.data = data;

	this.init();
}

TreeFolderExplorer.prototype = {
	constructor: TreeFolderExplorer,
	init: function() {
		var doc = document,
		  rootNode = doc.getElementsByClassName('TreeFolderExplorer__rootNode')[0],
			defaults = this.defaults;

		this.generateTreeRoot(defaults.rootName);	
		this.generateTreeStructure(defaults.data, rootNode);
		this.toggleChildList();
	},
	//用来创建树的根节点的名称
	generateTreeRoot: function(rootName) {
		var doc = document,
			rootNode = doc.getElementsByClassName('TreeFolderExplorer__rootNode')[0];
		rootNode.innerHTML = `<span class="toggleChildListSign">&or;</span>${rootName}`;
	},
	/*
		方法作用：用来根据当前传入组件的data配置参数来生成完成的tree dom结构并插入页面
		参数解释：
			data:代表传入当前组件的数据里的data配置参数里可能包含的每个数组或子数组
			node：当前data数组里的所有item所代表的节点的直接父级节点
	*/
	generateTreeStructure: function(data, node) {
		var defaults = this.defaults,
		_context = this;
		data.forEach(function(item) {
			const newTreeNode = document.createElement('div');
			
			if ("children" in item) {
				newTreeNode.innerHTML = `<span class="toggleChildListSign">&or;</span>${item["name"]}`;
				newTreeNode.classList.add('TreeFolderExplorer__descendantNode');
				_context.generateTreeStructure(item["children"], newTreeNode);
			} else {
				newTreeNode.innerHTML = item["name"];
				newTreeNode.classList.add('TreeFolderExplorer__leafNode');
			}
			node.appendChild(newTreeNode);
		});
	},

	// 展开或关闭直接孩子列表功能
	toggleChildList: function() {
		var doc = document,
			TreeFolderExplorer__rootNode = doc.getElementsByClassName('TreeFolderExplorer__rootNode')[0],
			TreeFolderExplorer__descendantNodes = doc.getElementsByClassName('TreeFolderExplorer__rootNode');

		TreeFolderExplorer__rootNode.addEventListener('click', function (e) {
			var target = e.target;

			Array.prototype.forEach.call(target.children, function(node, index) {
				var isVisible = getComputedStyle(node).display;
				if (node.classList.contains('toggleChildListSign')) {
					node.innerHTML = node.innerHTML === "&gt;" ? "&or;" : "&gt;";
					return;
				}

				node.style.display = isVisible === "block" ? "none" : "block";
			});
		}, false);
	}
};




