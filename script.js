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
	
	var colorTable_selection = document.getElementById("color_table_select");
	var colorTableDiv = document.getElementById("colortable");
	while (colorTableDiv.firstChild) {
		colorTableDiv.removeChild(colorTableDiv.firstChild);
	}
	
	colorTableDiv.appendChild(ForecastDrawer.drawColorTable(colorTable_selection.selectedIndex));
	
}

$(document).ready(function(){
	WeatherData.refreshAll(ForecastTables.redraw);
});

$(document).ready(function(){
	updateColorTable();
});