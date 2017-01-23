function URLGeneratorClass(){
	
	this.search = function(inputString){
		console.log("search!");
		var searchInput = document.getElementById("search_input");
		searchInput.blur();
		var popup = MainControl.showPopup();
		
		popup.innerHTML = searchInput.value;
		popup.style.fontSize="200px";
	};
	
}
var URLGenerator = new URLGeneratorClass();