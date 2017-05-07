function WeatherDataClass(){

	this.runDays = {};
	this.today = "";
	this.domain = "";
	this.timezoneOffset = 0;
	this.dataValid = false;
	
	this.fetchData = function(coords, day, hours, params, callback){
		var runDay = this.runDays[day];
		var coords_str = coords.lat + "," + coords.lon;
		$.ajax({
			url: "https://data0.meteo-parapente.com/json.php",
			dataType: "jsonp",
			data: {
				domain: this.domain,
				run: runDay,
				places : coords_str,
				dates : day,
				heures : hours.join(";"),
				params : params.join(";")				
			},
			success: function(day,data){
				this.foehnDataFetched[day].then(function(day,data){
					var cdata = data[coords_str];
					//console.log(cdata);
					for(var i in cdata[day]){
						cdata[day][i]["ufoehnch"] = 0;
						cdata[day][i]["vfoehnch"] = this.foehnDataSwiss[day][i];
						cdata[day][i]["ufoehnat"] = 0;
						cdata[day][i]["vfoehnat"] = this.foehnDataAustria[day][i];
					}
					callback(cdata);
				}.bind(this,day,data));
			}.bind(this,day)
		});
	};
	
	
	this.foehnDataSwiss = {};
	this.foehnDataAustria = {};
	this.foehnDataFetched = {};
	this.foehnPosZuerich="47.380688,8.529504";
	this.foehnPosLugano="46.004534,8.951523";
	this.foehnPosBozen="46.49926,11.35661";
	this.foehnPosInnsbruck="47.267222,11.392778";
	
	this.startFoehnFetching = function(){
		this.foehnData = {};
		this.foehnDataFetched = {};
		for(var day in this.runDays){
			this.foehnDataFetched[day] = new ControlFlowEvent(1);
			this.fetchFoehn(day, timePoints, function(day, data){
				var foehnStrengthsSwiss = {};
				var foehnStrengthsAustria = {};
				var foehnDataZuerich = data[this.foehnPosZuerich][day];
				var foehnDataLugano = data[this.foehnPosLugano][day];
				var foehnDataBozen = data[this.foehnPosBozen][day];
				var foehnDataInnsbruck = data[this.foehnPosInnsbruck][day];
				//console.log(data);
				//console.log(foehnDataZuerich);
				//console.log(foehnDataLugano);
				
				for(var time in foehnDataZuerich){
					foehnStrengthsSwiss[time] = foehnDataLugano[time]["slp"]  - foehnDataZuerich[time]["slp"];
					foehnStrengthsAustria[time] = foehnDataBozen[time]["slp"]  - foehnDataInnsbruck[time]["slp"];
				}
				
				this.foehnDataSwiss[day] = foehnStrengthsSwiss;
				this.foehnDataAustria[day] = foehnStrengthsAustria;
				
				this.foehnDataFetched[day].parentDone();
			}.bind(this,day));
		}
	};
	
	this.fetchFoehn = function(day, hours, callback){
		var runDay= this.runDays[day];
		var coords_str = this.foehnPosZuerich + ";" + this.foehnPosLugano + ";" + this.foehnPosBozen + ";" + this.foehnPosInnsbruck;
		$.ajax({
			url: "https://data0.meteo-parapente.com/json.php",
			dataType: "jsonp",
			data: {
				domain: this.domain,
				run: runDay,
				places : coords_str,
				dates : day,
				heures : hours.join(";"),
				params : "slp"				
			},
			success: function(callback,data){
				callback(data);
			}.bind(this,callback)
		});
	};
	
	this.refreshAll = function(redrawCallback){
		$.ajax({
			url: "https://data0.meteo-parapente.com/status.php",
			dataType: "jsonp",
			success: $.proxy(function(redrawCallback,data){
				this.runDays = {};
				this.domain = Object.keys(data)[0];
				//console.log(data);
				data = data[this.domain];
				var i;
				var today = new Date();
				this.timezoneOffset = -Math.round(today.getTimezoneOffset()/60);
				var getDate = function(today, offset){
					var date =  new Date(today.getTime() + offset * 24 * 60 * 60 * 1000);
					var month = (date.getMonth()+1).toString();
					while(month.length < 2) month = "0"+month;
					var day = date.getDate().toString();
					while(day.length < 2) day = "0"+day;
					return date.getFullYear() + month + day;
				};
				this.today = getDate(today, 0);
				for(i = 0;i<100;i++){
					
					var dateStr = getDate(today, i);
					var found = false;
					var j;
					for(j = 0; j < data.length; j++){
						var d = data[j];
						if(d.day !== dateStr) continue;
						if(d.status !== "complete") continue;
						if(this.runDays[dateStr] !== null){
							if(d.run <= this.runDays[dateStr]){
								continue;
							}
						}
						this.runDays[dateStr] = d.run;
						found = true;
					}
					if(found == false) break;
				}
				// After update, redraw the forecast tables
				//console.log(this.runDays);
				this.dataValid = true;
				this.startFoehnFetching();
				redrawCallback();
			},this,redrawCallback)
		});
		
	};
	
}

var WeatherData = new WeatherDataClass();

