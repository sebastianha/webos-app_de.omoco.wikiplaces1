function PreferencesAssistant() {

};

PreferencesAssistant.prototype.setup = function() {

	this.appMenuModel = {
                visible: true,
                items: []
        };
        this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true}, this.appMenuModel);

	var cookie=  new Mojo.Model.Cookie("wppref");
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

	var countryname = "English";
	if (WIKILANG == "de" ) countryname = "Deutsch";
	if (WIKILANG == "fr" ) countryname = "Francais";
	if (WIKILANG == "es" ) countryname = "Espanol";

	this.langchoice = [];
	selectorsModel = { langtype: $L(countryname) };

	this.controller.listen('langselector', Mojo.Event.propertyChange, this.selectorChanged.bindAsEventListener(this));
	this.controller.setupWidget('langselector', {label: $L("Language"), choices: this.langchoice, modelProperty:'langtype'}, selectorsModel);
	
	selectorsModel.choices = [
		{ label: "English", value:"en" },
		{ label: "Deutsch", value:"de" },
		{ label: "Francais", value:"fr" },
		{ label: "Espanol", value:"es" },
	];
	this.controller.modelChanged(selectorsModel);


	this.radiuschoice = [];
	selectorsModel2 = { radius: $L(RADIUS + " km") };

	this.controller.listen('radiusselector', Mojo.Event.propertyChange, this.selectorChanged2.bindAsEventListener(this));
	this.controller.setupWidget('radiusselector', {label: $L("Radius"), choices: this.radiuschoice, modelProperty:'radius'}, selectorsModel2);
	
	selectorsModel2.choices = [
		{ label: "1 km", value:"1" },
		{ label: "2 km", value:"2" },
		{ label: "5 km", value:"5" },
		{ label: "10 km", value:"10" },
		{ label: "20 km", value:"20" },
		{ label: "50 km", value:"50" },
	];
	this.controller.modelChanged(selectorsModel2);


	this.maxresultschoice = [];
	selectorsModel3 = { maxresults: MAXRESULTS };

	this.controller.listen('maxresultsselector', Mojo.Event.propertyChange, this.selectorChanged3.bindAsEventListener(this));
	this.controller.setupWidget('maxresultsselector', {label: $L("Max Results"), choices: this.maxresultschoice, modelProperty:'maxresults'}, selectorsModel3);
	
	selectorsModel3.choices = [
		{ label: "10", value:"10" },
		{ label: "25", value:"25" },
		{ label: "50", value:"50" },
		{ label: "100", value:"100" },
		{ label: "200", value:"200" },
	];
	this.controller.modelChanged(selectorsModel3);


	/*tdattr = {trueLabel: 'yes', falseLabel: 'no'};
	tdModel = {value: this.donate, disabled: false};
	
	this.controller.setupWidget('donatetoggle', tdattr, tdModel);
	Mojo.Event.listen(this.controller.get('donatetoggle'),Mojo.Event.propertyChange,this.togglePressed.bind(this));*/
};

PreferencesAssistant.prototype.selectorChanged = function(event) {
	var cookie = new Mojo.Model.Cookie("wppref");
	cookie.put({
		lang: event.value,
		radius: RADIUS,
		maxresults: MAXRESULTS,
		//donate: tdModel.value,
	});
	WIKILANG = event.value;
};

PreferencesAssistant.prototype.selectorChanged2 = function(event) {
	var cookie = new Mojo.Model.Cookie("wppref");
	cookie.put({
		lang: WIKILANG,
		radius: event.value,
		maxresults: MAXRESULTS,
		//donate: tdModel.value,
	});
	RADIUS = event.value;
};

PreferencesAssistant.prototype.selectorChanged3 = function(event) {
	var cookie = new Mojo.Model.Cookie("wppref");
	cookie.put({
		lang: WIKILANG,
		radius: RADIUS,
		maxresults: event.value,
		//donate: tdModel.value,
	});
	MAXRESULTS = event.value;
};

/*PreferencesAssistant.prototype.togglePressed = function(event) {
	var cookie = new Mojo.Model.Cookie("wppref");
	cookie.put({
		lang: WIKILANG,
		radius: RADIUS,
		maxresults: MAXRESULTS,
		donate: tdModel.value,
	});
};*/

PreferencesAssistant.prototype.activate = function(event) {

};

PreferencesAssistant.prototype.deactivate = function(event) {

};

PreferencesAssistant.prototype.cleanup = function(event) {

};
