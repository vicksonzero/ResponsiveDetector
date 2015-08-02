var assert = require("assert");

module.exports = (function(){
	// config file / constants
	var config = {
		w:{ //weight
			// adds up to 1
			colorScore:{
				fill:0.7,
				stroke:null	// auto: 1 minus fill
			},
			// adds up to 1
			colorHSV:{
				h:0.7,
				s:0.15,
				v:0.15
			},
			finalScore:{
				color:0.3,
				shape:0.7
			}
		},
		interestedTags:{
			"g":true,
			"rect":true,
			"circle":true,
			"ellipse":true,
			"line":true,
			"polyline":true,
			"polygon":true,
			"path":true,
			"svg":true
		},
		pathSegmentLength:5
	};

	// preprocessing
	(function(color) {
		color.stroke = 1 - color.fill;
	}(config.w.colorScore));

	// validation
	(function(c) {
		assert.equal(c.stroke + c.fill, 1, "[color] weights should add up to 1");
	}(config.w.colorScore));

	(function(c) {
		assert.equal(c.h + c.s + c.v, 1, "[colorHSV] weights should add up to 1");
	}(config.w.colorHSV));

	// return processed config
	return config;
})();
