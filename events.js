function EventsClass(){
	this.googleMapsLoaded = new ControlFlowEvent(1);
	this.baseDataLoaded = new ControlFlowEvent(2); // init, google maps
	this.foehnLoaded = new ControlFlowEvent(1);
}

var Events = new EventsClass();