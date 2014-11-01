function AboutAssistant() {

}

AboutAssistant.prototype.setup = function() {
	this.appMenuModel = {
		visible: true,
		items: []
	};
	this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true}, this.appMenuModel);
}

AboutAssistant.prototype.activate = function(event) {

}

AboutAssistant.prototype.deactivate = function(event) {

}

AboutAssistant.prototype.cleanup = function(event) {

}
