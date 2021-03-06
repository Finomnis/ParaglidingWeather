var locations = {
		"K&ouml;ssen":[47.625305, 12.445411],
		"Siegritz":[49.855715, 11.220393],
		"Sammenheim":[49.049908, 10.739406]
};

var timePoints = [4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19];

var URLObject = new urlObject();

function ForecastTablesClass(){

	this.loaded = false;
	
	this.tables = [];
	this.headers = [];
	
	this.oldTargetWidth = 0;
	
	this.computeTargetWidth = function(){
		var mainRect = document.getElementById("main").getBoundingClientRect();
		return mainRect.width*0.9;
	};
	
	this.reload = function(){
		// get div
		var forecastDiv = document.getElementById("forecastTables");
		// clear div
		while (forecastDiv.firstChild) {
			forecastDiv.removeChild(forecastDiv.firstChild);
		}
		
		var targetWidth = this.computeTargetWidth();
		this.oldTargetWidth = targetWidth;
		
		this.headers=[];
		this.tables=[];
		
		for(name in locations){
			var coords = locations[name];
			
			var table = new ForecastTable({lat: coords[0], lon: coords[1],}, name);
			this.tables.push(table);
			var scale = table.computeScaleFactor(targetWidth);
			if(scale > 1) scale = 1;
			
			var div = document.createElement("div");
			//div.innerHTML="<BR>";
			div.style.margin="3vw";
			var h2 = document.createElement("h2");
			h2.style.fontSize=24*scale+"px";
			h2.innerHTML=name;
			this.headers.push(h2);
			div.appendChild(h2);
			div.appendChild(table.initialize(scale));
			forecastDiv.appendChild(div);
		}
		this.loaded = true;
	};
	
	/*
	this.redraw = function(){
		//console.log(this);
		if(this.loaded == false){
			console.log(this.loaded);
			return;
		};
		
		var targetWidth = this.computeTargetWidth();
		if(targetWidth == this.oldTargetWidth){
			return;
		}

		this.oldTargetWidth = targetWidth;
		
		for(var i = 0; i < this.tables.length; i++){
			scale = this.tables[i].computeScaleFactor(targetWidth);
			if(scale > 1) scale = 1;
			this.headers[i].style.fontSize = 24*scale+"px";
			this.tables[i].redraw(scale);
		}
	};*/
	
	this.rescale = function(){
		//console.log(this);
		if(this.loaded == false){
			return;
		};
		
		var targetWidth = this.computeTargetWidth();
		if(targetWidth == this.oldTargetWidth){
			return;
		}

		this.oldTargetWidth = targetWidth;
		
		for(var i = 0; i < this.tables.length; i++){
			scale = this.tables[i].computeScaleFactor(targetWidth);
			if(scale > 1) scale = 1;
			this.headers[i].style.fontSize = 24*scale+"px";
			this.tables[i].rescale(scale);
		}
	};
}

var ForecastTables = new ForecastTablesClass(); 

function ColorTableSliderClass(){

	this.currentTable = Palettes["PAL_WIND"];
	this.currentPrefactor = 1;
	
	this.preformatColorTable = function(colorPalette, name){
		if(name === "PAL_CBASE"){
			var res = [];
			for(var i = 0; i < colorPalette.length; i++){
				var entry = colorPalette[i].slice();
				if(entry[0] < 0) continue;
				entry[0] = 250*Math.round(entry[0]/250);
				res.push(entry);
			}
			return res;
		}
		if(name === "PAL_WIND"){
			var res = [];
			for(var i = 0; i < colorPalette.length; i++){
				var entry = colorPalette[i].slice();
				if(entry[0] > 500){
					entry[0] = 9001/3.6;
					continue;
				}
				res.push(entry);
			}
			return res;
		}
		return colorPalette;
	};

	this.redrawColorTable = function(){
		
		ForecastDrawer.drawColorTable(this.currentTable, this.currentPrefactor, document.getElementById("colortable"));
		
	};
	
	this.updateColorTable = function(){

		var availableColorTables = {
				"temp": ["PAL_TEMP", 1, "&#8451;"],
				"press": ["PAL_PRESS", 1, "hPa"],
				"wind": ["PAL_WIND", 3.6, "km/h"],
				"thermal_vel": ["PAL_THERMIQUES", 1, "m/s"],
				"b_s_ratio": ["PAL_BSRATIO", 1, null],
				"bl_top": ["PAL_CBASE", 1, "m/GND"],
				"bl_vmotion": ["PAL_CONVERGENCE", 1, "m/s"],
				"foehn": ["PAL_WIND", 0.54, "hPa"]
			};
		
		
		var colorTable_selection = document.getElementById("color_table_select");
		
		var colorTableConfig = availableColorTables[colorTable_selection.value];
		
		this.currentTable = this.preformatColorTable(Palettes[colorTableConfig[0]], colorTableConfig[0]);
		this.currentPrefactor = colorTableConfig[1];
		this.redrawColorTable();
		
		var colorTableUnitLabel = document.getElementById("unit_label");
		if(colorTableConfig[2]){
			colorTableUnitLabel.innerHTML=label("colortables_unit") + ": " + colorTableConfig[2];
		} else {
			colorTableUnitLabel.innerHTML=label("colortables_no_unit");
		}
	};
	
}
var ColorTableSlider = new ColorTableSliderClass();

