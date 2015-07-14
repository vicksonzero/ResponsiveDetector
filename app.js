var Promise = require("promise");
var fs = require("fs");
var xml2js = require('xml2js');
var xml2jsParser = new xml2js.Parser({
	explicitChildren: true,
	preserveChildrenOrder: true
});
var Svgger = require('./svgger').factory;

// rgb and hsv conversion
// README: https://github.com/minodisk/colorful/tree/master
var colorful = require('colorful');
var RGB = colorful.RGB;
var HSV = colorful.HSV;

var config = require("./config");

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
				xmlDoc:null,
				symbolList:[]

			},
			{
				name:"mobile",
				path:"test_assets/perfect_mobile.svg",
				xmlString:"",
				xmlDoc:null,
				symbolList:[]
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
			console.log("+---------------------+");
			console.log("|                     |");
			console.log("| Responsive detector |");
			console.log("|                     |");
			console.log("+---------------------+");
			console.log("");
			console.log("Started on: " + Date());
			console.log("");
			console.log("=======================");
			console.log("");
		})
		.then(function(){
			console.log("[5.1.0] xml2json for d[0]");
			xml2jsParser.parseString(d[0].xmlString, function (err, result) {
				d[0].xmlDoc = result.svg;
				console.log("xml2json for d[0] finished");
			});
		})
		.then(function(){
			console.log("[5.1.0] xml2json for d[1]");
			xml2jsParser.parseString(d[1].xmlString, function (err, result) {
				d[1].xmlDoc = result.svg;
				console.log("xml2json for d[1] finished");
			});
			console.log("xml2json for d[1] skipped");

		})
		.then(function(){
			console.log("[5.1.0] xml2json finished");
			// debug
			console.log(d[0].xmlDoc);
			var logo0 = Svgger(d[0].xmlDoc).getElementById("Logo");
			var logo1 = Svgger(d[1].xmlDoc).getElementById("Logo");
			console.log("Logo0:");
			console.log(logo0);

		})
		.then(function(){
			console.log("[5.1.1] Traverse, wrap symbols with custom class, and store a list of svggers (Case 0)");
			var symbolList = [];
			traverse(d[0].xmlDoc,symbolList);

			// sort by descending depth
			symbolList.sort(function(a,b){
				return b.depth() - a.depth();
			});
			d[0].symbolList = symbolList;

		})
		.then(function(){
			console.log("[5.1.2] Traverse, wrap symbols with custom class, and store a list of svggers (Case 1)");
			var symbolList = [];
			traverse(d[1].xmlDoc,symbolList);

			// sort by descending depth
			symbolList.sort(function(a,b){
				return b.depth() - a.depth();
			});
			d[1].symbolList = symbolList;

		})
		.then(function(){
			console.log("[5.2.1] Compare color");
			for(var i=0; i < d[0].symbolList.length; i++){
				for(var j=0; j < d[1].symbolList.length; j++){
					var score = d[0].symbolList[i].compareColor( d[1].symbolList[j] );
				}
			}
		});
	}
	function traverse(xmlNode, symbolList, depth){
		if(depth === undefined){
			depth=0;
		}
		// log name
		var str = "";
		for(var i=0; i < depth; i++){
			str+="  ";
		}
		console.log(str+Svgger(xmlNode).toString()+":");

		var interestedTags = config.interestedTags;
		if(!interestedTags.hasOwnProperty(xmlNode['#name'])){
			return;
		}
		// traverse children and collect
		var childrenList = [];
		if(xmlNode.hasOwnProperty("$$")){
			for(var i=0; i< xmlNode['$$'].length; i++){
				var child = traverse(xmlNode['$$'][i], symbolList, depth+1);
				if(child){
					childrenList.push(child);
				}
			}
		}
		var n = Svgger(xmlNode);
		n.depth(depth);
		n.childrenList(childrenList);
		symbolList.push(n);
		return n;
	}
	function compareLogo(g1, g2){
		console.log("compareLogo start");
	}
	function colorScore(g1,g2){

	}




	return App;
})();
