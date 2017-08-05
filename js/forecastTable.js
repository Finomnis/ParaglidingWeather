//var alpsPolygon;
var alpsChPolygon;
var alpsAtPolygon;

var initializeAlpsPolygon = function(){
//	alpsPolygon = new google.maps.Polygon({
//		paths: [{"lat":48.15875730456923,"lng":11.063232421875},{"lat":48.45835188280866,"lng":16.67724609375},{"lat":46.73233101286786,"lng":16.50146484375},{"lat":45.66780526567164,"lng":13.458251953125},{"lat":44.707706221835345,"lng":10.6787109375},{"lat":44.91813929958515,"lng":9.173583984375},{"lat":43.34914966389312,"lng":8.4375},{"lat":43.16512263158295,"lng":5.592041015625},{"lat":45.01141864227728,"lng":4.207763671875},{"lat":47.092565552235705,"lng":5.625},{"lat":48.04136507445029,"lng":8.426513671875}]
//	});
	alpsChPolygon = new google.maps.Polygon({
		paths: [new google.maps.LatLng(44.83689,10.74248), new google.maps.LatLng(44.87656,8.82932), new google.maps.LatLng(44.16448,8.05873), new google.maps.LatLng(46.73728,4.00992), new google.maps.LatLng(48.26937,9.28233)]
	});
	alpsAtPolygon = new google.maps.Polygon({
		paths: [new google.maps.LatLng(44.83689,10.74248), new google.maps.LatLng(45.41195,15.7931), new google.maps.LatLng(48.89114,15.0402), new google.maps.LatLng(48.26937,9.28233)]
	});
};


