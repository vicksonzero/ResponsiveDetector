var Promise = require("promise");
var fs = require("fs");
var xml2js = require('./lib/xml2js');
var xml2jsParser = new xml2js.Parser({
	explicitChildren: true,
	preserveChildrenOrder: true
});
var xml2jsBuilder = new xml2js.Builder({
	preserveChildrenOrder:true,
	rootName:"svg"
});
var Svgger = require('./svgger').factory;

// rgb and hsv conversion
// README: https://github.com/minodisk/colorful/tree/master
var colorful = require('./lib/colorful');
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
			//console.log("xml2json for d[1] skipped");

		})
		.then(function(){
			console.log("[5.1.0] xml2json finished");
			// debug
			//console.log(d[0].xmlDoc);
			var logo0 = Svgger(d[0].xmlDoc).getElementById("Logo");
			var logo1 = Svgger(d[1].xmlDoc).getElementById("Logo");
			//console.log("Logo0:");
			//console.log(logo0);

		})
		.then(function(){
			var mergedPicture = {
				"#name":"svg",
				"$":{
					"enable-background": "new 0 0 1600 1000",
					"height": "1000px",
					"version": "1.1",
					"viewBox": "0 0 1600 1000",
					"width": "960px",
					x: "0px",
					y: "0px",
					"xml:space": "preserve",
					"xmlns": "http://www.w3.org/2000/svg",
					"xmlns:xlink": "http://www.w3.org/1999/xlink"
				},
				"$$":[
					d[0].xmlDoc,
					d[1].xmlDoc
				]
			};
			var w0 = parseInt(mergedPicture["$$"][0]["$"].width.split("px")[0]);
			var w1 = parseInt(mergedPicture["$$"][1]["$"].width.split("px")[0]);
			mergedPicture["$"].width = w0 + w1 + "px";
			mergedPicture["$$"][1]["$"].x = mergedPicture["$$"][0]["$"].width;
			dumpPhoto(mergedPicture, "mergedPicture");
		})
		.then(function(){
			console.log("[5.1.1] Traverse, wrap symbols with custom class, and store them in a list (Case 0)");
			var symbolList = [];
			traverse(d[0].xmlDoc,symbolList);

			// sort by descending depth
			symbolList.sort(function(a,b){
				return b.depth() - a.depth();
			});
			d[0].symbolList = symbolList;

		})
		.then(function(){
			console.log("[5.1.2] Traverse, wrap symbols with custom class, and store them in a list (Case 1)");
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
					// compare all symbols between both lists
					// and save inside the first object
					d[0].symbolList[i].compareColorAgainst( d[1].symbolList[j] );
				}
			}
		})
		.then(function(){
			console.log("[5.2.2] Compare shape");
			for(var i=0; i < d[0].symbolList.length; i++){
				for(var j=0; j < d[1].symbolList.length; j++){
					d[0].symbolList[i].compareShapeAgainst( d[1].symbolList[j] );
				}
			}
		})
		.then(function(){
			console.log("[5.2.3] Compare position");
			console.log("skipped");
		})
		.then(function(){
			console.log("[5.2.4] Compare naming");
			console.log("skipped");
		})
		.then(function(){
			console.log("[5.3.1] Confirm mapping");

			for(var i=0; i < d[0].symbolList.length; i++){
				d[0].symbolList[i].finalizeScore();
			}
			for(var j=0; j < d[1].symbolList.length; j++){
				d[0].symbolList[i].finalizeScore();
			}

			for(var i=0; i < d[0].symbolList.length; i++){
				d[0].symbolList[i].makeMatch();
			}
			for(var j=0; j < d[1].symbolList.length; j++){
				d[0].symbolList[i].makeMatch();
			}
		})
		.then(function(){
			console.log("[5.3.2] Generate preview");
		})
		.then(function(){
			console.log("[5.3.2] Generate html");
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
		//console.log(str+Svgger(xmlNode).toString()+":");

		var interestedTags = config.interestedTags;
		if(!interestedTags.hasOwnProperty(xmlNode['#name'])){
			return;
		}
		// wrap current node with svgger
		var n = Svgger(xmlNode);

		// traverse children and collect
		var childrenList = [];
		if(xmlNode.hasOwnProperty("$$")){
			for(var i=0; i< xmlNode['$$'].length; i++){
				var child = traverse(xmlNode['$$'][i], symbolList, depth+1);
				if(child){
					childrenList.push(child);
					child.parentSvgger(n);
				}
			}
		}
		// register children
		n.childrenList(childrenList);
		// record depth along the tree
		n.depth(depth);
		// queue up in symbol list
		symbolList.push(n);
		return n;
	}

	function compareLogo(g1, g2){
		console.log("compareLogo start");
	}

	function combineSvg(root1, root2){

	}
	function zeroPad(a){
		if(a<10){
			return "0"+a;
		}else{
			return ""+a;
		}
	}

	function dumpPhoto(xmlObject, filename){
		var outData = xml2jsBuilder.buildObject(xmlObject);
		var now = new Date();
		var dateString = ""+
			now.getFullYear()+
			zeroPad(now.getMonth()+1)+
			zeroPad(now.getDate())+"_"+
			zeroPad(now.getHours())+
			zeroPad(now.getMinutes())+
			zeroPad(now.getSeconds());
		var fd = fs.openSync("test_assets/combined_"+dateString+"_"+filename+".svg", "wx");
		fs.writeSync(fd, outData);
		fs.closeSync(fd);
	}



	return App;
})();
