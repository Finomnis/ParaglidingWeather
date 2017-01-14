function ColorClass(){
	this.get = function(colTable, val){
		//console.log(Palettes);
		var palette = Palettes[colTable];
		if(palette[0] > val){
			return [palette[1],palette[2],palette[3]];
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
		if(col_1[0] < val){
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
}

var Color = new ColorClass();
console.log(Palettes);