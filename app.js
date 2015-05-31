var Promise = require("promise").Promise;
var fs = require("fs");
var libxmljs = require("libxmljs");

module.exports = (function(){
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
		
		d[0].xmlString = fs.readFileSync(d[0].path, {encoding: 'utf8'});
		d[1].xmlString = fs.readFileSync(d[1].path, {encoding: 'utf8'});


		d[0].xmlDoc = libxmljs.parseXml(d[0].xmlString);
		d[1].xmlDoc = libxmljs.parseXml(d[1].xmlString);

		var a= d[0].xmlDoc.childNodes();
		for(var aa in a){
			if(a[aa].name() == "text"){
				console.log(a[aa].name());
			}else{
				console.log(a[aa].name());
			}
		}
		console.log("===============");

		a = d[0].xmlDoc.get("//*[@id='Logo']").childNodes();
		console.log(a);

		for(var aa in a){
			console.log(a[aa].name());
		}


	}

	return App;
})();
