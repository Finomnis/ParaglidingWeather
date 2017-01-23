function ControlFlowEvent(numInputs){
	
	this.numNotFinished = numInputs;
	this.children = [];
	
	this.then = function(callback){
		if(numNotFinished == 0){
			callback();
		} else {
			children.push(callback);
		}
	};
	
	this.parentDone = function(){
		this.numNotFinished--;
		if(this.numNotFinished < 0){
			console.warn("ControlFlowEvent numNotFinished < 0");
		}
		if(this.numNotFinished == 0){
			for(var i = 0; i < children.length; i++){
				children[i]();
			}
		}
	};
	
	this.getCallback = function(){
		return this.parentDone.bind(this);
	};
	
	
}