

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
	 * @param  {string} pathString                             the d in <path d="">
	 * @return {array([cmdName, arg0, arg1...]), all string}   broken command tokens
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

	/**
	 * turn the d attribute of a path into an array of commands
	 * @param  {string} pathString                               the d in <path d="">
	 * @return {array of {x: parseFloat(number), y: parseFloat(number}}   broken command tokens)
	 */
	Utility.parsePolylineData = function parsePolylineData(pathString)
	{
		var tokenizer = /([+-]?(?:\d+\.?\d*|\.\d+))/gi,
			match,
			current,
			points = [];
		var xy = 'x';

		tokenizer.lastIndex = 0;
		while (match = tokenizer.exec(pathString))
		{
			if (xy == 'x')
			{
				current = {x: parseFloat(match[1]), y: null};
				xy = 'y';
			}else{
				current.y = parseFloat(match[1]);
				points.push(current);
				xy = 'x';
			}
		}
		return points;
	}

	/**
	 * breaks the line segment into a list of points, each at distance of intervalLength length.
	 * omits the final point if includeLastPoint is false
	 * @param  {x,y} p1                    (required) starting point
	 * @param  {x,y} p2                    (required) stopping point
	 * @param  {number} intervalLength     (default any distance that makes 10 points) minimum distance between points
	 * @param  {boolean} includeLastPoint  (default false) include p2 in the output or not
	 * @return {array of {x,y}}            resulting list of  points
	 */
	Utility.lineToPointsList = function lineToPointsList(p1, p2, intervalLength, includeLastPoint) {
		// empty interval means strictly 10 points
		if (intervalLength === undefined) intervalLength = Math.abs(p2.x-p1.x)/10;
		// default false
		if (includeLastPoint === undefined) includeLastPoint = false;
		// result
		var points = [];
		// calculate how far (x,y) per interval
		var angle = Math.atan2((p2.y-p1.y), (p2.x-p1.x));
		var delta = {
			x: parseFloat(intervalLength*Math.cos(angle)),
			y: parseFloat(intervalLength*Math.sin(angle))
		};
		var len = Math.sqrt((p2.y-p1.y) * (p2.y-p1.y) + (p2.x-p1.x) * (p2.x-p1.x)) / intervalLength;
		for(var i=0; i < len; i++){
			points.push({
				x: parseFloat(p1.x + i * delta.x),
				y: parseFloat(p1.y + i * delta.y)
			});
		}
		// last point
		if(includeLastPoint){
			points.push({ x: parseFloat(p2.x), y: parseFloat(p2.y) });
		}
		return points;
	};

    Utility.polylineToPointsList = function polylineToPointsList(xmlObject, intervalLength) {
	    // empty interval means strictly 10 points
	    if (intervalLength === undefined) intervalLength = 10;

	    var points = [];
		var vertices = Utility.parsePolylineData(xmlObject.$.points);
		vertices.reverse();
		var a = vertices.pop();
		while(vertices.length>0){
			var b = vertices.pop();
			points = points.concat(Utility.lineToPointsList(a, b, intervalLength, false));
			a = b;
		}

	    return points;
    };

    Utility.polygonToPointsList = function polygonToPointsList(xmlObject, intervalLength) {
	    // empty interval means strictly 10 points
	    if (intervalLength === undefined) intervalLength = 10;

	    var points = [];
		var vertices = Utility.parsePolylineData(xmlObject.$.points);
		vertices.reverse();
		var a = vertices.pop();
		var firstPoint = a;
		while(vertices.length>0){
			var b = vertices.pop();
			points = points.concat(Utility.lineToPointsList(a, b, intervalLength, false));
			a = b;
		}
		points = points.concat(Utility.lineToPointsList(a, firstPoint, intervalLength, false));


	    return points;
    };

	/**
	 * turns an xml rectangle into an array of points, each at distance of intervalLength
	 * @param  {$:{x,y,width,height}} xmlObject        the svg <rect> object being parsed by the xml2js package
	 * @param  {number}               intervalLength   minimum distance between points
	 * @return {array of {x,y}}                        resulting list of  points
	 */
	Utility.rectToPointsList = function rectToPointsList(xmlObject, intervalLength) {
		var points = [];
		var sidePoints = [];
		// 4 edges NESW
		// N
		sidePoints = Utility.lineToPointsList({
				x: parseFloat(xmlObject.$.x || 0),//p1
				y: parseFloat(xmlObject.$.y || 0)
			},{
				x: parseFloat(xmlObject.$.width),//p2
				y: parseFloat(xmlObject.$.y || 0)
			},
			intervalLength);
		points = points.concat(sidePoints);

		// E
		sidePoints = Utility.lineToPointsList({
			x: parseFloat(xmlObject.$.width),//p1
			y: parseFloat(xmlObject.$.y || 0)
		},{
			x: parseFloat(xmlObject.$.width),//p2
			y: parseFloat(xmlObject.$.height)
		},
		intervalLength);
		points = points.concat(sidePoints);

		// S
		sidePoints = Utility.lineToPointsList({
			x: parseFloat(xmlObject.$.width),//p1
			y: parseFloat(xmlObject.$.height)
		},{
			x: parseFloat(xmlObject.$.x || 0),//p2
			y: parseFloat(xmlObject.$.height)
		},
		intervalLength);
		points = points.concat(sidePoints);

		// S
		sidePoints = Utility.lineToPointsList({
				x: parseFloat(xmlObject.$.x || 0),//p1
				y: parseFloat(xmlObject.$.height)
			},{
				x: parseFloat(xmlObject.$.x || 0),//p2
				y: parseFloat(xmlObject.$.y || 0)
			},
			intervalLength);
		points = points.concat(sidePoints);

		// return result
		return points;

	};

	Utility.circleToPointsList = function circleToPointsList(xmlObject, intervalLength) {
		var points = [];
		var cx = parseFloat(xmlObject.$.cx);
		var cy = parseFloat(xmlObject.$.cy);
		var r  = parseFloat(xmlObject.$.r);
		var perimeter = 2 * r * Math.PI;
		var intervals = perimeter/intervalLength;
		var angularIntervals = 2 * Math.PI / intervals;

		for(var i=0; i < intervals; i++){
			points.push({
				x: cx + Math.cos(angularIntervals*i) * r,
				y: cy + Math.sin(angularIntervals*i) * r,
			});
		}
		return points;
	};

	// http://cgm.cs.mcgill.ca/~godfried/teaching/cg-projects/98/normand/main.html
	Utility.hausdorffDistance = function hausdorffDistance(pointList1, pointList2){
		var hAB = h(pointList1, pointList2);
		var hBA = h(pointList2, pointList1);
		// max( h(A,B), h(B,A) )
		return Math.max(hAB, hBA);

		// h(A,B) = max(p in A){ min(q in B){ dist(p,q) } }
		function h(pointList1, pointList2){
			var maxD=0, minD=0;
			for(var p=0; p < pointList1.length; p++){
				minD = Infinity;
				for(var q = 0; q < pointList2.length; q++){
					var d = Utility.manhattanDistance(pointList1[p], pointList2[q]);
					if(d < minD){
						minD = d;
					}
				}
				if(minD>maxD){
					maxD = minD;
				}
			}
			return maxD;
		}
	};

	Utility.manhattanDistance = function manhattanDistance(p1, p2){
		return Math.abs(p1.x-p2.x) + Math.abs(p1.y-p2.y);
	};

	Utility.shiftAllPoints = function shiftAllPoints(points, delta){
		var result = [];
		for (var i = 0; i < points.length; i++) {
			result.push({
				x: points[i].x + delta.x,
				y: points[i].y + delta.y
			});
		}
		return result;
	};


	return Utility;
})();
