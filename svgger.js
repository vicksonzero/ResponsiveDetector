
// xml parsing
var libxmljs = require("libxmljs");

// rgb and hsv conversion
var colorful = require('colorful');
var RGB = colorful.RGB;
var HSV = colorful.HSV;

var cssColorName = require('./cssColorName');

// wrapper class for libxmljs, used in svg context

module.exports = (function(){

	function makeClone(obj){
		return JSON.parse(JSON.stringify(obj));
	}

	function Svgger(xmlObject){
		this.xmlObject= xmlObject;
		this.scores = {
			color:0
		};
	}

	Svgger.prototype.attr = function attr(key, val){
		if(val === undefined){
			// getter
			return this.xmlObject.$[key];
		}else{
			// setter
			this.xmlObject.$[key] = val;
		}
	};
	Svgger.prototype.getChildList = function getChildList(){
		var result = [];

		for(var i = 0; i < this.xmlObject.$$.length; i++){
			result.push(Svgger(this.xmlObject.$$[i]));
		}
		return result;
	};
	Svgger.prototype.getElementById = function getElementById(val){
		if(this.xmlObject.$.id == val){
			return this.xmlObject;
		}
		var result = null;
		// for all children of this.xmlObject
		for(var childIndex in this.xmlObject.$$){
			result = new Svgger(this.xmlObject.$$[childIndex]).getElementById(val);
			if(result != null){
				return result;
			}
		}
		return null;
	};
	Svgger.prototype.colorFill = function colorFill(val){
		if(val === undefined){
			// getter
			var color = this.attr("fill");
			if(color.charAt(0)!="#"){
				console.log("color " + color + " is not hex");
				color = cssColorName[color.toLowerCase()];
			}
			return HSV(color);
		}
	};
	Svgger.prototype.colorStroke = function colorStroke(val){
		if(val === undefined){
			// getter
			var color = this.attr("stroke");
			if(color.charAt(0)!="#"){
				color = cssColorName[color.toLowerCase()];
			}
			return HSV(color);
		}
	};
	Svgger.prototype.depth = function (val) {
		if(val === undefined){
			return this.depth;
		}
		this.depth = val;
	};

	Svgger.prototype.toString = function(){
		var str = "";
		if(this.xmlObject.hasOwnProperty("#name")){
			str += this.xmlObject['#name'];
		}
		if(this.xmlObject.hasOwnProperty("$")){
			if(this.xmlObject.$.hasOwnProperty("id")){
				str += " #" + this.xmlObject.$.id;
			}
		}
		return str;

	};
	Svgger.colorScore = function colorScore(svgger1, svgger2){
		var clone1 = makeClone(svgger1);
		var clone2 = makeClone(svgger2);

	};

	return function svggerFactory(xmlObject){
		return new Svgger(xmlObject);
	};
})();
