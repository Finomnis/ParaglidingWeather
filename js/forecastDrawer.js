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
		console.log("Maxheight: " + maxHeight);
		
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