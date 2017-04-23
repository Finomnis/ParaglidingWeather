function LabelsClass(){
	
	this.urlObject = new urlObject();
	
	this.strippedURL = window.location.origin+window.location.pathname + "?";
	for(parameter in this.urlObject.parameters){
		if(parameter === "lang") continue;
		this.strippedURL = this.strippedURL + parameter + "=" + this.urlObject.parameters[parameter] + "&";
	}
	
	this.currentLang = "de";
	if(this.urlObject.parameters.lang){
		this.currentLang = this.urlObject.parameters.lang;
	};
	
	this.dict = {
		"en": {
			"page_header": "Paragliding Weather Forecast",
			"disclaimer": "No responsibility is accepted for<br>the accuracy of this information.",
			"search_label": "Search...",
			"parapente_ref": 'powered by <a href="https://meteo-parapente.com/">M&eacutet&eacuteo Parapente</a>',
			"colortables_header": "Colortables",
			"colortables_wind": "Wind",
			"colortables_thermal_vel": "Thermal Velocity",
			"colortables_b_s_ratio": "B/S Ratio",
			"colortables_bl_top": "BL Top",
			"colortables_bl_vmotion": "BL Vertical Motion",
			"colortables_foehn": "F&ouml;hn",
			"placeid_err": "Given placeID is invalid!",
			"colortables_no_unit": "no Unit",
			"colortables_unit": "Unit",
			"sunday": "Sunday",
			"monday": "Monday",
			"tuesday": "Tuesday",
			"wednesday": "Wednesday",
			"thursday": "Thursday",
			"friday": "Friday",
			"saturday": "Saturday",
			"map": "Map",
			"height": "Height",
			"loading": "Loading...",
			"weather": "Weather",
			"wind": "Wind",
			"thermals": "Thermals",
			"table_clouds": "Clouds",
			"table_rain": "Rain",
			"table_heightdist": "Height Distribution",
			"table_2000gnd": "2000 GND",
			"table_1000gnd": "1000 GND",
			"table_surface": "Surface",
			"table_windshear": "BL Wind Shear",
			"table_therm_vel": "Velocity",
			"table_therm_bsratio": "B/S Ratio",
			"table_therm_bltop": "BL Top",
			"table_therm_blvmot": "BL Vertical Motion",
			"table_foehn_at": '<a target="_blank" href="http://www.wetteralarm.at/de/wetter/foehndiagramme/foehn-in-den-alpen.html">F&ouml;hn</href>',
			"table_foehn_ch": '<a target="_blank" href="http://www.meteocentrale.ch/de/wetter/foehn-und-bise/foehn.html">F&ouml;hn</href>',
			"change_language": '<a href="' + this.strippedURL + 'lang=de">Deutsch</a>'
		},
		"de": {
			"page_header": "Gleitschirm Wetterbericht",
			"disclaimer": "Es wird keinerlei Verantwortung f&uumlr die<br>Korrektheit dieser Daten &uumlbernommen.",
			"search_label": "Suche...",
			"parapente_ref": 'basierend auf <a href="https://meteo-parapente.com/">M&eacutet&eacuteo Parapente</a>',
			"colortables_header": "Legende",
			"colortables_wind": "Wind",
			"colortables_thermal_vel": "Thermik Geschw.",
			"colortables_b_s_ratio": "Thermik Qualit&aumlt",
			"colortables_bl_top": "Basis",
			"colortables_bl_vmotion": "Aufwind",
			"colortables_foehn": "F&ouml;hn",
			"placeid_err": "placeID is ungültig!",
			"colortables_no_unit": "keine Einheit",
			"colortables_unit": "Einheit",
			"sunday": "Sonntag",
			"monday": "Montag",
			"tuesday": "Dienstag",
			"wednesday": "Mittwoch",
			"thursday": "Donnerstag",
			"friday": "Freitag",
			"saturday": "Samstag",
			"map": "Karte",
			"height": "H&oumlhe",
			"loading": "Lade...",
			"weather": "Wetter",
			"wind": "Wind",
			"thermals": "Thermik",
			"table_clouds": "Bew&oumllkung",
			"table_rain": "Niederschlag",
			"table_heightdist": "H&oumlhenverteilung",
			"table_2000gnd": "2000 GND",
			"table_1000gnd": "1000 GND",
			"table_surface": "Boden",
			"table_windshear": "Basis Scherung",
			"table_therm_vel": "Geschwindigkeit",
			"table_therm_bsratio": "Qualit&aumlt",
			"table_therm_bltop": "Basis (&uumlber GND)",
			"table_therm_blvmot": "Aufwind",
			"table_foehn_at": '<a target="_blank" href="http://www.wetteralarm.at/de/wetter/foehndiagramme/foehn-in-den-alpen.html">F&ouml;hn</href>',
			"table_foehn_ch": '<a target="_blank" href="http://www.meteocentrale.ch/de/wetter/foehn-und-bise/foehn.html">F&ouml;hn</href>',
			"change_language": '<a href="' + this.strippedURL + 'lang=en">English</a>'
		}
	};
	
	this.get = function(labelID){
		if(!(this.currentLang in this.dict)){
			return "[LANG_UNSUPPORTED]";
		}
		if(!(labelID in this.dict[this.currentLang])){
			return "[UNDEFINED]";
		}
		return this.dict[this.currentLang][labelID];
	};
	
};

var Labels = new LabelsClass();

function label(labelID){
	return Labels.get(labelID);
};