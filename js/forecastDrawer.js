function ColorClass(){
	this.get = function(colTable, val){
		//console.log(Palettes);
		var palette = Palettes[colTable];
		if(palette[0] >= val){
			return [palette[0][1],palette[0][2],palette[0][3]];
		}
		
		var col_0 = palette[0];
		var col_1 = palette[0];
		
		
		for(var i = 0; i < palette.length; i++){
			col_0 = col_1;
			col_1 = palette[i];
			if(col_1[0] > val){
				break;
			}
		}
		if(col_1[0] <= val){
			return [col_1[1],col_1[2],col_1[3]];
		}
		
		var val_0 = col_0[0];
		var val_1 = col_1[0];
		
		var val_dist = val_1 - val_0;
		
		var weight_1 = (val - val_0) / val_dist;
		var weight_0 = (val_1 - val) / val_dist;
		
		return [
		    Math.round(col_0[1] * weight_0 + col_1[1]*weight_1),
		    Math.round(col_0[2] * weight_0 + col_1[2]*weight_1),
		    Math.round(col_0[3] * weight_0 + col_1[3]*weight_1)
		];
	};
	this.getLinear = function(palette, val){
		//console.log(Palettes);
		if(val <= 0){
			return [palette[0][1],palette[0][2],palette[0][3]];
		}
		if(val >= palette.length - 1){
			var col = palette[palette.length - 1];
			return [col[1],col[2],col[3]];
		}
		
		var i = 0;
		while(val >= i) i++;
		
		var col_0 = palette[i];
		var col_1 = palette[i-1];
		
		
		var val_0 = i-1;
		var val_1 = i;
		
		var val_dist = val_1 - val_0;
		
		var weight_0 = (val - val_0) / val_dist;
		var weight_1 = (val_1 - val) / val_dist;
		
		return [
		    Math.round(col_0[1] * weight_0 + col_1[1]*weight_1),
		    Math.round(col_0[2] * weight_0 + col_1[2]*weight_1),
		    Math.round(col_0[3] * weight_0 + col_1[3]*weight_1)
		];
	};
}

var Color = new ColorClass();


