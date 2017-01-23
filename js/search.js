function URLGeneratorClass(){
	
	this.isValidCoordinates = function(place){
		var lat = place.geometry.location.lat();
		if(lat >= 41.43 && lat <= 51.4){
			var lon = place.geometry.location.lng();
			if(lon >= -4.96 && lon <= 15.72){
				return true;
			}
		}
		return false;
		//new google.maps.LatLng( 41.43, -4.96), //sw
        //new google.maps.LatLng( 51.4, 15.72 ) //ne
		//return false;
	};
	
	this.enterWebsite = function(place){
		if(!this.isValidCoordinates(place)){
			MainControl.showMessage("'" + place.formatted_address + "' is outside of the data boundary!");
			return;
		}
		var location = place.geometry.location;
		var places = {};
		places[place.formatted_address] = [location.lat(), location.lng()];
		var locationJSON = URLCoder.encodeBase64(places);
		window.location.href = window.location.origin + window.location.pathname + "?locations=" + locationJSON;
	};
	
	this.search = function(){
		var searchInput = document.getElementById("search_input");
		searchInput.blur();
		
		var place = autocomplete.getPlace();
		
		console.log(place);
		
				
		if(!place.geometry){
			geocoder.geocode({address:place.name, bounds:searchBounds},function(place,results,status){
				if(status === 'OK'){
					console.log("Geocoder found:");
					this.enterWebsite(results[0]);
				} else {
					MainControl.showMessage("'" + place.name + "' not found!");
				}
			}.bind(this, place));
			return;
		}
		
		
		this.enterWebsite(place);
		
		
	};
	
}
var URLGenerator = new URLGeneratorClass();