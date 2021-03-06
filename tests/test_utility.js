
var assert = require('assert');
var app = require("../app");
var utility = require('../utility');
var colorful = require('../lib/colorful');
var HSV = colorful.HSV;

var verbose = 0;
console.log("verbose: " + (verbose==1));

module.exports = (function() {

    /*
     * Array of tests, called in global space
     * Start with an underscore '_' to skip the test
     */
    return [
        function test_color_similar_h_s_v_similar()
		{
			testCompareColor(new HSV("#5DE64B"), new HSV("#4BE68C"), 0.12494623655913976); // h
			testCompareColor(new HSV("#5DE64B"), new HSV("#A4E89B"), 0.05265489743053261); // s
			testCompareColor(new HSV("#5DE64B"), new HSV("#41A334"), 0.04070260058172586); // v
        },
        function test_color_similar_h_s_v_different()
		{
			testCompareColor(new HSV("#5DE64B"), new HSV("#4BE6C4"), 0.209247311827957);
        },
        function test_break_path_d()
		{
            var pathD = "M262,661C130,661 36,541 36,323C38,108 124,-11 251,-11C395,-11 477,111 477,332C477,539 399,661 262,661M257,593C348,593 389,488 389,328C389,162 346,57 256,57C176,57 124,153 124,322C124,499 180,593 257,593z";
			var result = utility.parsePathData(pathD);
            if(verbose) console.log(result);

            assert.equal(result.length ,  11);
            assert.equal(result[0][0] ,  "M");
            assert.equal(result[0].length ,  3);

            assert.equal(result[4][0] ,  "C");
            assert.equal(result[4][5] ,  "262");
            assert.equal(result[4].length ,  7);

            assert.equal(result[10][0] ,  "z");
        },
        function test_break_polyline_points(argument) {
            var result = utility.parsePolylineData("0,0 0,6 8,6");
            if(verbose) console.log(result);
            assert.equal(result.length, 3);
        },
        function test_break_line(){
            var result = utility.lineToPointsList({x:0,y:0},{x:10,y:20},2);
            if(verbose) console.log(result);

            assert.equal(result.length ,  12);
        },
        function test_break_rect(){
            var xmlObject = {
                "$":{
                    x:10,
                    y:10,
                    width:200,
                    height:300
                }
            };
            var result = utility.rectToPointsList(xmlObject,10);
            assert.equal(result.length, 96);
        },
        function test_break_polyline(argument) {
            var xmlObject = {
                "$":{
                    points:"0,0 0,6 8,6"
                }
            }
            var result = utility.polylineToPointsList(xmlObject,2);
            if(verbose) console.log(result);
            assert.equal(result.length, 7);
        },
        function test_break_polygon(argument) {
            var xmlObject = {
                "$":{
                    points:"0,0 0,6 8,6"
                }
            };
            var result = utility.polygonToPointsList(xmlObject,2);
            if(verbose) console.log(result);
            assert.equal(result.length, 12);
        },
        function test_break_circle(argument) {
            var xmlObject = {
                "$":{
                    cx:20,
                    cy:20,
                    r: 20
                }
            };
            var result = utility.circleToPointsList(xmlObject,10);

            if(verbose) console.log(result);
            if(verbose) console.log("radius: "+pointDistance(result[4],{x:20,y:20}));
            
            assert(Math.abs(pointDistance(result[4],{x:20,y:20})-20) < 0.000001, "error: distance more than 0.000001");
            assert.equal(result.length, 13);
        },
        function test_break_path(argument) {
            assert(false,"Not implemented");
        },
        function _does_not_run() {

        }
    ];

	// helper functions
	function testCompareColor(c1,c2, expected) {
		var str1 = "c1: " + [oneDP(c1.h), oneDP(c1.s), oneDP(c1.v)].join(", ");
		if(verbose) console.log(str1);
		var str2 = "c2: " + [oneDP(c2.h), oneDP(c2.s), oneDP(c2.v)].join(", ");
		if(verbose) console.log(str2);
        var result = utility.compareColorHSV(c1,c2);
		if(verbose) console.log("compareColorHSV: " +  result);

        assert.equal(result ,  expected);

	}
	function oneDP(number) {
		return Math.round( number * 10 ) / 10;
	}
    function pointDistance(a,b){
        return Math.sqrt((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y));
    }

})();
/*
assertion cheat sheet

assert.fail(actual, expected, message, operator)
assert(value[, message]), assert.ok(value[, message])
assert.equal(actual, expected[, message])
assert.notEqual(actual, expected[, message])
assert.deepEqual(actual, expected[, message])
assert.notDeepEqual(actual, expected[, message])
assert.strictEqual(actual, expected[, message])
assert.notStrictEqual(actual, expected[, message])
assert.throws(block[, error][, message])
assert.doesNotThrow(block[, message])
assert.ifError(value)
 */
