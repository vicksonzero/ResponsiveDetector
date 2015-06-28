
// xml parsing
var libxmljs = require("libxmljs");

// rgb and hsv conversion
var colorful = require('colorful');
var RGB = colorful.RGB;
var HSV = colorful.HSV;

var cssColorName = require('cssColorName');

// wrapper class for libxmljs, used in svg context

module.exports = (function(){

	function makeClone(obj){
		return JSON.parse(JSON.stringify(obj));
	}

	function Svgger(xmlObject){
		return{
			xmlObject: xmlObject,
			attr: function (key, val) {
				if(val === undefined){
					// getter
					return xmlObject.$[key];
				}else{
					// setter
					xmlObject.$[key] = val;
				}
			},
			getChildList:function(){
				var result = [];

				for(var i = 0; i < xmlObject.$$.length; i++){
					result.push(Svgger(xmlObject.$$[i]));
				}
				return result;
			},
			getElementById:function (val) {
				if(xmlObject.$.id == val){
					return xmlObject;
				}
				var result = null;
				// for all children of xmlObject
				for(var childIndex in xmlObject.$$){
					result = Svgger(xmlObject.$$[childIndex]).getElementById(val);
					if(result != null){
						return result;
					}
				}
				return null;
			},
			colorFill: function (val) {
				if(val === undefined){
					// getter
					var color = this.attr("fill");
					if(color.charAt(0)!="#"){
						console.log("color " + color + " is not hex");
						color = cssColorName[color.toLowerCase()];
					}
					return HSV(color);
				}
			},
			colorStroke: function (val) {
				if(val === undefined){
					// getter
					var color = this.attr("stroke");
					if(color.charAt(0)!="#"){
						color = cssColorName[color.toLowerCase()];
					}
					return HSV(color);
				}
			}
		}
	}
	Svgger.colorScore = function colorScore(svgger1, svgger2){
		var clone1 = makeClone(svgger1);
		var clone2 = makeClone(svgger2);

	};

	return Svgger;
})();
