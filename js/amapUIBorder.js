(function(){
    //行政区搜索实例，地图实例，多边形实例
    var map,polygons,DistrictExplorer;
    //dom元素
    var searchCity,searchDistrict,searchButton,textArea;

    //页面启动
    function init(){
        //初始化地图对象，加载地图
        map = new AMap.Map("borderPane", {
            resizeEnable: true,
            center: [116.397428, 39.90923],//地图中心点
            zoom: 10 //地图显示的缩放级别
        });
        polygons=[];
        //dom
        searchCity=document.getElementById("search-city");
        searchDistrict=document.getElementById("search-district");
        searchButton=document.getElementById("search-button");
        textArea=document.getElementById("text-area");
        bindListener();
        //加载DistrictExplorer，loadUI的路径参数为模块名中 'ui/' 之后的部分
        AMapUI.loadUI(['geo/DistrictExplorer'], function(de) {
            DistrictExplorer=de;
        });
    }

    //绑定dom事件
    function bindListener(){
        searchButton.addEventListener("click",function(event){
            if(searchCity.value==""){
                alert("请输入市编码！");
                return;
            }
            if(searchDistrict.value==""){
                alert("请输入区编码！");
                return;
            }
            textArea.innerHTML="loading...";
            search(searchCity.value,searchDistrict.value);
        },false);
    }

    //处理坐标方法
    function getLongestRing(feature) {
        var rings = getAllRings(feature);
        rings.sort(function (a, b) {
            return b.length - a.length;
        });
        return rings[0];
    }

    //处理坐标方法
    function getAllRings(feature) {
        var coords = feature.geometry.coordinates,
            rings = [];
        for (var i = 0, len = coords.length; i < len; i++) {
            rings.push(coords[i][0]);
        }
        return rings;
    }

    //查询
    function search(cityCode,districtCode) {
        var districtExplorer,countryCode;
        districtExplorer = new DistrictExplorer({
            map: map
        });
        //全国
        countryCode = 100000;
        //只需加载全国和市，全国的节点包含省级
        districtExplorer.loadMultiAreaNodes([countryCode,cityCode],function (error, areaNodes) {
            var countryNode = areaNodes[0];
            var path = [];
            //首先放置背景区域，这里是大陆的边界
            path.push(getLongestRing(countryNode.getParentFeature()));
            path.push.apply(path, getAllRings(areaNodes[1].getSubFeatureByAdcode(districtCode)));
            //展示出结果数据
            //textArea.innerHTML="window.districtBorder="+JSON.stringify(path)+";";
            textArea.innerHTML=`
                (function(global){
                    \/\/${cityCode+","+districtCode}
                    var districtBorder=${JSON.stringify(path)};
                    global.districtBorder=districtBorder;
                })(window);
            `;

            //绘制区域，方便验证------------
            var polygon = new AMap.Polygon({
                bubble: true,
                lineJoin: 'round',
                strokeColor: '#071b5d', //线颜色
                strokeOpacity: 1, //线透明度
                strokeWeight: 1, //线宽
                fillColor: '#071b5d', //填充色
                fillOpacity: 0.6, //填充透明度
                map: map,
                path: path
            });
            map.add(polygons);
            map.setFitView();
            map.setZoom(11);
            map.setCenter(new AMap.LngLat(path[1][0].lng,path[1][0].lat));
        });
    }

    window.onload=init;
})();