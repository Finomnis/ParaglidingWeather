

$(document).ready(function(){
	var forecastTable = new ForecastTable();
	var contentRoot = document.getElementById("forecastTables");
	console.log(forecastTable);
	contentRoot.appendChild(forecastTable.svg);
});