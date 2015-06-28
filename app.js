var Promise = require("promise").Promise;
var fs = require("fs");
var libxmljs = require("libxmljs");
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

		// parse xml text into js object
		d[0].xmlDoc = libxmljs.parseXml(d[0].xmlString);
		d[1].xmlDoc = libxmljs.parseXml(d[1].xmlString);

		// debug
		var a= d[0].xmlDoc.childNodes();
		for(var aa in a){
			if(a[aa].name() == "text"){
				console.log("  "+ a[aa].name());
			}else{
				console.log(a[aa].name());
			}
		}
		console.log("===============");

		// debug
		var childofg1 = d[0].xmlDoc.get("//*[@id='Logo']").childNodes();
		console.log(childofg1);

		for(var index in childofg1){
			console.log(childofg1[index].name());
		}
		console.log("===============");

		var rect = d[0].xmlDoc.find("//*[@id='Logo']//rect")[0];
		console.log(rect);

		var logo0 = d[0].xmlDoc.get("//*[@id='Logo']");
		var logo1 = d[1].xmlDoc.get("//*[@id='Logo']");
		console.log( compareLogo(logo0, logo1) );

	}
	function compareLogo(g1, g2){
		console.log("hi");
		var a = g1.get("rect");
		console.log(a);
	}
	function colorScore(g1,g2){

	}

	return App;
})();
