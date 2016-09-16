/*	Function Name: pageLoadDefault
 * 	Inputs: None
 * 	Returns: None
 *	Author: Vanguard Architecture
 * 	Description: Javascript code executed client side on page load. 
 * 				 Initiates call to server app to make Wunderground API call.
 *				 Processes and formats returned API JSON data and builds 
 * 				 HTML webpage (index.html).
 */

function pageLoadDefault(){			

	//Calculate date for yesterday
	var yesterdayDate = new Date(new Date() - 86400000);
	
	//Format Yesterday Date (Chart & Graph use)
	var yr = yesterdayDate.getFullYear();
	var mo = yesterdayDate.getMonth() + 1;
	var da = yesterdayDate.getDate();
	if(Number(mo) < 10) mo = "0" + mo;
	if(Number(da) < 10) da = "0" + da;
	
	// Make call to server application for the API JSON data.
	var urlAPI = "/api/weather";

		$.ajax({
		type: 'GET',
		url: urlAPI,
		success: function(data) {		// If API call is successful, build webpage
		
			// Declare Variables
			var labelsForecast = [];	//Graph Labels (Forecast)
			var labelsForecastL = [];	//Chart Lables (Forecast)
			var dataForecast = [];		//Graph & Chart Temp Data (forecast)
			var dataForecastSky = [];	//Chart Sky Conditions (clear, cloudy)(forecast)
			
			var labelsHistorical = [];	//Graph & Chart labels (Historical)
			var dataHistorical = [];	//Graph & Chart Temp Data (Historical)
			var dataHistoricalSky = [];	//Chart Sky Conditions (clear, cloudy)(Historical)
			var dataHistoricalPre = [];	//Chart Pressure Conditions (Historical)
			var dataHistoricalHum = [];	//Chart Humidity Conditions (Historical)
			var dataHistoricalVis = [];	//Chart Visibility Conditions (Historical)
			var m = 24;	//Error Handling Variable (Historical)
			var n = 0;	//Error Handling Variable (Historical)
			
			var foreMax, foreMin; //Max/Min Temp for forecast chart
			var histMax, histMin; //Max/Min Temp for historical chart
			
			var toHTMLForecast;	//Temp Variable to build Forecast chart
			var toHTMLHistorical;	//Temp variable to build Historical chart
			
			//Declare variables for the "Forecast" and "Historical" graphs.
			var ctxForecast = document.getElementById("chartForecast").getContext("2d");
			var ctxHistorical = document.getElementById("chartHistorical").getContext("2d");
			
			//Send "Current Conditions" JSON data to HTML webpage
			document.getElementById("location").innerHTML = data.current_observation.observation_location.full;		//Location
			document.getElementById("temp_f").innerHTML = data.current_observation.temperature_string;				//Current Temperature
			document.getElementById("visibility_mi").innerHTML =data.current_observation.visibility_mi + ' mi';		//Current Visibility
			document.getElementById("pressure_in").innerHTML = data.current_observation.pressure_in + ' inHg';		//Current Atmospheric Pressure
			document.getElementById("observation_time").innerHTML = data.current_observation.observation_time;		//Observation Time
			document.getElementById("relative_humidity").innerHTML = data.current_observation.relative_humidity;	//Current Relative Humidity
			document.getElementById("wind_string").innerHTML = data.current_observation.wind_string;				//Current Wind Conditions
			document.getElementById("src_url").innerHTML = "http://www.wunderground.com/api";						//API Source
			document.getElementById("src_api_ver").innerHTML = data.response.version;								//API Version
			
			/*	Build labels for "Forecast" graph and chart
			 * 	YAXIS: dataForecast: Forecast Temperature Data
			 * 	XAXIS: labelsForecast: X Axis Label (Date) in format MM/DD/YYYY
			 * 
			 *  Chart Title: labelsForecastL: Weekday Name, Month Name, Date
			 *  Chart Sky Conditions: dataForecastSky: Sky Conditions (Clear, Cloudy, etc.)
			 */
			for(var l=0; l<10; l++){
				dataForecast[l] = (data.forecast.simpleforecast.forecastday[l].high.fahrenheit);
				labelsForecast[l] = (data.forecast.simpleforecast.forecastday[l].date.month + "/" + 
									 data.forecast.simpleforecast.forecastday[l].date.day + "/" + 
									 data.forecast.simpleforecast.forecastday[l].date.year);
				labelsForecastL[l] = (data.forecast.simpleforecast.forecastday[l].date.weekday_short + " " + 
									  data.forecast.simpleforecast.forecastday[l].date.monthname_short + " " + 
									  data.forecast.simpleforecast.forecastday[l].date.day);
				dataForecastSky[l] = (data.forecast.simpleforecast.forecastday[l].conditions);
			}
			
			/*	Build labels for Historical" graph and chart
			 * 	YAXIS: dataHistorical: Historical Temperature Data
			 * 	XAXIS: labelsHistorical: X Axis Label (Time) in format HH:MM (military time)
			 * 
			 *  Chart Sky Conditions: dataForecastSky: Sky Conditions (Clear, Cloudy, etc.)
			 *  Chart Pressure Consitions: dataHistoricalPre: Historical (hourly) Pressure Conditions
			 *  Chart Humidity: dataHistoricalHum: Historical (hourly) Humidity Contitions
			 *  Chart Visibility: dataHistoricalVis: Historical Visibility Conditions
			 */
			for(var l=0; n<m; l++){
				//Error handling for multiple historical data reads (from API JSON data) in same hour
				if(l>0){
					if(data.history.observations[n].date.hour == data.history.observations[n-1].date.hour) {
						m++;
						n++;
					}
				}
				
				dataHistorical[l] = (data.history.observations[n].tempi);
				labelsHistorical[l] = (data.history.observations[n].date.hour + ":" + 
									   data.history.observations[n].date.min);
				dataHistoricalSky[l] = (data.history.observations[n].conds);
				dataHistoricalPre[l] = (data.history.observations[n].pressurei) + ' inHg';
				dataHistoricalHum[l] = (data.history.observations[n].hum) + '%';
				dataHistoricalVis[l] = (data.history.observations[n].vism) + ' mi';		
				n++
			}
			
			//Build Forecast and Historical Charts - HTML Tables
			toHTMLForecast = "<table width=100%><tr><th width=10%>Date:</th>";
			for(var l=0; l<10; l++) toHTMLForecast += "<th width=9%>" + labelsForecastL[l] + "</th>";
			toHTMLForecast += "</tr><tr><th width=10%>Tmp:</th>";
			for(var l=0; l<10; l++) toHTMLForecast += "<td width=9%>" + dataForecast[l] + "&#8457;</td>";
			toHTMLForecast += "</tr><tr><th width=10%>Sky:</th>";
			for(var l=0; l<10; l++) toHTMLForecast += "<td width=9%>" + dataForecastSky[l] + "</td>";
			toHTMLForecast += "</tr></table>";
			
			toHTMLHistorical = "Before Noon<br><table width=100%><tr><th width=4%>Time:</th>";
			for(var l=0; l<12; l++) toHTMLHistorical += "<th width=8%>" + labelsHistorical[l] + "</th>";
			toHTMLHistorical += "</tr><tr><th width=4%>Tmp:</th>";
			for(var l=0; l<12; l++) toHTMLHistorical += "<td width=8%>" + dataHistorical[l] + "&#8457;</td>";
			toHTMLHistorical += "</tr><tr><th width=4%>Sky:</th>";
			for(var l=0; l<12; l++) toHTMLHistorical += "<td width=8%>" + dataHistoricalSky[l] + "</td>";
			toHTMLHistorical += "</tr><tr><th width=4%>Pres:</th>";
			for(var l=0; l<12; l++) toHTMLHistorical += "<td width=8%>" + dataHistoricalPre[l] + "</td>";
			toHTMLHistorical += "</tr><tr><th width=4%>Hum:</th>";
			for(var l=0; l<12; l++) toHTMLHistorical += "<td width=8%>" + dataHistoricalHum[l] + "</td>"; 
			toHTMLHistorical += "</tr><tr><th width=4%>Visb:</th>";
			for(var l=0; l<12; l++) toHTMLHistorical += "<td width=8%>" + dataHistoricalVis[l] + "</td>";
			toHTMLHistorical += "</tr></table>";
			
			toHTMLHistorical += "<br>After Noon<br><table width=100%><tr><th width=4%>Time:</th>";
			for(var l=12; l<24; l++) toHTMLHistorical += "<th width=8%>" + labelsHistorical[l] + "</th>";
			toHTMLHistorical += "</tr><tr><th width=4%>Tmp:</th>";
			for(var l=12; l<24; l++) toHTMLHistorical += "<td width=8%>" + dataHistorical[l] + "&#8457;</td>";
			toHTMLHistorical += "</tr><tr><th width=4%>Sky:</th>";
			for(var l=12; l<24; l++) toHTMLHistorical += "<td width=8%>" + dataHistoricalSky[l] + "</td>";
			toHTMLHistorical += "</tr><tr><th width=4%>Pres:</th>";
			for(var l=12; l<24; l++) toHTMLHistorical += "<td width=8%>" + dataHistoricalPre[l] + "</td>";
			toHTMLHistorical += "</tr><tr><th width=4%>Hum:</th>";
			for(var l=12; l<24; l++) toHTMLHistorical += "<td width=8%>" + dataHistoricalHum[l] + "</td>"; 
			toHTMLHistorical += "</tr><tr><th width=4%>Visb:</th>";
			for(var l=12; l<24; l++) toHTMLHistorical += "<td>" + dataHistoricalVis[l] + "</td>";
			toHTMLHistorical += "</tr></table>";
			
			//Send charts to HTML variables
			document.getElementById("dataTableForecast").innerHTML = toHTMLForecast;
			document.getElementById("dataTableHistorical").innerHTML = toHTMLHistorical;
			
			//Calculate Min/Max Forecast Temp (for chart display)
			foreMax = (Math.round(Math.max.apply(Math, dataForecast)/2) * 2) + 2;
			foreMin = (Math.round(Math.min.apply(Math, dataForecast)/2) * 2) - 2;
				
			//Calculate Min/Max Historical Temp (for chart display)
			histMax = (Math.round(Math.max.apply(Math, dataHistorical)/2) * 2) + 2;
			histMin = (Math.round(Math.min.apply(Math, dataHistorical)/2) * 2) - 2;
			
			
			//Build Forecast Chart - See ChartJS library Documentation for information
			ctxForecast.canvas.height = 25;
			var chartForecast = new Chart(ctxForecast , {
				responsive: 'true',
				type: 'line',
				data: { 
					labels: labelsForecast,
					datasets:[{
						label: 'Temperature (F)',
						data: dataForecast
					}]	
				},	
				options: {
					hover: {
						mode: 'label'
					},
					title: {
						display: true,
						text: '10 Day Forecast Conditions'
					},
					scales: {
						yAxes: [{
							ticks: {
								min: foreMin,
								max: foreMax
							}
						}]
					}
				}			
			});

			//Build Historical Chart - See ChartJS library Documentation for information
			ctxHistorical.canvas.height = 25;
			var chartHistorical = new Chart(ctxHistorical , {
				responsive: 'true',
				type: 'line',
				data: { 
					labels: labelsHistorical,
					datasets:[{
						label: 'Temperature (F)',
						data: dataHistorical
					}]	
				},	
				options: {
					hover: {
						mode: 'label'
					},
					title: {
						display: true,
						text: 'Historical Conditions (' + mo + '/' + da + '/' + yr + ' - Hourly)'
					},
					scales: {
						yAxes: [{
							ticks: {
								min: histMin,
								max: histMax
							}
						}]
					}
				}
			});
		}
	})
}		