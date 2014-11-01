function MainAssistant(args) {
	if(args != null)
		this.location = args;
}

RADIUS = 10;
MAXRESULTS = 50;
WIKILANG = "en";

MainAssistant.prototype.setup = function() {
	//$("debug").innerHTML="it is really so easy?";

	this.appMenuModel = {
		visible: true,
		items: [
			{ label: $L("About"), command: 'about' },
			{ label: $L("Preferences"), command: 'preferences' },
			{ label: $L("Look around You"), command: 'refresh' },
			{ label: $L("Look around City"), command: 'setcity' }
		]
	};

	this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true}, this.appMenuModel);

	AdMob.ad.initialize({
		pub_id: 'a14c359562d9dea',
		bg_color: '#ccc',
		text_color: '#333',
		test_mode: false
	});
	
	AdMob.ad.request({
		onSuccess: (function (ad) {
			this.controller.get('admob_ad').insert(ad);
		}).bind(this),
		onFailure: (function () {}).bind(this),
	});
	
	this.newadauto.bind(this).delay(60);

	var cookie = new Mojo.Model.Cookie("wppref");
	var wppref = cookie.get();
	if(wppref != null)
	{
		WIKILANG = wppref.lang;
		RADIUS = wppref.radius;
		MAXRESULTS = wppref.maxresults;
		//this.donate = wppref.donate; 
	} else {
		WIKILANG = "en";
		RADIUS = 10;
		MAXRESULTS = 50;
		//this.donate = true;
	}

	this.controller.setupWidget("spinnerId",
        this.attributes = {
            spinnerSize: "large"
        },
        this.model = {
            spinning: true 
        }
    	); 
	this.controller.listen($('tryagain'),Mojo.Event.tap, this.getcordsButtonPressed.bind(this));
	this.controller.listen($('preferencesbutton'),Mojo.Event.tap, this.preferencesButtonPressed.bind(this));

	wordList = [];

	listModel = {listTitle:$L('Places next to you'), items:wordList};

        // Set up the attributes & model for the List widget:
        this.controller.setupWidget('plist',
                                    this.attributes = {itemTemplate:'main/listitem', listTemplate:'main/listcontainer', emptyTemplate:'main/emptylist'},
                                     listModel);



	//this.controller.listen(this.controller.get('getcords'),Mojo.Event.tap, this.getcordsButtonPressed.bind(this));
	this.controller.listen("plist", Mojo.Event.listTap, this.plistTapped.bindAsEventListener(this));
	
	if(this.location == null)
		this.getcordsButtonPressed();
	else {
		var lon = this.location.split(";")[0];
		var lat = this.location.split(";")[1];
		this.findAround(lon, lat);
	}
		
};

MainAssistant.prototype.newadauto = function(event) {
	AdMob.ad.request({
		onSuccess: (function(ad){
			this.controller.get('admob_ad').childElements()[0].replace(ad);
		}).bind(this),
		onFailure: (function(){}).bind(this),
	});
	
	this.newadauto.bind(this).delay(60);
}

MainAssistant.prototype.plistTapped = function(event) {
//Mojo.Controller.errorDialog(places[event.index].link);
/*this.controller.serviceRequest("palm://com.palm.applicationManager", {
   method: "open",
   parameters:  {
       id: 'com.palm.app.browser',
       params: {
           target: places[event.index].link
       }
   }
 });*/

};


MainAssistant.prototype.preferencesButtonPressed = function(event){
	Mojo.Controller.stageController.pushScene("preferences");
}

MainAssistant.prototype.getcordsButtonPressed = function(event) {

$("nowhere").style.display="none";
//$('donatemessage').style.display = "none";
$("loading").style.display="block";

listModel.items = [];
this.controller.modelChanged(listModel);

this.controller.serviceRequest('palm://com.palm.location', {
    method:"getCurrentPosition",
    parameters:{},
    onSuccess:this.GPSsuccess.bind(this),
    onFailure:this.GPSfail.bind(this)
    }
); 

};

MainAssistant.prototype.GPSsuccess = function(response){
	this.findAround(response.longitude, response.latitude);
}

