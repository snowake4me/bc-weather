/*  Application Name: app.js
 *  Purpose: Server Side Vanguard Trailhead Weather Application
 */

//Variable Declarations
var express = require('express');
var request = require('request');
var cfenv = require('cfenv');

var app = express();
var appEnv = cfenv.getAppEnv();
app.use(express.static(__dirname + '/public'));

//Set Local Timezone
process.env.TZ = 'America/Los_Angeles';

//API Information
var weather_host = "http://api.wunderground.com/api/"; //Weather API host
var apiKey = process.env.WUAPI //Wunderground API Key (Environment Variable)

/*  Function: weatherAPI
 *  Inputs: path: (Wunderground API path) (See WUnderground API Documentation)
 * 	Returns: JSON data from API call or Error data from failed API call
 *  Notes: None 
 */
function weatherAPI(path, done) {
	
	//Build Full WUnderground URL API call
    var url = weather_host + apiKey + path;
    
    console.log(url);
    
    //Make API Call
    request({
        url: url,
        method: "GET",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
            "Accept": "application/json"
        }
    }, function(err, req, data) {
        if (err) {
            done(err);
        } else {
            if (req.statusCode >= 200 && req.statusCode < 400) {
                try {
                    done(null, JSON.parse(data));
                } catch(e) {
                    console.log(e);
                    done(e);
                }
            } else {
                console.log(err);
                done({ message: req.statusCode, data: data });
            }
        }
    });
}

/*  Monitor for requests on /api/weather
 *	Called by client script pgLoadDefault.js
 *  Prepares API call to WeatherUnderground
 *  Error handling/JSON return to client	
 */
app.get('/api/weather', function(req, res) {
	
	//Calculate Yesterdays Date (for historical hourly data)
	var yesterdayDate = new Date(new Date() - (1000*60*60*24));
	var yr = yesterdayDate.getFullYear();
	var mo = yesterdayDate.getMonth() + 1;
	var da = yesterdayDate.getDate();
	
	//Format Date for API Call (add leading zero)
	if(Number(mo) < 10) mo = "0" + mo;
	if(Number(da) < 10) da = "0" + da;
	console.log("Calculated Yesterday Date:" + mo + "/" + da + "/" + yr);
	console.log("Making Call...");
	
		//Build PATH and make API Call. See WUnderground API Documentation
    	weatherAPI("/conditions/forecast10day/history_" + yr + mo + da + "/q/94105.json"
    	, function(err, result) {
        if (err) {
        	console.log(err);
            res.send(err).status(400);
        } else {
        	console.log("WUnderground API Call Success");
            res.json(result);
        }
    });
});

// Application monitoring server
app.listen(appEnv.port, appEnv.bind, function() {
  console.log("server starting on " + appEnv.url);
});
