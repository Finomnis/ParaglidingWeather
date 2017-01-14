function ForecastDrawerClass(){
	
	this.mapPixelSize = 3;
	this.columnWidth  = 16;
	this.rowHeight    = 16;
	
	this.getNumEntries = function(data, targetHeight){
		var heights = data[12].z;
		var id;
		for(id = 0; id < heights.length; id++){
			if(heights[id] > targetHeight){
				break;
			}
		}
		return id;
	};
	
	this.drawDataMap = function(data, maxHeight, getDataCallback, getColorCallback){
	
		console.log(data);
		console.log(maxHeight);
		
		var numHeights = this.getNumEntries(data, maxHeight);
		
		var numTimes = Object.keys(data).length;
		
		var canvas = document.createElement("canvas");
		canvas.width = numTimes*this.columnWidth;
		canvas.height = numHeights * this.mapPixelSize;
		canvas.style.border = "none";
		var ctx = canvas.getContext("2d");
		
		for(var i = 0; i < numTimes; i++){
			for(var height = 0; height < numHeights; height++){
				var val = getDataCallback(data, Object.keys(data)[i], height);
				var col = getColorCallback(val);
				ctx.fillStyle = "rgb("+Math.round(col[0])+","+Math.round(col[1])+","+Math.round(col[2])+")";
				ctx.fillRect(i*this.columnWidth,this.mapPixelSize*(numHeights-(height+1)),this.columnWidth,this.mapPixelSize);
			}
		}	
		return canvas;
	};
	
	this.drawColorLine = function(data, type, getColorCallback){
		
		var numTimes = Object.keys(data).length;
		
		var canvas = document.createElement("canvas");
		canvas.width = numTimes*this.columnWidth;
		canvas.height = this.rowHeight;
		canvas.style.border = "none";
		var ctx = canvas.getContext("2d");
		
		for(var i = 0; i < numTimes; i++){
			var val = data[Object.keys(data)[i]][type];
			var col = getColorCallback(val);
			ctx.fillStyle = "rgb("+Math.round(col[0])+","+Math.round(col[1])+","+Math.round(col[2])+")";
			ctx.fillRect(i*this.columnWidth,0,this.columnWidth,this.rowHeight);
		}	
		return canvas;
	};
}

var ForecastDrawer = new ForecastDrawerClass();