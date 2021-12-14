const quarter = Math.PI / 2;
const half = Math.PI / 2;
const threeQuarter = Math.PI + Math.PI / 2;
const full = Math.PI * 2;

const oneSec = Math.PI / 1800;

const minBrightness = 150;

var middleX = window.innerWidth/2;
var middleY = window.innerHeight/2;
var radius = middleX < middleY ? middleX * 0.8 : middleY * 0.8;
var baseStrokeSize = radius / 25;

// This is a weird color system that seems Hue-specific? 0 is red, so it doesn't seem to map cleanly to RGB or other system I know of
var colorSchedule = new Array();
colorSchedule[2030] = 1;
colorSchedule[2100] = 1000;
colorSchedule[2130] = 6000;
colorSchedule[2200] = 9500;
colorSchedule[2230] = 20000;
colorSchedule[2300] = 34000;
colorSchedule[2330] = 44000;
colorSchedule[0] = 60000;

var clockSchedule = new Array();
clockSchedule[2030] = "#ffffff";
clockSchedule[2100] = "#ea0e2c";
clockSchedule[2130] = "#f3942d";
clockSchedule[2200] = "#f5f100";
clockSchedule[2230] = "#25b911";
clockSchedule[2300] = "#22dae0";
clockSchedule[2330] = "#1c13ec";
clockSchedule[0] = "#ea0ed0";

var lastSection = "20000";

const useHue = true;
const alertEnabled = true;
const hueBridgeIp = "192.168.50.190";

function start() {
	canvas = document.getElementById('canvas');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight; 
	setInterval(draw, 10);
}

function draw() {
	var canvas = document.getElementById("canvas");
	var cx = canvas.getContext("2d");

	cx.clearRect(0, 0, canvas.width, canvas.height);

	cx.beginPath();

	var date = new Date();

	// == HUE ==

	var currentSection = calculateSection();

	if(useHue && lastSection != currentSection) {
		// Regular color update every minute at the :00
		if (currentSection.endsWith("0")) {
			var brightness = calculateIntensity();
			var color = colorSchedule[calculatePeriod()];

			var saturation = 1;
			
			if(color != 1) {
				saturation = 255;
			}

			changeColor(saturation, brightness, color);		
			
			console.log("Color update. Section: " + currentSection + ". Period: " + calculatePeriod() + ". Updated Hue to color #" + color + ", brightness: " + brightness + ", saturation: " + saturation);
		}

		var currentMinute = date.getMinutes();
		console.log("Alert enabled: " + alertEnabled + ", currentSection ends with 3: " + currentSection.endsWith("3") + ", currentMinute :" + currentMinute);

		// Flashing 15s before time
		if(alertEnabled &&
			currentSection.endsWith("3") &&
			(currentMinute == 29 || currentMinute == 59))
		{
			console.log("Flashing because the time is " + date);
			alert();
		}

		console.log("Last section was " + lastSection + ", updating to " + currentSection);
		lastSection = currentSection;
	}


	// == CLOCK ==

	// Clock type
	var type = "halfhour";

	if(type == "minute") {
		var endArcRad = (Math.PI * 2) / 60000 * (date.getSeconds() * 1000 + date.getMilliseconds());
	} else if (type == "halfhour") {
		var minutes = date.getMinutes();
		if(minutes >= 30) minutes -= 30;
		var endArcRad = (Math.PI * 2) / 3600000 * (minutes * 120000 + date.getSeconds()*2000 + date.getMilliseconds()*2);
	} else if (type == "hour") {
		var endArcRad = (Math.PI * 2) / 3600000 * (date.getMinutes() * 60000 + date.getSeconds()*1000 + date.getMilliseconds());
	} else if (type == "evening") {
		var endArcRad = (Math.PI * 2) / 14400000 * ((date.getHours() - 20) * 3600000 +  date.getMinutes() * 60000 + date.getSeconds()*1000 + date.getMilliseconds());		
	}

	// Clock tracing
	cx.beginPath();
	cx.strokeStyle = clockSchedule[calculatePeriod()];
	cx.lineWidth = getStrokeSize();

	if(endArcRad <= quarter) {
		cx.arc(middleX, middleY, radius, threeQuarter, threeQuarter + endArcRad + oneSec);
		cx.stroke();
	} else {
		cx.arc(middleX, middleY, radius, threeQuarter, full);
		cx.stroke();

		var remainingArc = endArcRad - quarter;

		cx.arc(middleX, middleY, radius, 0, remainingArc + oneSec);
		cx.stroke();
	}

	// Log output
	//console.log(
	//	date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "." +  date.getMilliseconds() + "ms. Rad: " + 
//		endArcRad + " - X: " + middleX + ", Y: " + middleY + ", radius: " + radius +
//		 ", width: " + cx.lineWidth + ", color: " + cx.strokeStyle);

	// Mask
	cx.beginPath();
	cx.strokeStyle = "black";

	//Available space at the top of the screen = middleX - (radius + min(linewidth))

	cx.lineWidth = 10000;
	cx.arc(middleX, middleY, radius + (cx.lineWidth/2), 0, full);
	cx.stroke();
}

