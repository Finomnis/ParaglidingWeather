// This object loads WeatherData from meteo-parapente as soon as possible
function WeatherDataClass(){
	this.initialized = $.Deferred();

	$.ajax({
		url: "https://data0.meteo-parapente.com/status.php",
		dataType: "jsonp",
		success: $.proxy(function(data){
			this.runDays = {};
			this.domain = Object.keys(data)[0];
			data = data[this.domain];
			var i;
			var today = new Date();
			this.timezoneOffset = -Math.round(today.getTimezoneOffset()/60);
			var getDate = function(today, offset){
				var date =  new Date(today.getTime() + offset * 24 * 60 * 60 * 1000);
				var month = (date.getMonth()+1).toString();
				while(month.length < 2) month = "0"+month;
				var day = date.getDate().toString();
				while(day.length < 2) day = "0"+day;
				return date.getFullYear() + month + day;
			};
			this.today = getDate(today, 0);
			for(i = 0;i<100;i++){
				
				var dateStr = getDate(today, i);
				var found = false;
				var j;
				for(j = 0; j < data.length; j++){
					var d = data[j];
					if(d.day !== dateStr) continue;
					if(d.status !== "complete") continue;
					if(this.runDays[dateStr] !== null){
						if(d.run <= this.runDays[dateStr]){
							continue;
						}
					}
					this.runDays[dateStr] = d.run;
					found = true;
				}
				if(found == false) break;
			}
			
			this.initialized.resolve();
		},this)
	});

}
var WeatherData = new WeatherDataClass();
WeatherData.initialized.then(function(){console.log(WeatherData);});


// This object loads the client.js from meteo-parapente as soon as possible.
function ParapenteJsClientClass(){

	this.initialized = $.Deferred();

	if(typeof window.webpackJsonp === "function"){
		alert("ERROR: Collision of webpackJsonp!");
		return;
	}

	window.webpackJsonp = $.proxy(function (a,b,c){
		this.data = b;
		this.initialized.resolve();
	},this);
	
	$.ajax({
		  url: "https://meteo-parapente.com/client.e96c0291.js",
		  dataType: "jsonp",
		});
	
	this.get = function(num){
		return this.data[num];
	};

}
var ParapenteJsClient = new ParapenteJsClientClass();

// this class loads the colortable as soon as possible
function ColorTablesClass(){

	this.initialized = $.Deferred();
	this.get = function(name){return undefined;};

	ParapenteJsClient.initialized.then($.proxy(function(){
		var func = {b:0};
		ParapenteJsClient.get(5)(0,func,0);
		this.parapenteColorTable = func.b;
		this.get = function(name){
			return ColorTables.parapenteColorTable(name);
		};
		this.initialized.resolve();
	}, this));
	
};
var ColorTables = new ColorTablesClass();
ColorTables.initialized.then(function(){console.log(ColorTables.get("PAL_ALTI"));});
