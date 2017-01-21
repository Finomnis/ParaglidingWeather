function ForecastTable(coords, name){
	
	this.time_points = [4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19];
	this.windMapMaxHeight = 4000;
	this.cloudMapMaxHeight = 5000;
	
	this.table = {};
	this.coords = {};
	this.mapsLink = {};
	this.heightEntry = {};
	
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
										  }, 16, 3);
	};
		
	this.constructWindMap = function(data){
		return ForecastDrawer.drawDataMap(data,
										  this.windMapMaxHeight,
										  function (data,time,height) {
											  var umet = data[time]["umet"][height];
											  var vmet = data[time]["vmet"][height];
											  return Math.sqrt(umet*umet+vmet*vmet);
										  },
										  Color.get.bind(Color, "PAL_WIND"),
										  16, 3
			);
	};
	
	this.constructRow = function(type, colmap, data){
		return ForecastDrawer.drawColorLine(data, type, Color.get.bind(Color,colmap), 16, 16);
	};
	
	this.constructArrowHeightRow = function(type1, type2, height, colmap, data){
		var height0 = data[Object.keys(data)[0]]["ter"];
		return ForecastDrawer.drawColorArrowHeightLine(data, type1, type2, height0 + height, Color.get.bind(Color,colmap), 16, 16);
	};
	
	this.tableElements = {
			"Weather":{
				"Clouds": this.constructCloudMap.bind(this),
				"Rain": this.constructRow.bind(this,"raintot", "PAL_RAIN")
			},
			"Wind":{
				"Height Distribution":this.constructWindMap.bind(this),
				"2000 GND":this.constructArrowHeightRow.bind(this,"umet","vmet",2000,"PAL_WIND"),
				"1000 GND":this.constructArrowHeightRow.bind(this,"umet","vmet",1000,"PAL_WIND"),
				"Surface":this.constructArrowHeightRow.bind(this,"umet","vmet",0,"PAL_WIND"),
				"BL Wind Shear":this.constructRow.bind(this,"blwindshear", "PAL_WIND")
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
		return;
		console.log(data);
		for(topic in this.tableElements){
			var topicElements = this.tableElements[topic];
			for(element in topicElements){
				this.clearElement(this.table[topic][element][day]).appendChild(topicElements[element](data));
			}
		}
	};
	
	this.loadAsync = function(days){
		for(day in days){
			// Send one async load for every day required
			WeatherData.fetchData(coords, day, this.time_points, ["z", "umet", "vmet", "cldfra", "raintot", "wstar", "bsratio", "pblh", "ter", "blwindshear", "wblmaxmin"],
				function(day, data){
					// retreive coordinates from one of the loads
					if(day === WeatherData.today){
						this.coords = data.gridCoords;
						console.log(data.gridCoords);
						
						// Set height entry
						this.clearElement(this.heightEntry).innerHTML = "Height: " + Math.round(data[day][Object.keys(data[day])[0]]["ter"]) + "m";
						
						// Set maps link
						var mapsLink = document.createElement("a");
						mapsLink.innerHTML="Map";
						mapsLink.target="_blank";
						mapsLink.href="http://www.google.com/maps/place/" + data.gridCoords.lat + "," + data.gridCoords.lon;
						this.clearElement(this.mapsLink).appendChild(mapsLink);
					}
					
					this.buildElement(day, data[day]);
				}.bind(this, day)
			);
		}
	};
	
	this.createSpacer = function(numElements, space){
		var spaceSize = Math.round(space) + "px";
		var spacer = document.createElement("TR");
		spacer.style.border = "none";
		spacer.style.height=spaceSize;
		//spacer.style.maxHeight=spaceSize;
		//spacer.style.minHeight=spaceSize;
		{
			var td = document.createElement("TD");
			td.style.border = "none";
			td.colSpan = 2;
			spacer.appendChild(td);
		}
		for(var i = 0; i < numElements; i++)
		{
			var td = document.createElement("TD");
			td.style.border = "none";
			td.style.borderRight = "1px solid black";
			td.style.borderLeft = "1px solid black";
			var square = ForecastDrawer.createSquare(16/*this.time_points.length*/, Math.round(space), "pink");
			td.appendChild(square);
			console.log(square);
			spacer.appendChild(td);
		}
		return spacer;
	};
	
	this.initialize = function(){
		var div = document.createElement("DIV");
		//var borderTable = document.createElement("TABLE");
		var tmpTable = document.createElement("TABLE");
		
		tmpTable.style.fontFamily="Arial";
		tmpTable.style.fontSize="12px";
		tmpTable.style.border = "none";
		tmpTable.style.width="100%";
		div.style.border = "1px solid #b0b0b0";
		div.style.backgroundColor = "#fcfcfc";
		div.style.padding="5px";
		div.style.display="inline-block";
		
		var datesToLoad = WeatherData.runDays;
		
		
		// Headers
		{
			var tr = document.createElement("TR");
			tr.style.border = "none";
			{
				var td = document.createElement("TD");
				td.innerHTML="Loading...";
				td.colSpan=2;
				td.style.border = "none";
				tr.appendChild(td);
				this.mapsLink=td;
			}
			for(date in datesToLoad){
				var th = document.createElement("TH");
				th.style.border = "none";
				var weekDays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
				var dateObj = new Date(date.substring(0,4),parseInt(date.substring(4,6))-1, date.substring(6,8));
				th.innerHTML = weekDays[dateObj.getDay()] + ", " + dateObj.getDate();
				tr.appendChild(th);
				th.style.paddingBottom="10px";
				
			}
			tmpTable.appendChild(tr);
		}
		
		// Times
		{
			var tr = document.createElement("TR");
			tr.style.border = "none";
			{
				var td = document.createElement("TD");
				td.innerHTML="Loading...";
				td.style.border = "none";
				td.colSpan=2;
				tr.appendChild(td);
				this.heightEntry=td;
			}
			for(date in datesToLoad){
				var td = document.createElement("TD");
				td.style.border = "none";
				td.style.borderLeft = "1px solid black";
				td.style.borderRight = "1px solid black";
				td.style.padding = "0px";
				//td.appendChild(ForecastDrawer.drawTimes(this.time_points, WeatherData.timezoneOffset));
				tr.appendChild(td);
				
			}
			tmpTable.appendChild(tr);
		}

		
		// Table Topics
		this.table = {};
		
		var firstSpace = 8;
		var otherSpaces = 10;
		for(topic in this.tableElements){
			tmpTable.appendChild(this.createSpacer(Object.keys(datesToLoad).length, firstSpace));
			firstSpace=otherSpaces;
			
			this.table[topic] = {};
			var topicElements = this.tableElements[topic];
			var numSubElements = Object.keys(topicElements).length;
			// Header
			{
				var tr = document.createElement("TR");
				tr.style.border = "none";
				var th = document.createElement("TH");
				th.style.border = "none";
				th.style.backgroundColor = "#e0e0e0";
				th.style.minWidth = "14px";
				th.rowSpan=numSubElements+1;
				var headerDiv = document.createElement("DIV");
				headerDiv.className = "vertical";
				headerDiv.innerHTML=topic;
				
				
				th.appendChild(headerDiv);
				tr.appendChild(th);
				tmpTable.appendChild(tr);
			}
			// Data rows
			for(element in topicElements){
				this.table[topic][element] = {};
				var tr = document.createElement("TR");
				tr.style.border = "none";
				tr.style.padding = "0px";
				// Description
				{
					var td = document.createElement("TD");
					td.style.paddingLeft="10px";
					td.style.paddingRight="2px";
					td.innerHTML=element;
					td.style.border = "none";
					td.style.textAlign = "right";
					tr.appendChild(td);
				}
				// Data
				for(date in datesToLoad){
					var td = document.createElement("TD");
					td.style.border = "1px solid black";
					td.style.padding = "0px";
					//td.style.width="300px";
					td.align = "center";
					td.appendChild(ForecastDrawer.createLoader());
					//td.innerHTML="Loading...";
					this.table[topic][element][date] = td;
					tr.appendChild(td);
				}				
				tmpTable.appendChild(tr);
			}
		}
		
		div.appendChild(tmpTable);
		//div.appendChild(ForecastDrawer.drawAllPallettes(500, 30));
		
		this.loadAsync(datesToLoad);
		
		return div;
	};
}

