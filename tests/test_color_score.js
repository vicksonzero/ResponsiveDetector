
var app = require("../app");
var utility = require('../utility');
var colorful = require('../lib/colorful');
var HSV = colorful.HSV;

module.exports = (function() {

    /*
     * Array of tests, called in global space
     * Start with an underscore '_' to skip the test
     */
    return [
        function test_color_similar_h_s_v()
		{
			testCompareColor(new HSV("#5DE64B"), new HSV("#4BE68C")); // h
			testCompareColor(new HSV("#5DE64B"), new HSV("#A4E89B")); // s
			testCompareColor(new HSV("#5DE64B"), new HSV("#41A334")); // v
        },
        function test_color_similar_h_s_v()
		{
			testCompareColor(new HSV("#5DE64B"), new HSV("#4BE6C4"));
        },
        function _does_not_run() {

        }
    ];
	// helpers
	function testCompareColor(c1,c2) {
		var str1 = "c1: " + [oneDP(c1.h), oneDP(c1.s), oneDP(c1.v)].join(", ");
		console.log(str1);
		var str2 = "c2: " + [oneDP(c2.h), oneDP(c2.s), oneDP(c2.v)].join(", ");
		console.log(str2);
		console.log("compareColorHSV: " + utility.compareColorHSV(c1,c2)); // h

	}
	function oneDP(number) {
		return Math.round( number * 10 ) / 10;
	}

})();
