function ForecastDrawerClass(){
	
	this.mapPixelSize=3;
	this.columnWidth=16;
	
	this.drawDataMap = function(times, numHeights, getDataCallback, getColorCallback){
	
		console.log(times.length);
		console.log(numHeights);
		
		var numTimes = times.length;
		
		var canvas = document.createElement("canvas");
		canvas.width = numTimes*this.columnWidth;
		canvas.height = numHeights * this.mapPixelSize;
		canvas.style.border = "none";
		var ctx = canvas.getContext("2d");
		
		for(var i = 0; i < times.length; i++){
			for(var height = 0; height < numHeights; height++){
				var data = getDataCallback(times[i], height);
				var col = getColorCallback(data);
				ctx.fillStyle = "rgb("+Math.round(col[0])+","+Math.round(col[1])+","+Math.round(col[2])+")";
				ctx.fillRect(i*this.columnWidth,this.mapPixelSize*(numHeights-(height+1)),this.columnWidth,this.mapPixelSize);
			}
		}	
		return canvas;
	};
}

var ForecastDrawer = new ForecastDrawerClass();