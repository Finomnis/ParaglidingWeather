var alpsPolygon;

var initializeAlpsPolygon = function(){
	alpsPolygon = new google.maps.Polygon({
		paths: [{"lat":48.15875730456923,"lng":11.063232421875},{"lat":48.45835188280866,"lng":16.67724609375},{"lat":46.73233101286786,"lng":16.50146484375},{"lat":45.66780526567164,"lng":13.458251953125},{"lat":44.707706221835345,"lng":10.6787109375},{"lat":44.91813929958515,"lng":9.173583984375},{"lat":43.34914966389312,"lng":8.4375},{"lat":43.16512263158295,"lng":5.592041015625},{"lat":45.01141864227728,"lng":4.207763671875},{"lat":47.092565552235705,"lng":5.625},{"lat":48.04136507445029,"lng":8.426513671875}]
	});
};


function ForecastTable(coords, name){
	
	this.inAlps = false;
	if(google.maps.geometry.poly.containsLocation(new google.maps.LatLng(coords.lat,coords.lon), alpsPolygon)){
		this.inAlps = true;
	}
		
	this.time_points = timePoints;
	this.windMapMaxHeight = 4050;
	this.cloudMapMaxHeight = 5050;
	
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
										  }, 16, 3, scale);
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
										  16, 3, scale
			);
	};
	
	this.constructRow = function(type, colmap, data, scale){
		return ForecastDrawer.drawColorLine(data, type, Color.get.bind(Color,colmap), 16, 16, scale);
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
				"BL Top":this.constructRow.bind(this,"pblh", "PAL_CBASE"),
				"BL Vertical Motion":this.constructRow.bind(this,"wblmaxmin", "PAL_CONVERGENCE"),
			}
	};
	
	
	this.constructFoehnRow = function(data, scale){
		return ForecastDrawer.drawColorArrowLine(data, "ufoehn", "vfoehn",
				function(val){
					return Color.get("PAL_WIND",val*2.3125);
				},
				16, 16, scale);
	};
	
	if(this.inAlps){
		this.tableElements["Wind"]['<a href="http://www.meteocentrale.ch/de/wetter/foehn-und-bise/foehn.html">F&ouml;hn</href>'] = this.constructFoehnRow.bind(this);
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
			this.clearElement(this.heightEntry).innerHTML = "Height: " + Math.round(this.groundHeight) + "m";
		}
		
		// Set maps link
		if(this.coords){
			var mapsLink = document.createElement("a");
			mapsLink.innerHTML="Map";
			mapsLink.target="_blank";
			mapsLink.href="http://www.google.com/maps/place/" + this.coords.lat + "," + this.coords.lon;
			this.clearElement(this.mapsLink).appendChild(mapsLink);
		}
	};
	
	this.loadAsync = function(days, scale){
		// clear caches
		this.data = {};
		this.canvases = {};
		for(day in days){
			// Send one async load for every day required
			WeatherData.fetchData(coords, day, this.time_points, ["z", "umet", "vmet", "cldfra", "raintot", "wstar", "bsratio", "pblh", "ter", "blwindshear", "wblmaxmin"],
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
				td.innerHTML="Loading...";
				td.colSpan=2;
				td.style.border = "none";
				tr.appendChild(td);
				this.mapsLink=td;
			}
			this.scalableElements["dates"] = [];
			for(date in datesToLoad){
				var th = document.createElement("TH");
				th.style.border = "none";
				var weekDays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
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
				td.innerHTML="Loading...";
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
				headerDiv.innerHTML=topic;
				
				
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