function getStrokeSize() {
	var date = new Date();
	var currentMinute = date.getMinutes();

	if(currentMinute == 29 || currentMinute == 59) {
		var second = date.getSeconds()/10 + (date.getMilliseconds()/10000);
		var strokeSize = Math.exp(second) * 3;

		return strokeSize < baseStrokeSize ? baseStrokeSize : strokeSize;
	} else {
		return baseStrokeSize;
	}

}

function calculateSection() {
	var date = new Date();

	var quarterMin = Math.floor(date.getSeconds()/15);

	var value = date.getHours().toString() + date.getMinutes().toString() + quarterMin.toString();

	return value;
}

function calculatePeriod() {
	var date = new Date();

	var hour;
	var minutes;

	if(date.getHours() == 23 && date.getMinutes() > 30) return 0;

	if(date.getMinutes() < 30) {
		hour = date.getHours().toString();
		minutes = "30";
	} else {
		hour = (date.getHours() + 1).toString();
		minutes = "00";
	} 

	return parseInt(hour + minutes);
}

function calculateIntensity() {
	var date = new Date();

	var minutes = date.getMinutes() >= 30 ? date.getMinutes() - 30 : date.getMinutes();

	var intensity = Math.round(minutes * 8.76); // 254 / 29 =~ 8.76

	intensity = intensity < minBrightness ? minBrightness : intensity;

	return intensity > 254 ? 254 : intensity; // Max value 254
}

function changeColor(sat, bri, color) {
	callHue("{\"sat\":" + sat + ", \"bri\":" + bri + ", \"hue\":" + color + "}");
}

function alert() {
	callHue("{\"alert\":\"lselect\"}");
}

function callHue(payload) {
	console.log("Contacting Hue with payload: " + payload);
	var http = new XMLHttpRequest();
	http.open("PUT", "http://" + hueBridgeIp + "/api/YVMru-o1NMKFm0Fn5ZxL8QWk9Bk-IRvIeTHEhFGF/groups/0/action");
	http.send(payload);

	http.onreadystatechange=(e)=> {
		console.log("Response: " + http.responseText)
	}
}

// Deprecated

function phase() {
	callHue("{\"sat\":0, \"bri\":0, \"hue\":25500}")

	setInterval(phase_internal, 250);
}

function phase_internal() {
	callHue("{\"sat_inc\":1, \"bri_inc\":1}")
}

// tease(25, true, "It's coming up...");
// tease(27, true, "Almost there");
// tease(29, true, "GET READY");
function tease(minute, rampup, text) {
	var canvas = document.getElementById("canvas");
	var cx = canvas.getContext("2d");

	var date = new Date();

	var currentMinute = date.getMinutes() <= 30 ? date.getMinutes() : date.getMinutes() - 30;

	if(currentMinute == minute) {
		var transparency = rampup ? (date.getSeconds() * 1000 + date.getMilliseconds()) /60000 : 1;

		cx.font = "60px Roboto";
		cx.fillStyle = "rgba(255,255,255," + transparency + ")";
		cx.textAlign = "center";
		cx.textBaseline = "middle";
		cx.fillText(text, middleX, middleY);
	}
}

function announce() {
	var canvas = document.getElementById("canvas");
	var cx = canvas.getContext("2d");
	var date = new Date();
	var currentMinute = date.getMinutes();

	if(currentMinute == 11 ||currentMinute == 0) {
		if(date.getSeconds() % 2 == 0) {
			cx.globalCompositeOperation='difference';
			cx.fillStyle='white';
			cx.fillRect(0,0,canvas.width,canvas.height);
		} else {
			cx.globalCompositeOperation='difference';
			cx.fillStyle='black';
			cx.fillRect(0,0,canvas.width,canvas.height);
		}
	}
}