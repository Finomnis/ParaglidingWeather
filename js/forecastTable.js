function ForecastTable(coords, name){
	
	this.time_points = [5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21];
	this.windMapMaxHeight = 4000;
	this.cloudMapMaxHeight = 5000;
	
	this.table = {};
	this.coords = {};
	
	this.todoElement = function(data){
		var div = document.createElement("DIV");
		div.innerHTML="TODO";
		return div;
	};
	

	
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
	
	this.constructRow = function(type, colmap, data){
		return ForecastDrawer.drawColorLine(data, type, Color.get.bind(Color,colmap));
	};
	
	this.tableElements = {
			"Weather":{
				"Clouds": this.constructCloudMap.bind(this),
				"Rain": this.constructRow.bind(this,"raintot", "PAL_RAIN")
			},
			"Wind":{
				"Height Distribution":this.constructWindMap.bind(this),
				"BL Wind Shear":this.constructRow.bind(this,"blwindshear", "PAL_WIND"),
				"2000 GND":this.todoElement,
				"1000 GND":this.todoElement,
				"Surface":this.todoElement
			},
			"Thermals":{
				"Velocity":this.constructRow.bind(this,"wstar", "PAL_THERMIQUES"),
				"B/S Ratio":this.constructRow.bind(this,"bsratio", "PAL_BSRATIO"),
				"BL Top":this.constructRow.bind(this,"bsratio", "PAL_CBASE"),
				"BL Vertical Motion":this.constructRow.bind(this,"wblmaxmin", "PAL_CONVERGENCE"),
			}
	};
	

	
	this.clearElement = function(element){
		while (element.firstChild) {
			element.removeChild(element.firstChild);
		}
		return element;
	};

	
	this.buildElement = function(day,data){
		console.log(this);
		for(topic in this.tableElements){
			var topicElements = this.tableElements[topic];
			console.log(topicElements);
			for(element in topicElements){
				this.clearElement(this.table[topic][element][day]).appendChild(topicElements[element](data));
			}
		}
		//console.log(this);
		//this.clearElement(this.table["windMap"][day]).appendChild(this.constructWindMap(data));
		//this.clearElement(this.table["cloudMap"][day]).appendChild(this.constructCloudMap(data));
		//this.clearElement(this.table["raintot"][day]).appendChild(this.constructRow(data, "raintot", "PAL_RAIN"));
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
	
	this.loadAsync = function(days){
		for(day in days){
			// Send one async load for every day required
			WeatherData.fetchData(coords, day, this.time_points, ["z", "umet", "vmet", "cldfra", "raintot", "wstar", "bsratio", "pblh", "ter", "blwindshear", "wblmaxmin"],
				function(day, data){
					// retreive coordinates from one of the loads
					if(day === WeatherData.today){
						this.coords = data.gridCoords;
					}
					
					this.buildElement(day, data[day]);
				}.bind(this, day)
			);
		}
	};
	
	this.initialize = function(){
		var div = document.createElement("DIV");
		var tmpTable = document.createElement("TABLE");
		
		tmpTable.style.fontFamily="Arial";
		tmpTable.style.fontSize="12px";
		
		var datesToLoad = WeatherData.runDays;
		
		// Top left info box
		{
			var tr = document.createElement("TR");
			var td = document.createElement("TD");
			td.innerHTML="TODO: Infos.";
			td.rowSpan=3;
			td.colSpan=2;
			tr.appendChild(td);
			tmpTable.appendChild(tr);
		}
		
		// Headers
		{
			var tr = document.createElement("TR");
			for(date in datesToLoad){
				var th = document.createElement("TH");
				th.innerHTML=date;
				tr.appendChild(th);
				
			}
			tmpTable.appendChild(tr);
		}
		
		// Times
		{
			var tr = document.createElement("TR");
			for(date in datesToLoad){
				var td = document.createElement("TD");
				td.innerHTML="TODO: Times.";
				tr.appendChild(td);
				
			}
			tmpTable.appendChild(tr);
		}

		// Table Topics
		this.table = {};
		for(topic in this.tableElements){
			this.table[topic] = {};
			var topicElements = this.tableElements[topic];
			var numSubElements = Object.keys(topicElements).length;
			// Header
			{
				var tr = document.createElement("TR");
				var th = document.createElement("TH");
				th.innerHTML=topic;
				th.rowSpan=numSubElements+1;
				tr.appendChild(th);
				tmpTable.appendChild(tr);
			}
			// Data rows
			for(element in topicElements){
				this.table[topic][element] = {};
				var tr = document.createElement("TR");
				// Description
				{
					var td = document.createElement("TD");
					td.innerHTML=element;
					tr.appendChild(td);
				}
				// Data
				for(date in datesToLoad){
					var td = document.createElement("TD");
					td.innerHTML="Loading...";
					this.table[topic][element][date] = td;
					tr.appendChild(td);
				}				
				tmpTable.appendChild(tr);
			}
		}
		
		//this.addTableRow(tmpTable, Object.keys(datesToLoad), "windMap");
		//this.addTableRow(tmpTable, Object.keys(datesToLoad), "cloudMap");
		//this.addTableRow(tmpTable, Object.keys(datesToLoad), "raintot");
		
		div.appendChild(tmpTable);
		div.appendChild(ForecastDrawer.drawAllPallettes(500, 30));
		
		this.loadAsync(datesToLoad);
		
		return div;
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