MainAssistant.prototype.findAround = function(mylon, mylat){
this.poslon = mylon;
this.poslat = mylat;
var url = "http://toolserver.org/~dispenser/cgi-bin/locateCoord.py?dbname=coord_"+WIKILANG+"wiki&lon="+this.poslon+"&lat="+this.poslat+"&range_km=" + RADIUS;

var request = new Ajax.Request(url, {
method: 'get',
onSuccess: this.request1Success.bind(this),
onFailure: this.request1Failure.bind(this)
}); 

};
MainAssistant.prototype.request1Success = function(webresponse) {
//$("debug").innerText=webresponse.responseText;

var worktext = webresponse.responseText;
worktext = worktext.split("<!--RESULTS-->");
worktext = worktext[1];
worktext = worktext.split("<!--/RESULTS-->");
worktext = worktext[0];
//$("debug").innerText=worktext;

var worklines =  worktext.split("<tr");
//$("debug").innerText= worklines[1];

places = [];

for (i = 1; i < worklines.length; i++) {
    var workline = worklines[i];
    
    var lati = workline.split("</td>");
    lati = lati[0].split("<td>");
    lati = lati[1];
    
    var longi = workline.split("</td>");
    longi = longi[1].split("<td>");
    longi = longi[1];
    
    var link = workline.split("href=\"");
    link = link[1].split("</a>");
    link = link[0];
    
    var desc = link.split("\">");
    link = desc[0];
    desc = desc[1];
    
    var distance = this.getDistance(this.poslon, this.poslat, longi, lati);
    //$dist = sin($lat1) * sin($lat2) + cos($lat1)	* cos($lat2) * cos($lon1 - $lon2);
    if (WIKILANG == "en") 
        distance = Math.round(distance * 1000.0 * 0.000621371192 * 1000.0) / 1000.0;
    else 
        distance = Math.round(distance * 1000.0);
    
    var splitdesc = desc.split(" ");
    for (ii = 0; ii < splitdesc.length; ii++) {
        if (splitdesc[ii].length > 20) 
            splitdesc[ii] = splitdesc[ii].substring(0, 20) + "-" + splitdesc[ii].substring(20);
    }
    
    desc = "";
    
    for (j = 0; j < splitdesc.length; j++) {
        desc = desc + splitdesc[j] + " ";
    }
    
    
    //$("debug").innerHTML= lati + "<br>" +longi +"<br>" + desc +"<br>" + link;
    //places.push({dist:dist,lon:longi,lat:lati,link:link,desc:desc});
	
    if (WIKILANG == "en") {
        var distanced = distance + " miles";
        if (desc != "[empty string] " && desc != "? ") {
			places.push({
				dist: distance,
				distd: distanced,
				lon: longi,
				lat: lati,
				link: link,
				desc: desc,
				wikilang: WIKILANG
			});
		}
    } else {
        var distanced = distance + " m";
        if (desc != "[empty string] " && desc != "? ") {
			places.push({
				dist: distance,
				distd: distanced,
				lon: longi,
				lat: lati,
				link: link,
				desc: desc,
				wikilang: WIKILANG
			});
		}
    }
}

//if(this.donate)
//	this.controller.get('donatemessage').style.display = "block";

if (places.length <= 0) {
	$("nowhere").style.display = "block";
	//$("donatemessage").style.display = "none";
}


places.sort(this.sortNumber);

var placesTmp = [];

for(m=0; m<places.length; m++) {
	if(m < MAXRESULTS)
		placesTmp.push(places[m]);
}

places = placesTmp;

listModel.items = places;
this.controller.modelChanged(listModel);
$("loading").style.display="none";

//$("debug").innerHTML = places[5].link;
};

MainAssistant.prototype.sortNumber = function( a, b) {
if (a.dist > b.dist) return 1;
if (a.dist < b.dist) return -1;
if (a.dist == b.dist) return 0;
};

MainAssistant.prototype.getDistance = function(lon1, lat1, lon2,lat2) {
		var unit = 6371.0;
		var degreeRadius = Math.PI / 180.0;
		lat1  = lat1 * degreeRadius;
		lon1  = lon1 * degreeRadius;
		lat2  = lat2 * degreeRadius;
		lon2  = lon2 * degreeRadius;
		var distance = Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1)* Math.cos(lat2) * Math.cos(lon1 - lon2);
		return (unit * Math.acos(distance));
};


MainAssistant.prototype.request1Failure = function(response) {
Mojo.Controller.errorDialog( "failed to get content");

};

MainAssistant.prototype.GPSfail = function(response) {
	Mojo.Controller.errorDialog( "failed to get position");
};

MainAssistant.prototype.activate = function(event) {

};

MainAssistant.prototype.setCityLocation = function(event) {
	this.controller.showDialog({
		template: 'main/dialog-scene',
		assistant: new DialogAssistant(this),
		preventCancel: false
	});
};

MainAssistant.prototype.deactivate = function(event) {

};

MainAssistant.prototype.cleanup = function(event) {

};

MainAssistant.prototype.handleCommand = function(event){
    if(event.type == Mojo.Event.command) {	
		switch (event.command) {
			case 'about':
				Mojo.Controller.stageController.pushScene("about");
				break;
			case 'preferences':
				Mojo.Controller.stageController.pushScene("preferences");
				break;
			case 'refresh':
				this.getcordsButtonPressed();
				break;	
			case 'setcity':
				this.setCityLocation();
				break;	
		}
	}
}
