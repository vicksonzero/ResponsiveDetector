

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


	return Utility;
})();
