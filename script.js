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
				"wind": ["PAL_WIND", 3.6, "km/h"],
				"thermal_vel": ["PAL_THERMIQUES", 1, "m/s"],
				"b_s_ratio": ["PAL_BSRATIO", 1, null],
				"bl_top": ["PAL_CBASE", 1, "m"],
				"bl_vmotion": ["PAL_CONVERGENCE", 0.01, "m/s"]
			};
		
		
		var colorTable_selection = document.getElementById("color_table_select");
		
		var colorTableConfig = availableColorTables[colorTable_selection.value];
		
		this.currentTable = this.preformatColorTable(Palettes[colorTableConfig[0]], colorTableConfig[0]);
		this.currentPrefactor = colorTableConfig[1];
		this.redrawColorTable();
		
		var colorTableUnitLabel = document.getElementById("unit_label");
		if(colorTableConfig[2]){
			colorTableUnitLabel.innerHTML="Unit: " + colorTableConfig[2];
		} else {
			colorTableUnitLabel.innerHTML="no Unit";
		}
	};
	
}

function closeRightSidebar(){
	document.getElementById("rightSidebarButton").onclick=openRightSidebar;
	document.getElementById("right_arrow").innerHTML="&laquo;";
	document.getElementById("main").style.marginRight="0vh";
	document.getElementById("right_bar").style.marginRight="0vh";
	document.getElementById("rightSidebarButton").style.marginRight="0vh";
}

function openRightSidebar(){
	document.getElementById("rightSidebarButton").onclick=closeRightSidebar;
	document.getElementById("right_arrow").innerHTML="&raquo;";
	document.getElementById("main").style.marginRight="25vh";
	document.getElementById("right_bar").style.marginRight="25vh";
	document.getElementById("rightSidebarButton").style.marginRight="25vh";
}

var ColorTableSlider = new ColorTableSliderClass();

$(document).ready(function(){
	WeatherData.refreshAll(ForecastTables.redraw);
});

$(document).ready(function(){
	ColorTableSlider.updateColorTable();
});

window.onresize = function(){
	ColorTableSlider.redrawColorTable();
};