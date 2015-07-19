
// customize here

var testcases = [];
testcases = testcases.concat( require("./tests/test_utility") );
// testcases = testcases.concat( require("./tests/test_whole") );
testcases = testcases.concat( [] );

var appName = "Responsive Detector";

// runner body
(function() {

    /**
     * main function to be run at last
     * @param  {array of functions} tests test functions
     * @return void
     */
    function main(tests) {
        var countTests = 0,
            countPass = 0,
            countSkipped = 0;


        console.log("========================================");
		console.log(appName);
		console.log("");
		console.log("Test Started: " + Date());
		console.log("");

        tests.forEach(function(callback, array) {
            var funcName = getfunctionName(callback);
                // skip functions that start with _
            if (funcName.charAt(0) == "_") {
                countSkipped++;
                return;
            }
            console.log("----------------------------------------");
            try {
                countTests++;
                // give a default name for unnamed test
                funcName = funcName ||
                    "untitled test #" + countTests;
                // really call the function, in global space
                callback();

                // congrats, you passed
                countPass++;
                console.log("[OK    ] " + funcName);
            } catch (error) {
                // too bad the test failed
                console.log(error);
                console.log("[FAILED] " + funcName);
            }
        });
        if (countSkipped > 0) {
            console.log("----------------------------------------");
            console.log("" + countSkipped + " test(s) skipped.");
        }
        console.log("========================================");
        console.log("" + countPass + "/" + countTests +
            " test(s) passed.");

        // private function
        function getfunctionName(fun) {
            var ret = fun.toString();
            ret = ret.substr('function '.length);
            ret = ret.substr(0, ret.indexOf('('));
            return ret;
        }
    }


    main(testcases);
})();
