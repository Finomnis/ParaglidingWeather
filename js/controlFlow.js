function ControlFlowEvent(numInputs){
	
	this.numNotFinished = numInputs;
	this.children = [];
	
	this.runAfter = function(callback){
		if(numNotFinished == 0){
			callback();
		} else {
			children.push(callback);
		}
	};
	
	
	this.wakeupAllChildren = function(){
		for(var i = 0; i < children.length; i++){
			children[i]();
		}
	};
	
	this.getCallback = function(){
		return function(){
			this.numNotFinished--;
			if(this.numNotFinished == 0){
				this.wakeupAllChildren();
			}
		}.bind(this);
	};
	
	
}