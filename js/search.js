function URLGeneratorClass(){
	
	this.enterWebsite = function(place){
		if(!searchBounds.contains(place.geometry.location)){
			MainControl.showMessage("'" + place.formatted_address + "' " + label("search_outside_boundary"));
			return;
		}
		window.location.href = window.location.origin + window.location.pathname + "?lang=" + Labels.currentLang + "&placeID=" + place.place_id;
	};
	
	this.enterWebsiteCoords = function(lat, lng){
		var coords = new google.maps.LatLng(lat, lng);
	    if(!searchBounds.contains(coords)){
			MainControl.showMessage(label("search_coordinate") + " (" + lat + ", " + lng + ") " + label("search_coord_outside"));
			return;
		}
		var locs = {};
		locs["Coords (" + lat + ", " + lng + ")"] = [lat,lng];
		window.location.href = window.location.origin + window.location.pathname + "?lang=" + Labels.currentLang + "&locations=" + URLCoder.encodeBase64(locs);
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