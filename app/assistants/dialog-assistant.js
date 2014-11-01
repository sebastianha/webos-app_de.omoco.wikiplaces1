function DialogAssistant(sceneAssistant) {
	this.sceneAssistant = sceneAssistant;
	this.controller = sceneAssistant.controller;
}

DialogAssistant.prototype.setup = function(widget) {
	this.controller.setupWidget('lookup', 
		this.atts = {
			type: Mojo.Widget.activityButton
		}, 
		this.model = {
			buttonLabel: 'Lookup',
			buttonClass: 'affirmative',
			disabled: false
		}
	);
	
	this.lookup = this.lookup.bindAsEventListener(this);
	//this.cancel = this.cancel.bindAsEventListener(this);
	
	Mojo.Event.listen(this.controller.get('lookup'),Mojo.Event.tap,this.lookup);
	//Mojo.Event.listen(this.controller.get('cancel'),Mojo.Event.tap,this.cancel);
	
	cityattr = {
		hintText: 'Enter city...',
		textFieldName: 'name', 
		modelProperty: 'original', 
		multiline: false,
		focus: true, 
		maxLength: 50,
	};
	citymodel = {
		'original' : "",
		disabled: false
	};
	this.controller.setupWidget('cityname', cityattr, citymodel);
}

DialogAssistant.prototype.lookup = function(event){
	var url = "http://gazetteer.openstreetmap.org/namefinder/search.xml?find=" + escape(citymodel['original']) + "&max=1&any=1";
	
	var request = new Ajax.Request(url, {
		method: 'get',
		onSuccess: this.request2Success.bind(this),
		onFailure: this.request2Failure.bind(this)
	}); 
	
	//Mojo.Controller.stageController.swapScene("main", );
}

DialogAssistant.prototype.request2Success = function(resp) {
	var response = resp.responseText;
	if (response.split("name not found").length > 1) {
		Mojo.Controller.errorDialog("Could not find city, please try again.");		
	} else {
		var lat = response.split("lat='")[1];
		lat = lat.split("'")[0];
		var lon = response.split("lon='")[1];
		lon = lon.split("'")[0];
		
		Mojo.Controller.stageController.swapScene("main", lon + ";" + lat);
	}
}

DialogAssistant.prototype.request2Failure = function(resp) {
	Mojo.Controller.errorDialog( "failed to get city content");
}

DialogAssistant.prototype.activate = function(event) {
}

DialogAssistant.prototype.deactivate = function(event) {
}

DialogAssistant.prototype.cleanup = function(event) {
}