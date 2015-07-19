

// rgb and hsv conversion
// https://github.com/minodisk/colorful
var colorful = require('./lib/colorful');
var RGB = colorful.RGB;
var HSV = colorful.HSV;

// dicionary of color names
var cssColorName = require('./cssColorName');

var config = require("./config");

module.exports = (function(){


	function Utility(xmlObject){
	}

	function makeClone(obj){
		throw "not implemented...";
		//return JSON.parse(JSON.stringify(obj));
	}



	Utility.sortColor = function sortColor(colorArray) {
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


	/**
	 * return weighted score of color difference
	 * @param  {h,s,v} color1   color in hue, saturation, vallue
	 * @param  {h,s,v} color2   color in hue, saturation, vallue
	 * @return {number[0,1]}    score from 0 to 1
	 */
	Utility.compareColorHSV = function compareColorHSV(color1, color2) {
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
	Utility.mergeNonRepeat = function mergeNonRepeat(a,b){
		return a.concat(b.filter(function (item) {
		    return a.indexOf(item) < 0;
		}));
	}

	// adopted from http://stackoverflow.com/a/17018041
	/**
	 * turn the d attribute of a path into an array of commands
	 * @param  {string} pathString                               the d in <path d="">
	 * @return {array([commandName, argument0, argument1...])}   broken command tokens
	 */
	Utility.parsePathData = function parsePathData(pathString)
	{
		var tokenizer = /([A-Za-z]+)|([+-]?(?:\d+\.?\d*|\.\d+))/gi,
			match,
			current,
			commands = [];

		tokenizer.lastIndex = 0;
		while (match = tokenizer.exec(pathString))
		{
			if (match[1])
			{
				if (current) commands.push(current);
				current = [ match[1] ];
			}
			else
			{
				if (!current) current = [];
				current.push(match[2]);
			}
		}
		if (current) commands.push(current);
		return commands;
	}

	Utility.lineToPointsList = function lineToPointsList(p1, p2, intervalLength) {
		// empty interval means strictly 10 points
		if (intervalLength === undefined) intervalLength = Math.abs(p2.x-p1.x)/10;
		// result
		var points = [];
		// calculate how far (x,y) per interval
		var angle = Math.atan2((p2.y-p1.y), (p2.x-p1.x));
		var delta = {
			x:intervalLength*Math.cos(angle),
			y:intervalLength*Math.sin(angle)
		};
		var len = Math.sqrt((p2.y-p1.y) * (p2.y-p1.y) + (p2.x-p1.x) * (p2.x-p1.x)) / intervalLength;
		for(var i=0; i < len; i++){
			points.push({
				x: p1.x + i * delta.x,
				y: p1.y + i * delta.y
			});
		}
		// last point
		// edit: is not used
		//points.push({ x: p2.x, y: p2.y });
		return points;
	};

	Utility.rectToPointsList = function rectToPointsList(xmlObject, intervalLength) {
		var points = [];
		var sidePoints = [];
		// N
		sidePoints = Utility.lineToPointsList({
				x: xmlObject.$.x || 0,//p1
				y: xmlObject.$.y || 0
			},{
				x: xmlObject.$.width,//p2
				y: xmlObject.$.y || 0
			},
			intervalLength);
		points = points.concat(sidePoints);
		// E
		sidePoints = Utility.lineToPointsList({
			x: xmlObject.$.width,//p1
			y: xmlObject.$.y || 0
		},{
			x: xmlObject.$.width,//p2
			y: xmlObject.$.height
		},
		intervalLength);
		points = points.concat(sidePoints);
		// S
		sidePoints = Utility.lineToPointsList({
			x: xmlObject.$.width,//p1
			y: xmlObject.$.height
		},{
			x: xmlObject.$.x || 0,//p2
			y: xmlObject.$.height
		},
		intervalLength);
		points = points.concat(sidePoints);
		// S
		sidePoints = Utility.lineToPointsList({
				x: xmlObject.$.x || 0,//p1
				y: xmlObject.$.height
			},{
				x: xmlObject.$.x || 0,//p2
				y: xmlObject.$.y || 0
			},
			intervalLength);
		points = points.concat(sidePoints);
		return points;

	};



	return Utility;
})();
