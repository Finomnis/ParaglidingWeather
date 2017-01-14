function ForecastTable(coords, name){
	
	this.time_points = [5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21];
	this.windMapMaxHeight = 4000;
	this.cloudMapMaxHeight = 5000;
	
	this.table = {};
	this.coords = {};
	
	
	this.constructCloudMap = function(data){
		return ForecastDrawer.drawDataMap(data,
										  this.cloudMapMaxHeight,
										  function (data,time,height) {
											  return data[time]["cldfra"][height];
										  },
										  function (data) {
											  var gray = 100*data + 255*(1-data);
											  return [gray,gray,gray];
										  });
	};
		
	this.constructWindMap = function(data){
		return ForecastDrawer.drawDataMap(data,
										  this.windMapMaxHeight,
										  function (data,time,height) {
											  var umet = data[time]["umet"][height];
											  var vmet = data[time]["vmet"][height];
											  return Math.sqrt(umet*umet+vmet*vmet);
										  },
										  Color.get.bind(Color, "PAL_WIND")
			);
	};

	this.clearElement = function(element){
		while (element.firstChild) {
			element.removeChild(element.firstChild);
		}
		return element;
	};
	
	this.constructRow = function(data, type, colmap){
		return ForecastDrawer.drawColorLine(data, type, Color.get.bind(Color,colmap));
	};
	
	this.buildElement = function(day,data){
		//console.log(this);
		this.clearElement(this.table["windMap"][day]).appendChild(this.constructWindMap(data));
		this.clearElement(this.table["cloudMap"][day]).appendChild(this.constructCloudMap(data));
		this.clearElement(this.table["raintot"][day]).appendChild(this.constructRow(data, "raintot", "PAL_RAIN"));
		this.table["raintot"][day].appendChild(this.constructRow(data, "raintot", "PAL_RAIN"));
	};
	
	this.addTableRow = function(tableElem, dates, name){
		this.table[name] = {};
		var trElem = document.createElement("TR");
		trElem.style.padding="0px";
		for(var i = 0; i < dates.length; i++){
			var tdElem = document.createElement("TD");
			tdElem.style.padding="0px";
			tdElem.innerHTML="loading...";
			var date = dates[i];
			this.table[name][date] = tdElem;
			trElem.appendChild(tdElem);
		}
		tableElem.appendChild(trElem);
	};
	
	this.initialize = function(){
		var tmpTable = document.createElement("TABLE");
				
		var datesToLoad = WeatherData.runDays;
		
		this.addTableRow(tmpTable, Object.keys(datesToLoad), "windMap");
		this.addTableRow(tmpTable, Object.keys(datesToLoad), "cloudMap");
		this.addTableRow(tmpTable, Object.keys(datesToLoad), "raintot");
		
		
		for(day in datesToLoad){
			// Send one async load for every day required
			WeatherData.fetchData(coords, day, this.time_points, ["z", "umet", "vmet", "cldfra", "raintot"],
				function(day, data){
					// retreive coordinates from one of the loads
					if(day === WeatherData.today){
						this.coords = data.gridCoords;
					}
					
					this.buildElement(day, data[day]);
				}.bind(this, day)
			);
		}
		return tmpTable;
	};
}

function ForecastTablesClass(){
	
	this.redraw = function(){
		// get div
		var forecastDiv = document.getElementById("forecastTables");
		// clear div
		while (forecastDiv.firstChild) {
			forecastDiv.removeChild(forecastDiv.firstChild);
		}
		// TODO replace with generic and configurable
		var table = new ForecastTable({lat: 49.5897, lon: 11.0120,}, "Erlangen");
		var tableDiv = table.initialize();
		forecastDiv.appendChild(tableDiv);
	};
}

var ForecastTables = new ForecastTablesClass(); 