function URLGeneratorClass(){
	
	this.enterWebsite = function(place){
		if(!searchBounds.contains(place.geometry.location)){
			MainControl.showMessage("'" + place.formatted_address + "' " + label("search_outside_boundary"));
			return;
		}
		window.location.href = window.location.origin + window.location.pathname + "?lang=" + Labels.currentLang + "&placeID=" + place.place_id;
	};
	
	this.enterWebsiteCoords = function(lat, lng){
		this.enterWebsiteNamedCoords("Coords (" + lat + ", " + lng + ")", lat,lng);
	};
	
	this.enterWebsiteNamedCoords = function(name, lat, lng){
		var coords = new google.maps.LatLng(lat, lng);
	    if(!searchBounds.contains(coords)){
			MainControl.showMessage(label("search_coordinate") + " (" + lat + ", " + lng + ") " + label("search_coord_outside"));
			return;
		}
		var locs = {};
		locs[name] = [lat,lng];
		window.location.href = window.location.origin + window.location.pathname + "?lang=" + Labels.currentLang + "&locations=" + URLCoder.encodeBase64(locs);
	};
	
	this.searchCurrentLocation = function(){
		if(navigator.geolocation){
			navigator.geolocation.getCurrentPosition(function(position){
				console.log(position);
				
				latlng = {lat: position.coords.latitude, lng: position.coords.longitude};
				
				geocoder.geocode({'location': latlng}, function(latlng, results, status) {
					console.log(latlng);
			          	if (status === 'OK') {
			          		for(var i = 0; i < results.length; i++){
			          			if(results[i].types.includes("locality")){
			        				this.enterWebsiteNamedCoords(results[i].formatted_address, latlng.lat, latlng.lng);
			        				return;
			        			}
			          		}
			          		this.enterWebsiteNamedCoords(results[0].formatted_address, latlng.lat, latlng.lng);
			          	} else {
			          		this.enterWebsiteCoords(latlng.lat, latlng.lng);
			          	}
			        }.bind(this, latlng));
			}.bind(this));
		}
	};
	
	this.search = function(){
		var searchInput = document.getElementById("search_input");
		searchInput.blur();
		
		var place = autocomplete.getPlace();
		
		console.log(place);
		
				
		if(!place.geometry){
			
			if(place.name.match(/^[+-]?\d+\.\d+, ?[+-]?\d+\.\d+$/)){
			    var latlng = place.name.split(/, ?/);
			    this.enterWebsiteCoords(parseFloat(latlng[0]), parseFloat(latlng[1]));
			} else {
				geocoder.geocode({address:place.name, bounds:searchBounds},function(place,results,status){
					if(status === 'OK'){
					    this.enterWebsite(results[0]);
					} else {
						MainControl.showMessage("'" + place.name + "' " + label("search_not_found"));
					}
				}.bind(this, place));
			}
			return;
		}
		
		
		this.enterWebsite(place);
		
		
	};
	
}
var URLGenerator = new URLGeneratorClass();