function ForecastDrawerClass(){
	
	this.mapPixelSize = 3;
	this.columnWidth  = 16;
	this.rowHeight    = 16;
	
	this.overscale = 2;
	
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
	
	this.drawDataMap = function(data, maxHeight, getDataCallback, getColorCallback, cellWidth, cellHeight, scale){
	
		var numHeights = this.getNumEntries(data, maxHeight);
		
		var numTimes = Object.keys(data).length;
		
		var canvas = this.createCanvas(numTimes*cellWidth, numHeights*cellHeight, scale);
		
		var paintWidth = cellWidth * this.overscale;
		var paintHeight = cellHeight * this.overscale;
		
		var ctx = canvas.getContext("2d");
		
		for(var i = 0; i < numTimes; i++){
			for(var height = 0; height < numHeights; height++){
				var val = getDataCallback(data, Object.keys(data)[i], height);
				var col = getColorCallback(val);
				ctx.fillStyle = "rgb("+Math.round(col[0])+","+Math.round(col[1])+","+Math.round(col[2])+")";
				ctx.fillRect(i*paintWidth,paintHeight*(numHeights-(height+1)),paintWidth,paintHeight);
			}
		}	
		return canvas;
	};
	
	this.createCanvas = function(width, height, scale){
		var canvas = document.createElement("canvas");
		canvas.width = width*this.overscale;
		canvas.height = height*this.overscale;
		canvas.style.border = "none";
		canvas.style.width=Math.round(width*scale) + "px";
		return canvas;
	};
	
	this.drawColorLine = function(data, type, getColorCallback, cellWidth, cellHeight, scale){
		
		var numTimes = Object.keys(data).length;
		
		var canvas = this.createCanvas(numTimes*cellWidth, cellHeight, scale);
		
		var paintWidth = cellWidth * this.overscale;
		var paintHeight = cellHeight * this.overscale;
		
		var ctx = canvas.getContext("2d");
		
		for(var i = 0; i < numTimes; i++){
			var val = data[Object.keys(data)[i]][type];
			var col = getColorCallback(val);
			ctx.fillStyle = "rgb("+Math.round(col[0])+","+Math.round(col[1])+","+Math.round(col[2])+")";
			ctx.fillRect(i*paintWidth,0,paintWidth,paintHeight);
		}	
		return canvas;
	};
	/*
	this.drawTimes = function(times){
		var canvas = document.createElement("canvas");
		canvas.width = times.length*this.columnWidth;
		canvas.height = this.rowHeight;
		canvas.style.border = "none";
		var ctx = canvas.getContext("2d");
		
		ctx.fillStyle="#000000";
		ctx.textAlign="center";
		ctx.textBaseline="middle"; 
		for(var i = 0; i < times.length; i++){
			ctx.fillText(times[i]+"", (i+0.5)*this.columnWidth, 0.6*this.rowHeight); 
		}
		//ctx.fillStyle = "rgb(255,255,255)";
		//ctx.fillRect(0,0,times.length*this.columnWidth,this.rowHeight);
		return canvas;
	};
	*/
	
	this.createLoader = function(){
		var div = document.createElement("DIV");
		div.className = "loader";
		return div;
	};
	
	this.drawTimes = function(times, offset, scale){
		var div = document.createElement("DIV");
		div.style.textAlign="center";
		div.style.fontSize=scale*9.5 + "px";
		var table = document.createElement("TABLE");
		table.style.border = "none";
		table.style.width=Math.round(16*scale*times.length) + "px";
		
		var tr = document.createElement("TR");
		tr.style.border = "none";
		for(var i = 0; i < times.length; i++){
			var td = document.createElement("TD");
			td.style.border = "none";
			td.style.padding = "0px";
			td.innerHTML = (times[i] + offset);
			tr.appendChild(td);
		}
		table.appendChild(tr);
		div.appendChild(table);
		return div;
	};
	

	
	this.createTransformedText = function(text, trans, paddingLeft){
		var div = document.createElement("div");
		div.style.width="100%";
		div.style.height="100%";
		div.style.top="0";
		div.style.bottom="0";
		div.style.right="0";
		div.style.left="0";
		//div.style.backgroundColor="blue";
		div.style.textAlign="left";
		div.style.position="absolute";
		div.style.display="table";
		
		var span = document.createElement("span");
		span.style.verticalAlign="middle";
		//span.style.backgroundColor="purple";
		span.style.paddingLeft=paddingLeft;
		span.style.display="table-cell";
		span.style.transform = trans;
		span.innerHTML=text;
		div.appendChild(span);
		return div;
	};
	
	
	this.drawColorTable = function(colorPalette, prefactor, div){
	
		
		while (div.firstChild) {
			div.removeChild(div.firstChild);
		}
		
		var clientRect = div.getBoundingClientRect();
		
		var canvas = document.createElement("canvas");
		var canvas_width = Math.round(clientRect.width);
		var canvas_height = Math.round(clientRect.height);
		var inner_height = Math.round(canvas_height * 86/90);
		var inner_offset = Math.round(canvas_height * 2/90);
		canvas.width = canvas_width;
		canvas.height = canvas_height;
		var ctx = canvas.getContext("2d");
		
		canvas.style.position="absolute";
		
		var offset_width = canvas_width * 0.15;
		var colors_width = canvas_width * 0.3;
		var lines_width = canvas_width * 0.2;
		var text_offset = canvas_width * 0.05;
		var fontSize = canvas_width * 0.08;
		
		// create colors
		var my_gradient=ctx.createLinearGradient(0,inner_offset,0,inner_offset+inner_height);
		for(var i = 0; i < colorPalette.length; i++){
			var col = colorPalette[i];
			my_gradient.addColorStop(1-i/(colorPalette.length - 1), "rgb(" + Math.round(col[1]) + "," + Math.round(col[2]) + "," + Math.round(col[3])+ ")");
		}
		ctx.fillStyle=my_gradient;
		ctx.fillRect(offset_width,inner_offset,colors_width,inner_height);

		// create lines and numbers
		ctx.fillStyle = "rgb(200,200,200)";
		ctx.strokeStyle = "rgb(200,200,200)";
		ctx.font = fontSize + "px Arial";
		ctx.textAlign="left";
		ctx.textBaseline="middle"; 
		ctx.lineWidth = 0;
		for(var i = 0; i < colorPalette.length; i++){
			var val = Math.round(colorPalette[colorPalette.length - 1 - i][0] * prefactor * 10) / 10;
			ctx.beginPath();
			var pos = Math.round(inner_offset + (inner_height-1)*i/(colorPalette.length-1)) + 0.5;
			ctx.moveTo(offset_width + colors_width, pos);
			ctx.lineTo(offset_width + colors_width + lines_width, pos);
			ctx.stroke();
			ctx.fillText(val,offset_width + colors_width + lines_width + text_offset,pos);
		}
		
		div.appendChild(canvas);
		
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
		
		var lineLength = 0.31*Math.min(width,height);
		var centerX = posX + width/2;
		var centerY = posY + height/2;
		ctx.lineWidth = this.overscale;
		ctx.strokeStyle = "#000000";
		ctx.fillStyle = "#000000";
		ctx.beginPath();
		ctx.moveTo(centerX-dirX*lineLength, centerY-dirY*lineLength);
		ctx.lineTo(centerX+dirX*lineLength, centerY+dirY*lineLength);
		ctx.stroke();
		
		var arrowBaseX = centerX+dirX*lineLength/3.5;
		var arrowBaseY = centerY+dirY*lineLength/3.5;
		var arrowBaseLength = lineLength/3.5;
		
		ctx.beginPath();
		ctx.moveTo(arrowBaseX, arrowBaseY);
		ctx.lineTo(arrowBaseX + arrowBaseLength*dirY, arrowBaseY - arrowBaseLength*dirX);
		ctx.lineTo(centerX+dirX*lineLength, centerY+dirY*lineLength);
		ctx.lineTo(arrowBaseX - arrowBaseLength*dirY, arrowBaseY + arrowBaseLength*dirX);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	};
	
	this.drawColorArrowHeightLine = function(data, typeX, typeY, height, getColorCallback, cellWidth, cellHeight, scale){
		
		var numTimes = Object.keys(data).length;
		
		var canvas = this.createCanvas(numTimes*cellWidth, cellHeight, scale);
		
		var paintWidth = cellWidth * this.overscale;
		var paintHeight = cellHeight * this.overscale;
		
		var ctx = canvas.getContext("2d");
		
		for(var i = 0; i < numTimes; i++){
			var currentData = data[Object.keys(data)[i]];
			var heightIndices = this.getInterpolatedHeightIndices(currentData["z"], height);
			var valX = this.getInterpolatedValue(heightIndices, currentData[typeX]);
			var valY = this.getInterpolatedValue(heightIndices, currentData[typeY]);
			var val = Math.sqrt(valX*valX+valY*valY);
			var dirX = valX/val;
			var dirY = valY/val;
			var col = getColorCallback(val);
			ctx.fillStyle = "rgb("+Math.round(col[0])+","+Math.round(col[1])+","+Math.round(col[2])+")";
			ctx.fillRect(i*paintWidth,0,paintWidth,paintHeight);
			this.drawArrow(ctx, dirX, dirY, i*paintWidth, 0, paintWidth, paintHeight);
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