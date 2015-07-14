
// xml parsing
// https://github.com/Leonidas-from-XIV/node-xml2js
var xml2js = require("xml2js");

// rgb and hsv conversion
// https://github.com/minodisk/colorful
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

	function makeClone(obj){
		throw "not implemented...";
		//return JSON.parse(JSON.stringify(obj));
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
	Svgger.prototype.childrenList = function (val) {
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
		str += " (index:" + this._index + ")";
		return str;

	};


	/*
	 * Color functions
	 */
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
	Svgger.prototype.color = function color(fillOrStroke) {
		if(fillOrStroke == "fill"){
			return this.colorFill();
		}else{
			return this.colorStroke();
		}
	};
	Svgger.prototype.getColorList = function getColorList(fillOrStroke) {
		var cols = [];
		var clist = this.childrenList();
		if(clist.length > 0) {
			for (var i = 0; i < clist.length; i++) {
				var cols2 = clist[i].getColorList(fillOrStroke);
				cols = cols.cocat(cols2);
			}
		}
		if(this.hasAttr(fillOrStroke)){
			cols.push(this.color(fillOrStroke));
		}
		return cols;
	};

	Svgger.prototype.compareColor = function compareColor(svgger2){
		var wcolor = config.w.color;
		var scoreStroke = this.compareColorComponent(svgger2, "stroke");
		var scoreFill = this.compareColorComponent(svgger2, "fill");
		this.scores.color[svgger2.index()] = wcolor.stroke * scoreStroke +
		                                     wcolor.fill   * scoreFill;
	};

	Svgger.prototype.sortColor = function (colorArray) {
		colorArray.sort(function(a,b){
			if(a.h == b.h && a.s == b.s && a.v == b.v) return 0;
			if(a.h<b.h) return -1;
			if(a.h>b.h) return 1;
			// h == h
			if(a.s<b.s) return -1;
			if(a.s>b.s) return 1;
			// s == s
			if(a.v<b.v) return -1;
			if(a.v>b.v) return 1;
		});
	};

	Svgger.prototype.compareColorComponent = function compareColorComponent(svgger2, fillOrStroke){
		var color0List = this.getColorList(fillOrStroke);
		var color1List = svgger2.getColorList(fillOrStroke);
		this.sortColor(color0List);
		this.sortColor(color1List);

		var weightedScore = Svgger.compareColorHSV(color0, color1);
	};

	/**
	 * return weighted score of color difference
	 * @param  {h,s,v} color1   color in hue, saturation, vallue
	 * @param  {h,s,v} color2   color in hue, saturation, vallue
	 * @return {number[0,1]}    score from 0 to 1
	 */
	Svgger.compareColorHSV = function compareColorHSV(color1, color2) {
		// compare by hsv components
		var diffH = Math.abs(color1.h - color2.h);

		// normalize hue difference to become a ring
		if( diffH>180 ) diffH = 180 - diffH;
		diffH/=180;

		// other scores: saturation
		var diffS = Math.abs(color1.s - color2.s);
		// value
		var diffV = Math.abs(color1.v - color2.v);

		// get config entry fron config
		var colorWeights = config.w.colorHSV;

		// calculate weighted score
		var weightedScore = diffH * colorWeights.h +
		                    diffS * colorWeights.s +
		                    diffV * colorWeights.v ;
		return weightedScore;
	};

	/**
	 * merging 2 arrays, removing duplicate
	 * @return {array} new merged array
	 */
	function mergeNonRepeat(a,b){
		return a.concat(b.filter(function (item) {
		    return a.indexOf(item) < 0;
		}));
	}


	return Svgger;
})();