function ForecastTable(coords, name){
	
	this.inAlpsAt = false;
	if(google.maps.geometry.poly.containsLocation(new google.maps.LatLng(coords.lat,coords.lon), alpsAtPolygon)){
		this.inAlpsAt = true;
	}
	this.inAlpsCh = false;
	if(google.maps.geometry.poly.containsLocation(new google.maps.LatLng(coords.lat,coords.lon), alpsChPolygon)){
		this.inAlpsCh = true;
	}
		
	this.time_points = timePoints;
	this.windMapMaxHeight = 5300;//4050;
	this.cloudMapMaxHeight = 11000;//5050;
	
	this.table = {};
	this.mapsLink = {};
	this.heightEntry = {};
	
	this.data = {};
	
	this.canvases = {};
	
	this.scalableElements = {};
	
	this.todoElement = function(data){
		var div = document.createElement("DIV");
		div.innerHTML="TODO";
		return div;
	};
	

	
	this.constructCloudMap = function(data, scale){
		return ForecastDrawer.drawDataMap(data,
										  this.cloudMapMaxHeight,
										  function (data,time,height) {
											  return data[time]["cldfra"][height];
										  },
										  function (data) {
											  var gray = 100*data + 255*(1-data);
											  return [gray,gray,gray];
										  },
										  "rgba(200,0,180,1.0)",
										  16, 3, scale);
	};
		
	this.constructWindMap = function(data, scale){
		return ForecastDrawer.drawDataMap(data,
										  this.windMapMaxHeight,
										  function (data,time,height) {
											  var umet = data[time]["umet"][height];
											  var vmet = data[time]["vmet"][height];
											  return Math.sqrt(umet*umet+vmet*vmet);
										  },
										  Color.get.bind(Color, "PAL_WIND"),
										  "rgba(200,0,180,1.0)",
										  16, 3, scale
			);
	};
	
	this.constructWindDirMap = function(data, scale){
		return ForecastDrawer.drawDataMap(data,
				  this.windMapMaxHeight,
				  function (data,time,height) {
					  var umet = data[time]["umet"][height];
					  var vmet = data[time]["vmet"][height];
					  return [umet, vmet];
				  },
				  function ( vel2 ) {
					  /*var vel3 = [ vel2[0], vel2[1], 5 ];
					  var abs = Math.sqrt(vel3[0]*vel3[0]+vel3[1]*vel3[1]+vel3[2]*vel3[2]);
					  vel3[0] = vel3[0] / abs;
					  vel3[1] = vel3[1] / abs;
					  vel3[2] = vel3[2] / abs;
					  return [
			          Math.round(vel3[0] * 127.5 + 127.5),
			          Math.round(vel3[1] * 127.5 + 127.5),
			          Math.round(vel3[2] * 127.5 + 127.5),
			          ];*/
					  
					  var abs = Math.sqrt(vel2[0]*vel2[0]+vel2[1]*vel2[1]);
					  vel2[0] = vel2[0] / abs;
					  vel2[1] = vel2[1] / abs;
					  
					  if(vel2[0] > vel2[1]){
						  
					  }
					  
					  var dir = Math.atan(vel2[0]/vel2[1]) * 180 / Math.PI; 
					  var dir2 = 90 - Math.atan(vel2[1]/vel2[0]) * 180 / Math.PI;
					  
					  while(dir > 180) dir = dir - 180;
					  while(dir < 0) dir = dir + 180;
					  
					  if(vel2[0] > 0){
						  dir = 180 + dir;
					  }
					  
					  console.log(dir + " - " + dir2);
					  
					  
					  return Color.getHSL(dir, 1, Math.min(abs/20,0.5));
					   
				  },
				  "rgba(255,255,255,0.7)",
				  16, 3, scale
			);
	};
	
	this.constructRow = function(type, colmap, data, scale){
		return ForecastDrawer.drawColorLine(data, type, Color.get.bind(Color,colmap), 16, 16, scale);
	};
	
	this.constructScaledRow = function(type, colmap, colorScale, data, scale){
		return ForecastDrawer.drawColorLine(
			data, type,
			function (val){
					return Color.get(colmap, val*colorScale);
			},
			16, 16, scale
		);
	};
	
	this.constructArrowHeightRow = function(type1, type2, height, colmap, data, scale){
		var height0 = data[Object.keys(data)[0]]["ter"];
		return ForecastDrawer.drawColorArrowHeightLine(data, type1, type2, height0 + height, Color.get.bind(Color,colmap), 16, 16, scale);
	};
	
	this.computeScaleFactor = function(width){
		
		// remove 1px borders
		var numDays = Object.keys(WeatherData.runDays).length;
		var innerWidth = width - (3+numDays);
		
		// divide by all others
		//var scale = innerWidth / ()
		var totalContent = 0;
		totalContent += 2*5; // outer padding
		totalContent += 14; // left headers
		totalContent += 110+2; // left data line headers
		
		totalContent += numDays * this.time_points.length * 16; // actual data table
		
		return innerWidth/totalContent;
		
	};
	
	this.tableElements = {
			"weather":{
				"table_press": this.constructRow.bind(this,"slp", "PAL_PRESS"),
				"table_temp": this.constructRow.bind(this,"tc2", "PAL_TEMP"),
				"table_clouds": this.constructCloudMap.bind(this),
				"table_rain": this.constructRow.bind(this,"raintot", "PAL_RAIN")
			},
			"wind":{
				//"table_heightdirdist":this.constructWindDirMap.bind(this),
				"table_heightdist":this.constructWindMap.bind(this),
				"table_2000gnd":this.constructArrowHeightRow.bind(this,"umet","vmet",2000,"PAL_WIND"),
				"table_1000gnd":this.constructArrowHeightRow.bind(this,"umet","vmet",1000,"PAL_WIND"),
				"table_surface":this.constructArrowHeightRow.bind(this,"umet","vmet",0,"PAL_WIND"),
				"table_windshear":this.constructRow.bind(this,"blwindshear", "PAL_WIND")
			},
			"thermals":{
				"table_therm_vel":this.constructRow.bind(this,"wstar", "PAL_THERMIQUES"),
				"table_therm_bsratio":this.constructRow.bind(this,"bsratio", "PAL_BSRATIO"),
				"table_therm_bltop":this.constructRow.bind(this,"pblh", "PAL_CBASE"),
				"table_therm_blvmot":this.constructScaledRow.bind(this,"wblmaxmin", "PAL_CONVERGENCE", 0.01),
			}
	};
	
	
	this.constructFoehnRow = function(country, data, scale){
		return ForecastDrawer.drawColorArrowLine(data, "ufoehn" + country, "vfoehn" + country,
				function(val){
					return Color.get("PAL_WIND",val/0.54);
				},
				16, 16, scale);
	};
	
	if(this.inAlpsAt){
		this.tableElements["wind"]["table_foehn_at"] = this.constructFoehnRow.bind(this, "at");
	} else if (this.inAlpsCh){
		this.tableElements["wind"]["table_foehn_ch"] = this.constructFoehnRow.bind(this, "ch");
	}
	
	this.clearElement = function(element){
		while (element.firstChild) {
			element.removeChild(element.firstChild);
		}
		return element;
	};

	
	this.buildElement = function(day, scale){
		var data = this.data[day];
		//console.log(data);
		if(!(day in this.canvases)){
			this.canvases[day] = {};
		}
		for(topic in this.tableElements){
			if(!(topic in this.canvases[day])){
				this.canvases[day][topic] = {};
			}
			var topicElements = this.tableElements[topic];
			for(element in topicElements){
				if(!(element in this.canvases[day][topic])){
					this.canvases[day][topic][element] = topicElements[element](data, scale);
				}
				ForecastDrawer.rescaleCanvas(this.canvases[day][topic][element], scale);
				this.clearElement(this.table[topic][element][day]).appendChild(this.canvases[day][topic][element]);
				this.table[topic][element][day].style.verticalAlign="bottom";
			}
		}
		//console.log(this.canvases);
	};
	
	this.updateTopLeft = function(){
		// Set height entry
		if(this.groundHeight){
			this.clearElement(this.heightEntry).innerHTML = label("height") + ": " + Math.round(this.groundHeight) + "m";
		}
		
		// Set maps link
		if(this.coords){
			var mapsLink = document.createElement("a");
			mapsLink.innerHTML=label("map");
			mapsLink.target="_blank";
			//mapsLink.href="http://www.google.com/maps/place/" + this.coords.lat + "," + this.coords.lon;
			mapsLink.href="https://meteo-parapente.com/#/" + this.coords.lat + "," + this.coords.lon + ",12";
			this.clearElement(this.mapsLink).appendChild(mapsLink);
		}
	};
	
	this.loadAsync = function(days, scale){
		// clear caches
		this.data = {};
		this.canvases = {};
		for(day in days){
			// Send one async load for every day required
			WeatherData.fetchData(coords, day, this.time_points, ["z", "umet", "vmet", "cldfra", "raintot", "wstar", "bsratio", "pblh", "tc2", "ter", "blwindshear", "wblmaxmin", "slp"],
				function(day, scale, data){
					// retreive coordinates from one of the loads
					if(day === WeatherData.today){
						this.coords = data.gridCoords;
						

						this.groundHeight = data[day][Object.keys(data[day])[0]]["ter"];
						this.updateTopLeft();						
					}
					this.data[day] = data[day];
					this.buildElement(day, scale);
				}.bind(this, day, scale)
			);
		}
	};
	
	this.createSpacer = function(numElements, space, scale){
		var spaceSize = space*scale + "px";
		var spacer = document.createElement("TR");
		spacer.style.border = "none";
		spacer.style.height=spaceSize;
		spacer.style.maxHeight=spaceSize;
		spacer.style.minHeight=spaceSize;
		{
			var td = document.createElement("TD");
			td.style.border = "none";
			td.colSpan = 2;
			spacer.appendChild(td);
		}
		{
			var td = document.createElement("TD");
			td.style.border = "none";
			td.colSpan = numElements;
			spacer.appendChild(td);
		}
		return spacer;
	};
	
	this.createBaseTable = function(scale){
		
		this.scalableElements = {};
		
		if(this.baseTable){
			this.baseTable = this.clearElement(this.baseTable);
		} else {
			this.baseTable = document.createElement("DIV");
		}
		
		var div = this.baseTable;
		
	
		//var borderTable = document.createElement("TABLE");
		var tmpTable = document.createElement("TABLE");
		
		tmpTable.style.fontFamily="Arial";
		tmpTable.style.fontSize= 12*scale + "px";
		tmpTable.style.border = "none";
		this.scalableElements["table"] = tmpTable;	// fontSize
		div.style.border = "1px solid #b0b0b0";
		div.style.backgroundColor = "#fcfcfc";
		div.style.padding= 5*scale + "px";
		div.style.display="inline-block";
		this.scalableElements["tablediv"] = div; // padding
		
		var datesToLoad = WeatherData.runDays;
		
		
		// Headers
		{
			var tr = document.createElement("TR");
			tr.style.border = "none";
			{
				var td = document.createElement("TD");
				td.innerHTML=label("loading");
				td.colSpan=2;
				td.style.border = "none";
				tr.appendChild(td);
				this.mapsLink=td;
			}
			this.scalableElements["dates"] = [];
			for(date in datesToLoad){
				var th = document.createElement("TH");
				th.style.border = "none";
				var weekDays = [label("sunday"),label("monday"),label("tuesday"),label("wednesday"),label("thursday"),label("friday"),label("saturday")];
				var dateObj = new Date(date.substring(0,4),parseInt(date.substring(4,6))-1, date.substring(6,8));
				th.innerHTML = weekDays[dateObj.getDay()] + ", " + dateObj.getDate();
				tr.appendChild(th);
				th.style.paddingBottom=10*scale+"px";
				this.scalableElements["dates"].push(th); // paddingBottom
			}
			tmpTable.appendChild(tr);
		}
		
		// Times
		{
			var tr = document.createElement("TR");
			tr.style.border = "none";
			{
				var td = document.createElement("TD");
				td.innerHTML=label("loading");
				td.style.border = "none";
				td.colSpan=2;
				tr.appendChild(td);
				this.heightEntry=td;
			}
			this.scalableElements["times"] = [];
			for(date in datesToLoad){
				var td = document.createElement("TD");
				td.style.border = "none";
				td.style.borderLeft = "1px solid black";
				td.style.borderRight = "1px solid black";
				td.style.padding = "0px";
				var timesDiv = ForecastDrawer.drawTimes(this.time_points, WeatherData.timezoneOffset, scale);
				this.scalableElements["times"].push(timesDiv); // fontsize and width
				td.appendChild(timesDiv);
				tr.appendChild(td);
				
			}
			tmpTable.appendChild(tr);
		}

		
		// Table Topics
		this.table = {};
		
		var firstSpace = 8;
		var otherSpaces = 10;
		this.scalableElements["headers"] = {};
		this.scalableElements["subtopics"] = {};
		this.scalableElements["spacer"] = [];
		this.scalableElements["spacersize"] = [];
		for(topic in this.tableElements){
			var spacer = this.createSpacer(Object.keys(datesToLoad).length, firstSpace, scale);
			this.scalableElements["spacer"].push(spacer);
			this.scalableElements["spacersize"].push(firstSpace);
			tmpTable.appendChild(spacer);
			
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
				th.style.minWidth = 14*scale+"px";
				this.scalableElements["headers"][topic] = th; // minWidth
				th.rowSpan=numSubElements+1;
				var headerDiv = document.createElement("DIV");
				headerDiv.className = "vertical";
				headerDiv.innerHTML=label(topic);
				
				
				th.appendChild(headerDiv);
				tr.appendChild(th);
				tmpTable.appendChild(tr);
			}
			// Data rows
			this.scalableElements["subtopics"][topic] = {};
			for(element in topicElements){
				this.table[topic][element] = {};
				var tr = document.createElement("TR");
				tr.style.border = "none";
				tr.style.padding = "0px";
				// Description
				{
					var td = document.createElement("TD");
					td.style.minWidth=110*scale + "px";
					td.style.paddingRight= 2*scale + "px";
					this.scalableElements["subtopics"][topic][element] = td; // minWidth, paddingRight
					td.innerHTML=label(element);
					td.style.border = "none";
					td.style.textAlign = "right";
					tr.appendChild(td);
				}
				// Data
				for(date in datesToLoad){
					var td = document.createElement("TD");
					td.style.border = "1px solid black";
					td.style.padding = "0px";
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
				
		return datesToLoad;
	};
	
	this.initialize = function(scale){
				
		var datesToLoad = this.createBaseTable(scale);
		
		this.loadAsync(datesToLoad, scale);
		
		return this.baseTable;
	};
	
	/*this.redraw = function(scale){
		
		this.createBaseTable(scale);
		
		for(day in this.data){
			this.buildElement(day, scale);
		}
		this.updateTopLeft();
	};*/
	
	this.rescale = function(scale){
		//console.log(this.scalableElements);
		
		for(var date in this.canvases){
			var canv2 = this.canvases[date];
			for(var topic in canv2){
				var canv3 = canv2[topic];
				for(var subtopic in canv3){
					ForecastDrawer.rescaleCanvas(canv3[subtopic],scale);
				}
			}			
		}
		
		this.scalableElements["table"].style.fontSize= 12*scale + "px";
		this.scalableElements["tablediv"].style.padding= 5*scale + "px";
		
		for(var i = 0; i < this.scalableElements["dates"].length; i++){
			this.scalableElements["dates"][i].style.paddingBottom=10*scale+"px";
		};
		for(var i = 0; i < this.scalableElements["times"].length; i++){
			var currentTime = this.scalableElements["times"][i];
			currentTime.style.fontSize=scale*9.5 + "px";
			currentTime.style.width=Math.round(16*scale*this.time_points.length) + "px";
		};
		
		for(var topic in this.scalableElements["headers"]){
			this.scalableElements["headers"][topic].style.minWidth = 14*scale+"px";
			for(var subtopic in this.scalableElements["subtopics"][topic]){
				this.scalableElements["subtopics"][topic][subtopic].style.minWidth=110*scale + "px";
				this.scalableElements["subtopics"][topic][subtopic].style.paddingRight= 2*scale + "px";
			}
		}
		
		for(var i = 0; i < this.scalableElements["spacer"].length; i++){
			var spacer = this.scalableElements["spacer"][i];
			var space = this.scalableElements["spacersize"][i];
			var spaceSize = space*scale + "px";
			spacer.style.border = "none";
			spacer.style.height=spaceSize;
			spacer.style.maxHeight=spaceSize;
			spacer.style.minHeight=spaceSize;	
		}
	};
}

