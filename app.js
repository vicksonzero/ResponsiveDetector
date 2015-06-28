var Promise = require("promise");
var fs = require("fs");
var xml2js = require('xml2js');
var xml2jsParser = new xml2js.Parser({
	explicitChildren: true,
	preserveChildrenOrder: true
});
var Svgger = require('./svgger');

// rgb and hsv conversion
// README: https://github.com/minodisk/colorful/tree/master
var colorful = require('colorful');
var RGB = colorful.RGB;
var HSV = colorful.HSV;

module.exports = (function(){
	'use strict';

	/**
	 * Constructor
	 * @param [string, string] inputs two strings of xml filepath
	 */
	function App(inputs){
		// d means design
		var d = [
			{
				name:"desktop",
				path:"test_assets/perfect_desktop.svg",
				xmlString:"",
				xmlDoc:null
			},
			{
				name:"mobile",
				path:"test_assets/perfect_mobile.svg",
				xmlString:"",
				xmlDoc:null
			}
		];
		// promise template
		// var p = new Promise()
		// 	.then(function(){

		// 	});

		// not using promise until i see async code

		//console.log(fs.existsSync(d[0].path));
		//
		//TODO: validate input files: exists

		// reads in the content of designs in plain text
		d[0].xmlString = fs.readFileSync(d[0].path, {encoding: 'utf8'});
		d[1].xmlString = fs.readFileSync(d[1].path, {encoding: 'utf8'});


		var p = Promise.resolve(0)
		.then(function(){
			console.log("xml2json for d[0]");
			xml2jsParser.parseString(d[0].xmlString, function (err, result) {
				d[0].xmlDoc = result.svg;
				console.log("xml2json for d[0] finished");
			});
		})
		.then(function(){
			console.log("xml2json for d[1]");
			xml2jsParser.parseString(d[1].xmlString, function (err, result) {
				d[1].xmlDoc = result.svg;
				console.log("xml2json for d[1] finished");
			});
			console.log("xml2json for d[1] skipped");

		})
		.then(function(){
			console.log("xml2json finished");
			// debug
			console.log(d[0].xmlDoc);
			var logo0 = Svgger(d[0].xmlDoc).getElementById("Logo");
			var logo1 = Svgger(d[1].xmlDoc).getElementById("Logo");
			console.log(logo0);
			compareLogo(logo0, logo1);
		});

	}
	function compareLogo(g1, g2){
		console.log("compareLogo start");
	}
	function colorScore(g1,g2){
	}


	return App;
})();
