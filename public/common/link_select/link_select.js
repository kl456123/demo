/**
 * Created by Aciosty on 15-1-22.
 * 表单中用于地区/产品选择的三/二级联动模块
 * 依赖jquery v1.7.0 +
 * 地区模块依赖area.json;
 * 原文地址：http://www.cnblogs.com/afuge/archive/2013/06/08/3127172.html
 *
 */
// 由crackhopper重构 15-5-20

// format工具函数
if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
              ? args[number]
              : match
            ;
        });
    };
}

// 调用这个函数初始化联动菜单
// selector: 这个是选择器，使用可以标记联动菜单区域的选择器。
// json: 这个是联动菜单对应的数据文件。数据文件的格式有细微调整。
// initList: 这个是一个数组，最多3个元素，每个元素是相应联动菜单的值。
// 示例用法：  
//  var initList = ["辽宁省","大连市","西岗区"];
//  initLinkSelect(
//    ".selectList",
//    "test.json",
//    initList);
// 注意：前端html代码也需要调整。三个联动项的名字分别用level1,level2,level3
// （以前用province什么的，现在都改掉）
var initLinkSelect = function(selector,json,initList){
  $(selector).each(function(){
    var url = json;
    var areaJson;
    var temp_html;
    var oLevel1 = $(this).find(".level1");
    var oLevel2 = $(this).find(".level2");
    var oLevel3 = $(this).find(".level3");

    ////////////// 各个级别初始化函数
    var level1 = function () {
      temp_html = "";
      $.each(areaJson, function (_i, level1) {
        temp_html += "<option value='" + level1.n + "'>" + level1.n + "</option>";
      });
      oLevel1.html(temp_html);
      level2();
    };
    var level2 = function () {
      temp_html = "";
      var i = oLevel1.get(0).selectedIndex;
      $.each(areaJson[i].d, function (_i, level2) {
        temp_html += "<option value='" + level2.n + "'>" + level2.n + "</option>";
      });
      oLevel2.html(temp_html);
      level3();
    };
    var level3 = function () {
      temp_html = "";
      var i = oLevel1.get(0).selectedIndex;
      var j = oLevel2.get(0).selectedIndex;
      if (typeof(areaJson[i].d[j].d) == "undefined") {
        oLevel3.css("display", "none");
      } else {
        oLevel3.css("display", "inline");
        $.each(areaJson[i].d[j].d, function (i, level3) {
          temp_html += "<option value='" + level3.n + "'>" + level3.n + "</option>";
        });
        oLevel3.html(temp_html);
      }
    };

    // 对点击的响应
    oLevel1.change(function () {
      level2();
    });
    oLevel2.change(function () {
      level3();
    });

    //获取json数据
    $.getJSON(url, function (data) {
      areaJson = data;
      level1();
      setLinkList(selector,initList);
    });
  });
}

var setLinkList = function(selector,levels){
  var n = levels.length<3 ? levels.length : 3;
  for(var i=0;i<n;++i){
    var oOption = $("{2} .level{0} [value={1}]".format(i+1,levels[i],selector));
    oOption.attr({selected:true});
    oOption.change();
  }
}


