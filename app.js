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
var SvggerClass = require('./svgger');
var Svgger = SvggerClass.factory;

var HTMLBuilder = require('./htmlBuilder');


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
				symbolList:[],
				rootSymbol: null
			},
			{
				name:"mobile",
				path:"test_assets/perfect_mobile.svg",
				xmlString:"",
				xmlDoc:null,
				symbolList:[],
				rootSymbol: null
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
			console.log("[5.1.1] Traverse, wrap symbols with custom class, and store them in a list (Case 0)");
			var symbolList = [];
			d[0].rootSymbol = traverse(d[0].xmlDoc,symbolList);

			// for (var s in symbolList) {
			// 	var parentSvg = symbolList[s].parentSvgger();
			// 	if(parentSvg == null) parentSvg = symbolList[s];
			// 	var center = symbolList[s].getCenter();
			// 	if(! parentSvg.xmlObject.hasOwnProperty("$$")){
			// 		parentSvg.xmlObject["$$"] = [];
			// 	}
			// 	parentSvg.xmlObject["$$"].push({
			// 		"#name": "text",
			// 		"$": {
			// 			"transform": "matrix(1 0 0 1 "+ (center.x + Math.random()*20) +" "+ (center.y + Math.random()*20) +")",
			// 			"font-size": ""+ (14 + symbolList[s].depth()*4)
			// 		},
			// 		_: ""+symbolList[s].index() + "(" + symbolList[s].depth() + ")"
			// 	});
			// }

			// sort by descending depth
			symbolList.sort(function(a,b){
				return b.depth() - a.depth();
			});
			d[0].symbolList = symbolList;

		})
		.then(function(){
			console.log("[5.1.2] Traverse, wrap symbols with custom class, and store them in a list (Case 1)");
			var symbolList = [];
			d[1].rootSymbol = traverse(d[1].xmlDoc,symbolList);

			// // write everyone's id on the picture
			// for (var s in symbolList) {
			// 	var parentSvg = symbolList[s].parentSvgger();
			// 	if(parentSvg == null) parentSvg = symbolList[s];
			// 	var center = symbolList[s].getCenter();
			// 	if(! parentSvg.xmlObject.hasOwnProperty("$$")){
			// 		parentSvg.xmlObject["$$"] = [];
			// 	}
			// 	parentSvg.xmlObject["$$"].push({
			// 		"#name": "text",
			// 		"$": {
			// 			"transform": "matrix(1 0 0 1 "+ (center.x + Math.random()*20) +" "+ (center.y + Math.random()*20) +")",
			// 			"font-size": ""+ (14 + symbolList[s].depth()*4)
			// 		},
			// 		_: ""+symbolList[s].index() + "(" + symbolList[s].depth() + ")"
			// 	});
			// }

			// sort by descending depth
			symbolList.sort(function(a,b){
				return b.depth() - a.depth();
			});
			d[1].symbolList = symbolList;

		})
		.then(function(){
			createAnnotation(
				d,
				"indexList",
				function(svggerObj, xx, yy, ww, hh){
				var result = [];
				var bboxXMLObject = {
					"#name":"rect",
					"$":{
						"x": ""+xx+"px",
						"y": ""+yy+"px",
						"height": ""+hh+"px",
						"width": ""+ww+"px",
						"stroke": "blue",
						"fill": "none"
					}
				};
				result.push(bboxXMLObject);

				var textXMLObject = {
					"#name":"text",
					"$":{
						"transform": "matrix(1 0 0 1 "+ (xx + ww/2 + Math.random()*20) +" "+ (yy + hh/2 + Math.random()*20) +")",
						"font-size": ""+ (14 + svggerObj.depth()*4)
					},
					_: ""+svggerObj.index() + "(" + svggerObj.depth() + ")"
				};
				result.push(textXMLObject);
				return result;
			});
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
			for(var i=0; i < d[1].symbolList.length; i++){
				d[1].symbolList[i].finalizeScore();
			}

			for(var i=0; i < d[0].symbolList.length; i++){
				d[0].symbolList[i].makeMatch();
			}
			for(var i=0; i < d[1].symbolList.length; i++){
				d[1].symbolList[i].makeMatch();
			}

			var scoreRanks = [];
			for(var i=0; i < d[0].symbolList.length; i++){
				scoreRanks.push({
					"a": d[0].symbolList[i].index(),
					"b": parseInt(d[0].symbolList[i].scores.list[0].index),
					"score": d[0].symbolList[i].scores.list[0].score
				});
			}

			scoreRanks = scoreRanks.sort(function(a,b){
				return b.score - a.score;
			});
			console.log("Ranked according to similarity");
			var bestMatch = {};
			scoreRanks.forEach(function(element, index, array){
				if(  !(bestMatch.hasOwnProperty(element.a) ||
				       bestMatch.hasOwnProperty(element.b))  ){
					bestMatch[element.a] = element.b;
					bestMatch[element.b] = element.a;
				}
			});
			console.log("Best match here");

			dumpPhoto(xmlObject, filename);

		})
		.then(function(){
			console.log("[5.3.2] Generate preview");
			d[0].symbolList.forEach( function(svgger, index, array){
				svgger.finalizeScore();
				svgger.makeMatch();
			},this);

			createAnnotation(
				d,
				"bestMatch",
				function(svggerObj, xx, yy, ww, hh){
					var result = [];

					if(svggerObj.scores.list.length <=0) return result;

					var scoreList = [];

					svggerObj.scores.list.forEach(function(element, index, array){
						if(index > 2) return;
						scoreList.push({
							"#name":"tspan",
							"$":{
								"x": 0,
								"dy": "1.2em"
							},
							"_":"vs " + element.index + ": " + twoDP(element.score*100) + "%"
						});
					});

					// debug scores
					var textXMLObject = {
						"#name":"text",
						"$":{
							"transform": "matrix(1 0 0 1 "+ (xx + ww/2 + Math.random()*20) +" "+ (yy + hh/2 + Math.random()*20) +")",
							"font-size": ""+ (10)
						},
						"$$":scoreList
					};
					result.push(textXMLObject);

					// best match
					var svggerObj2 = SvggerClass.get(svggerObj.scores.list[0].index);

					var bb = svggerObj2.getBB();
					var globalPos;
					if(svggerObj2.parentSvgger() !== null) {
						globalPos = svggerObj2.parentSvgger().getGlobalPos();
					}else{
						globalPos = svggerObj2.getGlobalPos();
					}

					var xx2 = globalPos.x + bb.p1.x;
					var yy2 = globalPos.y + bb.p1.y;
					var ww2 = bb.p2.x - bb.p1.x;
					var hh2 = bb.p2.y - bb.p1.y;

					var lineXMLObject = {
						"#name":"line",
						"$":{
							"x1": ""+(xx + ww/2)+"px",
							"y1": ""+(yy + hh/2)+"px",
							"x2": ""+(xx2 + ww2/2)+"px",
							"y2": ""+(yy2 + hh2/2)+"px",
							"stroke": "lime",
							"fill": "none"
						}
					};
					result.push(lineXMLObject);
					return result;
				}
			);

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

	function traverseAddAnnotation(svggerObj, callback){
		var result = [];

		// my children's
		var clist = svggerObj.childrenList();
		if(clist.length > 0) {
			for (var i = 0; i < clist.length; i++) {
				var annotations2 = traverseAddAnnotation(clist[i], callback);
				result = result.concat(annotations2);
			}
		}

		// add mine
		var bb = svggerObj.getBB();
		var globalPos;
		if(svggerObj.parentSvgger() !== null) {
			globalPos = svggerObj.parentSvgger().getGlobalPos();
		}else{
			globalPos = svggerObj.getGlobalPos();
		}

		var xx = globalPos.x + bb.p1.x;
		var yy = globalPos.y + bb.p1.y;
		var ww = bb.p2.x - bb.p1.x;
		var hh = bb.p2.y - bb.p1.y;

		var newAnnotations = callback(svggerObj,xx,yy,ww,hh);
		result = result.concat(newAnnotations);




		return result;
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

	function createAnnotation(d, filenameSuffix, callback){
		var mergedPicture = {
			"#name":"svg",
			"$":{
				"enable-background": "new 0 0 1600 1000",
				"height": "1000px",
				"version": "1.1",
				"viewBox": "0 0 1600 1000",
				"width": "1600px",
				"x": "0px",
				"y": "0px",
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

		for(var s in d[1].symbolList){
			d[1].symbolList[s].BB(null);
		}
		d[0].rootSymbol.BB(null);
		d[1].rootSymbol.BB(null);

		var n = Svgger(mergedPicture);
		var childrenList = [];

		var child;
		child = d[0].rootSymbol;
		child.parentSvgger(n);
		childrenList.push(child);

		child = d[1].rootSymbol;
		child.parentSvgger(n);
		childrenList.push(child);

		n.childrenList(childrenList);


		var annotationList = traverseAddAnnotation(n, callback);

		mergedPicture["$$"].push( {
			"#name":"g",
			"$":{
			},
			"$$":annotationList
		} );

		dumpPhoto(mergedPicture, filenameSuffix);
	}


	function twoDP(number) {
		return Math.round( number * 100 ) / 100;
	}

	return App;
})();
