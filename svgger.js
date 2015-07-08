
// xml parsing
var xml2js = require("xml2js");

// rgb and hsv conversion
var colorful = require('colorful');
var RGB = colorful.RGB;
var HSV = colorful.HSV;

// dicionary of color names
var cssColorName = require('./cssColorName');

var config = require("./config");

// wrapper class for xml2js, used in svg context

module.exports = (function(){


	function Svgger(xmlObject){
		this.xmlObject= xmlObject;
		this.scores = {
			color:{}
		};
		this._children = [];
		this._depth = 0;
		this._index = 0;
	}
	Svgger._index = 0;
	Svgger.instances = {};
	Svgger.factory = function factory(xmlObject, id){
		var s = new Svgger(xmlObject);
		var i = Svgger._index;
		Svgger._index++;
		s.index(i);
		Svgger.instances[i] = s;
		return s;
	};

	Svgger.get = function get(index){
		return Svgger.instances[index];
	}

	Svgger.prototype.attr = function attr(key, val){
		if(this.xmlObject.hasOwnProperty(key)){
			if(val === undefined){
				// getter
				return this.xmlObject.$[key];
			}else{
				// setter
				this.xmlObject.$[key] = val;
			}
		}else{
			return undefined;
		}
	};

	Svgger.prototype.hasAttr = function hasAttr(key){
		return this.xmlObject.hasOwnProperty(key);
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
	Svgger.prototype.colorFill = function colorFill(){
		// getter
		var color = this.attr("fill");
		if(color.charAt(0)!="#"){
			console.log("color " + color + " is not hex");
			color = cssColorName[color.toLowerCase()];
		}
		return HSV(color);
	};
	Svgger.prototype.colorStroke = function colorStroke(){
		// getter
		var color = this.attr("stroke");
		if(color.charAt(0)!="#"){
			color = cssColorName[color.toLowerCase()];
		}
		return HSV(color);
	};
	Svgger.prototype.color = function color(component) {
		if(component == "fill"){
			return this.colorFill();
		}else{
			return this.colorStroke();
		}
	};
	Svgger.prototype.index = function (val) {
		if(val === undefined){
			return this._index;
		}
		this._index = val;
	};
	Svgger.prototype.depth = function (val) {
		if(val === undefined){
			return this._depth;
		}
		this._depth = val;
	};
	Svgger.prototype.children = function (val) {
		if(val === undefined){
			return this._children;
		}
		this._children = val;
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
		str+= " (index:" + this._index + ")";
		return str;

	};

	Svgger.prototype.compareColor = function compareColor(svgger2){
		var wcolor = config.w.color;
		var scoreStroke = this.colorStroke();
		var scoreFill = this.colorFill();
		this.scores.color[svgger2.index()] = wcolor.stroke * scoreStroke +
		                                     wcolor.fill   * scoreFill;
	};

	Svgger.prototype.conpareColorComponent = function conpareColorComponent(svgger2, comp){

	};

	function makeClone(obj){
		return JSON.parse(JSON.stringify(obj));
	}

	return Svgger;
})();
