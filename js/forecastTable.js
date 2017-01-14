function ForecastTable(coords, name){
	
	this.time_points = [5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21];
	this.windMapMaxHeight = 4000;
	this.cloudMapMaxHeight = 5000;
	
	
	this.data = {};
	this.coords = {};
	this.div = document.createElement("div");
	
	this.table = {};
	
	this.getNumEntries = function(targetHeight, day){
		console.log(this.data);
		var heights = this.data[day][12].z;
		var id;
		for(id = 0; id < heights.length; id++){
			if(heights[id] > targetHeight){
				break;
			}
		}
		return id;
	};
	
	this.constructCloudMap = function(day){
		var cloudData = this.data[day];
		return ForecastDrawer.drawDataMap(Object.keys(cloudData),
										  this.getNumEntries(this.cloudMapMaxHeight,day),
										  function (cloudData,time,height) {
											  return cloudData[time]["cldfra"][height];
										  }.bind(this,cloudData),
										  function (data) {
											  var gray = 100*data + 255*(1-data);
											  return [gray,gray,gray];
										  });
	}
		
	this.constructWindMap = function(day){
		var windData = this.data[day];
		return ForecastDrawer.drawDataMap(Object.keys(windData),
										  this.getNumEntries(this.windMapMaxHeight,day),
										  function (windData,time,height) {
											  var umet = windData[time]["umet"][height];
											  var vmet = windData[time]["vmet"][height];
											  return Math.sqrt(umet*umet+vmet*vmet);
										  }.bind(this,windData),
										  Color.get.bind(Color, "PAL_WIND")
			);
	};

	this.clearElement = function(element){
		while (element.firstChild) {
			element.removeChild(element.firstChild);
		}
		return element;
	}
	
	this.buildElement = function(day){
		//console.log(this);
		this.clearElement(this.table["windMap"][day]).appendChild(this.constructWindMap(day));
		this.clearElement(this.table["cloudMap"][day]).appendChild(this.constructCloudMap(day));
	};
	
	this.numDataLoaded = 0;

	this.addTableRow = function(tableElem, dates, name){
		this.table[name] = {};
		var trElem = document.createElement("TR");
		for(var i = 0; i < dates.length; i++){
			var tdElem = document.createElement("TD");
			tdElem.innerHTML="loading...";
			var date = dates[i];
			this.table[name][date] = tdElem;
			trElem.appendChild(tdElem);
		}
		tableElem.appendChild(trElem);
	};
	
	this.initialize = function(){
		
		var tmpTable = document.createElement("TABLE");
		
		/*
		var tmpTR = document.createElement("TR");
		var tmpTD = document.createElement("TD");
		tmpTD.innerHTML = "Loading...";
		tmpTR.appendChild(tmpTD);
		tmpTable.appendChild(tmpTR);
		this.div.appendChild(tmpTable);
		*/
		
		var datesToLoad = WeatherData.runDays;
		
		this.addTableRow(tmpTable, Object.keys(datesToLoad), "windMap");
		this.addTableRow(tmpTable, Object.keys(datesToLoad), "cloudMap");
		
		for(day in datesToLoad){
			// Send one async load for every day required
			WeatherData.fetchData(coords, day, this.time_points, ["z", "umet", "vmet", "cldfra"],
				function(day, numDates, data){
					// retreive coordinates from one of the loads
					if(day === WeatherData.today){
						this.coords = data.gridCoords;
					}
					
					this.data[day] = data[day];
					
					this.buildElement(day);
				}.bind(this, day, Object.keys(datesToLoad).length)
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