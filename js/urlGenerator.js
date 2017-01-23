function URLGeneratorClass(){
	
	this.search = function(inputString){
		console.log("search!");
		MainControl.showPopup();
	};
	
}
var URLGenerator = new URLGeneratorClass();