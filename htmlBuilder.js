
var DOMBuilder = require('DOMBuilder');


(function() {
	'use strict';

	function HTMLBuilder(){

	}

	HTMLBuilder.buildDom = function buildDom(svgger1, svgger2){


	};

	HTMLBuilder.buildDivFromNode = function buildDivFromNode(svgger1){
		var e = DOMBuilder.elements;

		var result = e.DIV();


		var cl = svger1.getChildList();

		appendChild


		return

	}


	return HTMLBuilder;



	function makeHTML(meta, labs){
		return (function(e){
			var html = "<!DOCTYPE html>"+
			e.HTML({lang:"en"},
				e.HEAD(
					e.TITLE(meta.title),
					e.META({"http-equiv": "Content-Type", content: "text/html; charset=UTF-8"}),
					e.STYLE({type:"text/css"},
						"html { margin: 0; padding: 0; }\
						"
					),
					e.LINK({rel:"stylesheet", type:"text/css", href:"style.css"})
				),
				e.BODY(
					e.H1(meta.title),
					e.DIV({"id":"labs"},
						createTable(e,labs)
					)
				)
			);
		return html;
		})(DOMBuilder.elements);

	function createTable(e,labs) {
		// loop{index:number, first:bool, last:bool}
		/*
		*  {
		*  	"labVersion": config.labVersion,
		*  	"created": config.makeTimestamp(new Date()),
		*  	"name": "noname",
		*  	"description": "description",
		*  	"bannerPath": null,
		*  	"path": dirFiles[i],
		*  	"runCommand": "",
		*  	likes: 0,
		*  	dislikes: 0
		*  };
		*/
		return e.DIV.map(labs, function(labEntry, attributes, loop) {
			return e.DIV({"class":"lab-entry" + (loop.index % 2 == 0 ? ' stripe1' : ' stripe2')},
				e.IMG({"src": config.labPath + "/" + labEntry.path + labEntry.bannerPath}),
				e.DIV({"class":""},
					e.H2(labEntry.name),
					e.P(labEntry.likes + " / " + (labEntry.likes + labEntry.dislikes) + " likes"),
					e.P(DOMBuilder.html.markSafe(labEntry.description))
				)
			);
		});

	}
}


}());
