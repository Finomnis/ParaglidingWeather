var locations = {
		"K&ouml;ssen":[47.654033, 12.420704],
		"Siegritz":[49.855715, 11.220393],
		
};


function ForecastTablesClass(){

	
	this.redraw = function(){
		// get div
		var forecastDiv = document.getElementById("forecastTables");
		// clear div
		while (forecastDiv.firstChild) {
			forecastDiv.removeChild(forecastDiv.firstChild);
		}
		
		for(name in locations){
			var coords = locations[name];
			var div = document.createElement("div");
			div.innerHTML="<BR><h2>" + name + ":</h2>";
			div.appendChild((new ForecastTable({lat: coords[0], lon: coords[1],}, name)).initialize());
			forecastDiv.appendChild(div);
		}
	};
}

var ForecastTables = new ForecastTablesClass(); 

function updateColorTable(){
	
	var availableColorTables = {
			"wind": ["PAL_WIND", 3.6, "km/h"],
			"thermal_vel": ["PAL_THERMIQUES", 1, "m/s"],
			"b_s_ratio": ["PAL_BSRATIO", 1, null],
			"bl_top": ["PAL_CBASE", 1, "m"],
			"bl_vmotion": ["PAL_CONVERGENCE", 0.01, "m/s"]
		};
	
	
	var colorTable_selection = document.getElementById("color_table_select");
	var colorTableDiv = document.getElementById("colortable");
	while (colorTableDiv.firstChild) {
		colorTableDiv.removeChild(colorTableDiv.firstChild);
	}
	
	
	var colorTableConfig = availableColorTables[colorTable_selection.value];
	

	
	colorTableDiv.appendChild(ForecastDrawer.drawColorTable(colorTableConfig, "75vh"));
	var colorTableUnitLabel = document.getElementById("unit_label");
	if(colorTableConfig[2]){
		colorTableUnitLabel.innerHTML="Unit: " + colorTableConfig[2];
	} else {
		colorTableUnitLabel.innerHTML="no Unit";
	}
}

$(document).ready(function(){
	WeatherData.refreshAll(ForecastTables.redraw);
});

$(document).ready(function(){
	updateColorTable();
});