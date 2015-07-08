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
				h:0.6,
				s:0.2,
				v:0.2
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
			"path":true
		}
	};

	// preprocessing
	(function(color) {
		color.stroke = 1 - color.fill;
	}(config.w.colorScore));

	// validation
	(function(c) {
		assert(c.stroke + c.fill == 1, "[color] weights should add up to 1");
	}(config.w.colorScore));

	(function(c) {
		assert(c.h + c.s + c.v == 1, "[colorHSV] weights should add up to 1");
	}(config.w.colorHSV));

	// return processed config
	return config;
})();
