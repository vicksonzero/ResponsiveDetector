
var app = require("../app");
var svgger = require('../svgger');
var colorful = require('../lib/colorful');
var HSV = colorful.HSV;

module.exports = (function() {

    /*
     * Array of tests, called in global space
     * Start with an underscore '_' to skip the test
     */
    return [
        function test_whole()
		{
			app();
        },
        function _does_not_run() {

        }
    ];

})();
