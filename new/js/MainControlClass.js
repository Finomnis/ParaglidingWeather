function MainControlClass(){
	
	// Internal functions
	this.keyDownHandler = $.proxy(function(e){
		if(e.code === "Escape" || e.code === "Enter"){
			this.hidePopup();
		}
	},this);

	this.enableKeyDownHandler = function(){
		document.addEventListener('keydown', this.keyDownHandler, false);
		
	};
	this.disableKeyDownHandler = function(){
		document.removeEventListener('keydown', $.proxy(this.keyDownHandler,this), false);
	};
	
	// External functions
	this.disablePage = function(){
		var disabler = document.getElementById("fullscreenDisabler");
		disabler.style.display="block";
	};
	
	this.enablePage = function(){
		var disabler = document.getElementById("fullscreenDisabler");
		disabler.style.display="none";
	};
	
	this.showMessage = function(message){
		var popup = this.showPopup();
		popup.innerHTML = message;
		popup.style.fontSize="30px";
	};
	
	this.errorThrown = false;
	this.showError = function(message){
		if(this.errorThrown == false){
			this.errorThrown = true;
			alert(message);
		}
	};
	this.getAjaxErrorHandler = function(url){
		return function(url, jqHXR, textStatus, errorThrown){
			this.showError("Status " + jqHXR.status  + ": " + textStatus + "\nwhile loading " + url);
		}.bind(this, url);
	};
	
	this.showPopup = function(){
		this.disablePage();
		this.enableKeyDownHandler();
		var popup = document.getElementById("popupWindow");
		popup.style.display="block";
		while (popup.firstChild) {
			popup.removeChild(popup.firstChild);
		}
		return popup;
	};
	
	this.hidePopup = function(){
		this.enablePage();
		this.disableKeyDownHandler();
		var popup = document.getElementById("popupWindow");
		popup.style.display="none";
	};

	
}
var MainControl = new MainControlClass();
