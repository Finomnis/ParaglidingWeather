function URLGeneratorClass(){
	
	this.enterWebsite = function(place){
		if(!searchBounds.contains(place.geometry.location)){
			MainControl.showMessage("'" + place.formatted_address + "' is outside of the data boundary!");
			return;
		}
		window.location.href = window.location.origin + window.location.pathname + "?placeID=" + place.place_id;
	};
	
	this.search = function(){
		var searchInput = document.getElementById("search_input");
		searchInput.blur();
		
		var place = autocomplete.getPlace();
		
		console.log(place);
		
				
		if(!place.geometry){
			geocoder.geocode({address:place.name, bounds:searchBounds},function(place,results,status){
				if(status === 'OK'){
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