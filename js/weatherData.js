function WeatherDataClass(){

	this.runDays = {};
	this.today = "";
	this.domain = "";
	
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
			success: function(data){
				callback(data[coords_str]);
			}
		});
	};
		
	this.refreshAll = function(redrawCallback){
		$.ajax({
			url: "https://data0.meteo-parapente.com/status.php",
			dataType: "jsonp",
			success: $.proxy(function(redrawCallback,data){
				this.runDays = {};
				this.domain = Object.keys(data)[0];
				console.log(data);
				data = data[this.domain];
				var i;
				var today = new Date();
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
				redrawCallback();
			},this,redrawCallback)
		});
		
	};
	
}

var WeatherData = new WeatherDataClass();

