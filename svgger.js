
// xml parsing
var libxmljs = require("libxmljs");

// rgb and hsv conversion
var colorful = require('colorful');
var RGB = colorful.RGB;
var HSV = colorful.HSV;

// wrapper class for libxmljs, used in svg context
module.exports = (function(){
	function App(xmlObject){
		return{
			attr: function (key, val) {
				return xmlObject.attr(key).value();
			},
			colorFill: function (val) {
				if(val === undefined){
					// getter
					return this.attr("fill");
				}
			},
			colorStroke: function (val) {
				if(val === undefined){
					// getter
					return this.attr("stroke");
				}
			}
		}
	}

	return App;
})();
