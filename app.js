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
			console.log("Logo0:");
			console.log(logo0);
			var symbolList = [];
			traverse(d[0].xmlDoc, function(node,depth){
				var n = Svgger(node);
				n.depth(depth);
				symbolList.push(n);
			});

			// sort by descending depth
			symbolList.sort(function(a,b){
				return b.depth() - a.depth();
			});
			for (var i = 0; i < symbolList.length; i++) {
				symbolList[i].scoreColor();
			}
			compareLogo(logo0, logo1);

		});
	}
	function traverse(xmlNode, callback, depth){
		if(depth === undefined){
			depth=0;
		}
		//console.log(xmlNode['#name']+":");
		var str = "";
		for(var i=0; i < depth; i++){
			str+="  ";
		}
		console.log(str+Svgger(xmlNode).toString()+":");
		if(xmlNode['#name']=="font"){
			return;
		}
		if(xmlNode.hasOwnProperty("$$")){
			for(var i=0; i< xmlNode['$$'].length; i++){
				traverse(xmlNode['$$'][i], callback, depth+1);
			}
		}
		//console.log("run "+xmlNode['#name']);
		callback(xmlNode,depth);
	}
	function compareLogo(g1, g2){
		console.log("compareLogo start");
	}
	function colorScore(g1,g2){

	}




	return App;
})();