function closeRightSidebar(){
	document.getElementById("main").style.marginRight="0vh";
	ForecastTables.rescale();
	document.getElementById("rightSidebarButton").onclick=openRightSidebar;
	document.getElementById("right_arrow").innerHTML="&laquo;";
	document.getElementById("right_bar").style.marginRight="0vh";
	document.getElementById("rightSidebarButton").style.marginRight="0vh";
}

function openRightSidebar(){
	document.getElementById("main").style.marginRight="25vh";
	ForecastTables.rescale();
	document.getElementById("rightSidebarButton").onclick=closeRightSidebar;
	document.getElementById("right_arrow").innerHTML="&raquo;";
	document.getElementById("right_bar").style.marginRight="25vh";
	document.getElementById("rightSidebarButton").style.marginRight="25vh";
}

function MainControlClass(){
	
	this.disablePage = function(){
		var disabler = document.getElementById("fullscreenDisabler");
		disabler.style.display="block";
	};
	
	this.enablePage = function(){
		var disabler = document.getElementById("fullscreenDisabler");
		disabler.style.display="none";
	};
	
	this.showMessage = function(message){
		var popup = this.showPopup();
		popup.innerHTML = message;
		popup.style.fontSize="30px";
	};
	
	this.showPopup = function(){
		this.disablePage();
		var popup = document.getElementById("popupWindow");
		popup.style.display="block";
		while (popup.firstChild) {
			popup.removeChild(popup.firstChild);
		}
		return popup;
	};
	
	this.hidePopup = function(){
		this.enablePage();
		var popup = document.getElementById("popupWindow");
		popup.style.display="none";
	};
}
var MainControl = new MainControlClass();



function URLCoderClass(){
	this.encodeBase64 = function(obj){
		return Base64.encodeURI(JSON.stringify(obj));
	};
	
	this.decodeBase64 = function(str){
		return JSON.parse(Base64.decode(str));
	};
}
var URLCoder = new URLCoderClass();

function initializeWeatherData(){
	if(URLObject.parameters.placeID){
		geocoder.geocode({'placeId': URLObject.parameters.placeID}, function(results, status) {
			if (status === 'OK') {
				var place = results[0];
				locations = {};
				locations[place.formatted_address] = [place.geometry.location.lat(),place.geometry.location.lng()];
			} else {
				MainControl.showMessage(label("placeid_err"));
			}
			WeatherData.refreshAll(ForecastTables.reload.bind(ForecastTables));
		});
		return;
	} else if(URLObject.parameters.locations){
		locations = URLCoder.decodeBase64(URLObject.parameters.locations);
	}		
	WeatherData.refreshAll(ForecastTables.reload.bind(ForecastTables));
}

/*$(document).ready(function(){
	if(!URLObject.parameters.placeID){
		initializeWeatherData();
	}
});*/

$(document).ready(function(){
	if(navigator.geolocation){
		document.getElementById("gps_input").style.display="inline";
	}
	
	ColorTableSlider.updateColorTable();
});


window.onresize = function(){
	ColorTableSlider.redrawColorTable();
	ForecastTables.rescale();
};

$(document).keyup(function(e) {
	  if (e.keyCode === 27) MainControl.hidePopup();	// esc
	  //else if (e.keyCode === 13) MainControl.hidePopup(); // return
	});

// callback for google places api
var autocomplete;
var geocoder;
var searchBounds;
function initPlaces(){
	searchBounds = new google.maps.LatLngBounds(
	          new google.maps.LatLng( 41.43, -4.96), //sw
	          new google.maps.LatLng( 51.4, 15.72 ) //ne
	        );
	autocomplete = new google.maps.places.Autocomplete(document.getElementById("search_input"),{types:['geocode'], bounds:searchBounds});
	
	autocomplete.addListener('place_changed', function(){URLGenerator.search();});
	
	geocoder = new google.maps.Geocoder;
	
	// NOW start to get data for the website
	initializeAlpsPolygon();
	initializeWeatherData();
	
}