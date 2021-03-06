
// xml parsing
// https://github.com/Leonidas-from-XIV/node-xml2js
var xml2js = require("./lib/xml2js");

// rgb and hsv conversion
// https://github.com/minodisk/colorful
var colorful = require('./lib/colorful');
var RGB = colorful.RGB;
var HSV = colorful.HSV;

// dicionary of color names
var cssColorName = require('./cssColorName');

var config = require("./config");

var Utility = require('./utility');

// wrapper class for xml2js, used in svg context

module.exports = (function(){


	function Svgger(xmlObject){
		this.xmlObject= xmlObject;
		this.scores = {
			color:{},
			shape:{},
			final:{},
			list:[]
		};
		this._match = [-1,-1,-1];
		this._children = [];
		this._parent = null;
		this._depth = 0;
		this._index = 0;
		this._BB = null;
		this._identified = false;
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
		if(this.xmlObject.$.hasOwnProperty(key)){
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
		if (this.xmlObject.hasOwnProperty("$")){
			return this.xmlObject.$.hasOwnProperty(key);
		}
		return false;
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
	Svgger.prototype.match = function (val) {
		if(val === undefined){
			return this._match;
		}
		this._match = val;
	};
	Svgger.prototype.identified = function (val) {
		if(val === undefined){
			return this._identified;
		}
		this._identified = val;
	};
	Svgger.prototype.BB = function (val) {
		if(val === undefined){
			return this._BB;
		}
		this._BB = val;
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
	Svgger.prototype.parentSvgger = function (val) {
		if(val === undefined){
			return this._parent;
		}
		this._parent = val;
	};

	Svgger.prototype.toString = function toString(){
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
	Svgger.prototype.getPos = function getPos(){
		var bb = Utility.getBoundingBox(this.xmlObject);
		//var bb = this.getBB();
		return {
			x: bb.p1.x,
			y: bb.p1.y
		};

	};
	Svgger.prototype.getGlobalPos = function getGlobalPos(){
		var myParent = this.parentSvgger();

		if(myParent == null) return this.getPos();

		var parentPos = myParent.getGlobalPos();
		var myPos = this.getPos();
		return {
			x:myPos.x + parentPos.x,
			y:myPos.y + parentPos.y
		};

	};

	/*
	 * Color functions
	 */
	Svgger.prototype.color = function color(fillOrStroke) {
		var color;
		if(fillOrStroke == "fill"){
			color = this.attr("fill");
		}else{
			color = this.attr("stroke");
		}

		if(color.charAt(0)!="#"){
			console.log("color " + color + " is not hex");
			color = cssColorName[color.toLowerCase()];
		}
		return new HSV(color);
	};
	Svgger.prototype.getColorList = function getColorList(fillOrStroke) {
		var cols = [];
		var clist = this.childrenList();
		if(clist.length > 0) {
			for (var i = 0; i < clist.length; i++) {
				var cols2 = clist[i].getColorList(fillOrStroke);
				cols = cols.concat(cols2);
			}
		}

		if(this.hasAttr(fillOrStroke)){
			cols.push(this.color(fillOrStroke));
		}
		return cols;
	};

	Svgger.prototype.getAllLocusList = function getAllLocusList(isRoot) {
		//if(isRoot === undefined) isRoot = false;
		var points = [];
		points = points.concat(this.getLocusList());
		var cl = this.childrenList();
		for (var i = 0; i < cl.length; i++) {
			var childPointsList = cl[i].getAllLocusList();
			points = points.concat(childPointsList);
		}
		return points;
	};

	Svgger.prototype.getLocusList = function getLocusList(isRoot) {
		switch(this.xmlObject['#name']){
			case "rect":
				return Utility.rectToPointsList(this.xmlObject, config.pathSegmentLength);
				break;
			case "circle":
				return Utility.circleToPointsList(this.xmlObject, config.pathSegmentLength);
				break;
			case "ellipse":
				throw "BOSS!";
				return Utility.ellipseToPointsList(this.xmlObject, config.pathSegmentLength);
				break;
			case "line":
				var p1 = {
					x: this.xmlObject.$.x1 || 0,
					y: this.xmlObject.$.y1 || 0
				};
				var p2 = {
					x: this.xmlObject.$.x2 || 0,
					y: this.xmlObject.$.y2 || 0
				};
				return Utility.lineToPointsList(p1, p2, config.pathSegmentLength, true);
				break;
			case "polyline":
				return Utility.polylineToPointsList(this.xmlObject, config.pathSegmentLength);
				break;
			case "polygon":
				return Utility.polygonToPointsList(this.xmlObject, config.pathSegmentLength);
				break;
			case "path":
				throw "FINAL BOSS!";
				break;
			default:
				return [];
		}
	};

	Svgger.prototype.getCenter = function () {
		var bb = this.getBB();
		return {
			x: (bb.p1.x + bb.p2.x)/2,
			y: (bb.p1.y + bb.p2.y)/2
		}
	};
	Svgger.prototype.getBB = function getBB() {
		// cached?
		var cached = this.BB();
		if(cached != null) return cached;

		var result = {
			p1:{
				x: Infinity,
				y: Infinity
			},
			p2:{
				x: 0,
				y: 0
			}
		};
		var myBB = Utility.getBoundingBox(this.xmlObject);
		if(this.xmlObject["#name"]!=="g"){
			result = {
				p1:{
					x: Math.min(result.p1.x, myBB.p1.x),
					y: Math.min(result.p1.y, myBB.p1.y)
				},
				p2:{
					x:Math.max(result.p2.x, myBB.p2.x),
					y:Math.max(result.p2.y, myBB.p2.y)
				}
			};
		}


		var cl = this.childrenList();
		for (var i = 0; i < cl.length; i++) {
			var childBB = cl[i].getBB();
			result.p1.x = Math.min(result.p1.x, myBB.p1.x + childBB.p1.x);
			result.p1.y = Math.min(result.p1.y, myBB.p1.y + childBB.p1.y);
			result.p2.x = Math.max(result.p2.x, myBB.p1.x + childBB.p2.x);
			result.p2.y = Math.max(result.p2.y, myBB.p1.y + childBB.p2.y);
		}
		this.BB(result);
		return result;
	};
	Svgger.prototype.compareColorAgainst = function compareColorAgainst(svgger2){
		// combine fill color and stroke color
		var color0List = this.getColorList("fill").concat(this.getColorList("stroke"));
		var color1List = svgger2.getColorList("fill").concat(svgger2.getColorList("stroke"));
		// sort according to h > s > v precedence
		Utility.sortColor(color0List);
		Utility.sortColor(color1List);
		//
		var score = compareColorComponent(color0List, color1List);
		console.log(this.index() + "vs" + svgger2.index() + ":  " + twoDP(score*100) + "%");
		// save the score in my score list
		this.scores.color[svgger2.index()] = score;
		svgger2.scores.color[this.index()] = score;

		// nothing to return

		function compareColorComponent(colorList1, colorList2){
			var sum = 0;
			var len = Math.min(colorList1.length,colorList2.length);
			if(len == 0) return 0;

			// HACK: Omit the rest of the colors??????

			for (var i = 0; i < len; i++) {
				var weightedScore = Utility.compareColorHSV(colorList1[i], colorList2[i]);
				sum += weightedScore;

			}
			return sum/len;
		};

	};

	Svgger.prototype.compareShapeAgainst = function compareShapeAgainst(svgger2){
		var points0List = this.getAllLocusList();
		var bb0 = this.getBB();
		points0List.forEach(function(element, index, array){
			element.x /= (bb0.p2.x - bb0.p1.x);
			element.y /= (bb0.p2.y - bb0.p1.y);
		});

		var points1List = svgger2.getAllLocusList();
		var bb1 = svgger2.getBB();
		points1List.forEach(function(element, index, array){
			element.x /= (bb1.p2.x - bb1.p1.x);
			element.y /= (bb1.p2.y - bb1.p1.y);
		});

		//
		var hd = Utility.hausdorffDistance(points0List, points1List);
		var score = 1/( 1+ hd );
		console.log(this.index() + "vs" + svgger2.index() + ":  " + twoDP(score*100) + "%");

		// save the score in my score list
		this.scores.shape[svgger2.index()] = score;
		svgger2.scores.shape[this.index()] = score;

	};

	Svgger.prototype.finalizeScore = function finalizeScore(){
		for (var index in this.scores.color) {
			if (this.scores.color.hasOwnProperty(index)) {
				this.scores.final[index] = config.w.finalScore.color * this.scores.color[index] +
				                           config.w.finalScore.shape * this.scores.shape[index];
			}
		}

	};

	Svgger.prototype.makeMatch = function makeMatch(){
		var l = [];
		for (var index in this.scores.final) {
			if (this.scores.final.hasOwnProperty(index)) {
				l.push({
					"index": index,
					"score": this.scores.final[index]
				});
			}
		}

		l = l.sort(function(a,b){
			return b.score - a.score;
		});

		this.scores.list = l;
		return l[0].index;
	};


	function twoDP(number) {
		return Math.round( number * 100 ) / 100;
	}

	return Svgger;
})();
