(function(){
	//行政区搜索实例，地图实例，多边形实例
	var district,map,polygons;
	//dom元素
	var searchInput,searchButton,textArea;
	
	//页面启动
    function init(){
    	//初始化地图对象，加载地图
	    map = new AMap.Map("borderPane", {
	        resizeEnable: true,
	        center: [116.397428, 39.90923],//地图中心点
	        zoom: 10 //地图显示的缩放级别
	    });
	    //加载行政区划插件
        AMap.service('AMap.DistrictSearch', function() {
            var opts = {
                subdistrict: 1,   //返回下一级行政区
                extensions: 'all',  //返回行政区边界坐标组等具体信息
                level: 'district'  //查询行政级别为 市
            };
            //实例化DistrictSearch
            district = new AMap.DistrictSearch(opts);
            district.setLevel('district');
        });
        polygons=[];
	    //dom
	    searchInput=document.getElementById("search-input");
	    searchButton=document.getElementById("search-button");
	    textArea=document.getElementById("text-area");
	    bindListener();
    }

    //绑定dom事件
    function bindListener(){
    	searchButton.addEventListener("click",function(event){
            if(searchInput.value==""){
                alert("请输入查询内容！");
                return;
            }
    		textArea.innerHTML="loading...";
    		search(searchInput.value);
    	},false);
    }

    function search(area) {
        	//行政区查询
			district.search(area, function(status, result) {
                var bounds = result.districtList[0].boundaries;
                map.remove(polygons);
                polygons = [];
                if (bounds) {
                    for (var i = 0, l = bounds.length; i < l; i++) {
                        //生成行政区划polygon
                        var polygon = new AMap.Polygon({
                            strokeWeight: 1,
                            path: bounds[i],
                            fillOpacity: 0.7,
                            fillColor: '#CCF3FF',
                            strokeColor: '#CC66CC'
                        });
                        polygons.push(polygon);
                    }
                    map.add(polygons);
                    map.setFitView();//地图自适应
                    //处理坐标数据，展示
                    var borders;
                    /*for(i=0,l=bounds.length;i<l;i++){
                    	borders.push(bounds);
                    }*/

                    //简化深拷贝
                    borders=JSON.parse(JSON.stringify(bounds));
                    recursive(borders);
                    //递归，将每个底层的坐标对象数据修改成[lng,lat]数据
                    function recursive(arr){
                    	var m,n;
                    	if(arr instanceof Array || Object.prototype.toString.call(arr)  ===  "[object Array]"){
                    		for(m=0,n=arr.length;m<n;m++){
                    			arr[m]=recursive(arr[m]);
                    		}
                    		return arr;
                    	}else{
                    		return [arr.lng,arr.lat];
                    	}
                    }
                    //中国有3M数据，数组长度16万

                    textArea.innerHTML=result.districtList[0].name+":  "+JSON.stringify(borders);
                }
            });            
    }

    init();
})();