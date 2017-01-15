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
	
	this.drawTimes = function(times){
		var canvas = document.createElement("canvas");
		canvas.width = times.length*this.columnWidth;
		canvas.height = this.rowHeight;
		canvas.style.border = "none";
		var ctx = canvas.getContext("2d");
		ctx.fillStyle = "rgb(255,0,255)";
		ctx.fillRect(0,0,times.length*this.columnWidth,this.rowHeight);
		return canvas;
	};
	
	this.getInterpolatedHeightIndices = function(z, height){
		var result = [];
		result[0] = [0,1];
		result[1] = [0,0];
		if(z[0] > height)
			return result;
		if(z[z.length-1] < height){
			result[0] = [z.length-1,1];
			return result;
		}
		
		var i;
		for(i = 0; i < z.length; i++){
			if(z[i] > height) break;
		}
		console.log(i);
		var dist = z[i] - z[i-1];
		var weight0 = (z[i]-height)/dist;
		var weight1 = (height-z[i-1])/dist;
		
		result[0] = [i-1, weight0];
		result[1] = [i, weight1];
		return result;
	};
	
	this.getInterpolatedValue = function(indices, data){
		var val0 = data[indices[0][0]];
		var val1 = data[indices[1][0]];
		return val0 * indices[0][1] + val1 * indices[1][1];
	};
	
	this.drawArrow = function(ctx, dirX, dirY, posX, posY, width, height){
		dirY = - dirY;
		
		var lineLength = 0.35*Math.min(width,height);
		var centerX = posX + width/2;
		var centerY = posY + height/2;
		ctx.lineWidth = 1;
		ctx.strokeStyle = "#000000";
		ctx.fillStyle = "#000000";
		ctx.beginPath();
		ctx.moveTo(centerX-dirX*lineLength, centerY-dirY*lineLength);
		ctx.lineTo(centerX+dirX*lineLength, centerY+dirY*lineLength);
		ctx.stroke();
		
		var arrowBaseX = centerX+dirX*lineLength/8;
		var arrowBaseY = centerY+dirY*lineLength/8;
		var arrowBaseLength = lineLength/2.5;
		
		ctx.beginPath();
		ctx.moveTo(arrowBaseX, arrowBaseY);
		ctx.lineTo(arrowBaseX + arrowBaseLength*dirY, arrowBaseY - arrowBaseLength*dirX);
		ctx.lineTo(centerX+dirX*lineLength, centerY+dirY*lineLength);
		ctx.lineTo(arrowBaseX - arrowBaseLength*dirY, arrowBaseY + arrowBaseLength*dirX);
		ctx.fill();
	};
	
	this.drawColorArrowHeightLine = function(data, typeX, typeY, height, getColorCallback){
		
		var numTimes = Object.keys(data).length;
		
		var canvas = document.createElement("canvas");
		canvas.width = numTimes*this.columnWidth;
		canvas.height = this.rowHeight;
		canvas.style.border = "none";
		var ctx = canvas.getContext("2d");
		console.log(data);
		for(var i = 0; i < numTimes; i++){
			var currentData = data[Object.keys(data)[i]];
			var heightIndices = this.getInterpolatedHeightIndices(currentData["z"], height);
			console.log(heightIndices);
			var valX = this.getInterpolatedValue(heightIndices, currentData[typeX]);
			var valY = this.getInterpolatedValue(heightIndices, currentData[typeY]);
			console.log(valX,valY);
			var val = Math.sqrt(valX*valX+valY*valY);
			var dirX = valX/val;
			var dirY = valY/val;
			var col = getColorCallback(val);
			ctx.fillStyle = "rgb("+Math.round(col[0])+","+Math.round(col[1])+","+Math.round(col[2])+")";
			ctx.fillRect(i*this.columnWidth,0,this.columnWidth,this.rowHeight);
			this.drawArrow(ctx, dirX, dirY, i*this.columnWidth, 0, this.columnWidth, this.rowHeight);
		}	
		return canvas;
	};
	
	this.drawAllPallettes = function(width, height){
		var div = document.createElement("div");
		var table = document.createElement("table");
		
		for(palette in Palettes){
			var tr = document.createElement("tr");
			tr.style.border="1px solid black";
			{
				var td = document.createElement("td");
				td.style.border="1px solid black";
				td.style.padding="0px";
				td.innerHTML=palette;
				tr.appendChild(td);
			}
			{
				var canvas = document.createElement("canvas");
				canvas.width = width;
				canvas.height = height;
				canvas.style.border = "none";
				var ctx = canvas.getContext("2d");
				
				ctx.fillStyle = "red";
				
				var pal = Palettes[palette];
				
				var val0 = pal[0][0];
				var val1 = pal[pal.length-1][0];
				
				for(var i = 0; i < width; i++){
					var weight1 = i/(width-1);
					var weight0 = 1-weight1;
					var val = val0*weight0+val1*weight1;
					var col = Color.get(palette, val);
					ctx.fillStyle = "rgb("+Math.round(col[0])+","+Math.round(col[1])+","+Math.round(col[2])+")";
					ctx.fillRect(i,0,1,height);
				}
				var td = document.createElement("td");
				td.style.border="1px solid black";
				td.style.padding="0px";
				td.appendChild(canvas);
				tr.appendChild(td);
			}
			table.appendChild(tr);
		}

		table.style.border="2px solid black";
		div.appendChild(table);
		return div;
	};
}

var ForecastDrawer = new ForecastDrawerClass();