var alpsChPolygon;
var alpsAtPolygon;
var alpsPolygonInitialized = $.Deferred();

googleMapsApiInitialized.then(function(){
	alpsChPolygon = new google.maps.Polygon({
		paths: [new google.maps.LatLng(44.83689,10.74248), new google.maps.LatLng(44.87656,8.82932), new google.maps.LatLng(44.16448,8.05873), new google.maps.LatLng(46.73728,4.00992), new google.maps.LatLng(48.26937,9.28233)]
	});
	alpsAtPolygon = new google.maps.Polygon({
		paths: [new google.maps.LatLng(44.83689,10.74248), new google.maps.LatLng(45.41195,15.7931), new google.maps.LatLng(48.89114,15.0402), new google.maps.LatLng(48.26937,9.28233)]
	});
	alpsPolygonInitialized.resolve();
});


function ForecastTable(){
	this.xmlns = "http://www.w3.org/2000/svg";
	this.svg = document.createElementNS(this.xmlns, "svg");

	
	this.initialize = function(){
		console.log("Everything initialized to draw forecastTable!");
		this.svg.setAttributeNS(null, "width", 110);
		this.svg.setAttributeNS(null, "height", 100);
		console.log(WeatherData.runDays);
	};
	
	// Initialize once everything is ready
	$.when(alpsPolygonInitialized,WeatherData.initialized,ColorTables.initialized).then($.proxy(function(){
		this.initialize();
	},this));
}