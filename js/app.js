$(document).ready(function() {
	$.ajaxSetup ({
    	cache: false
	});

	var roadcrew = new Roadcrew();

	roadcrew.flip = function (page) {
		var that = this;
   		this.active.fadeOut(200, function() {
   			that.active = that.verifyPage(page);
   			that.active.fadeIn(400);	
   		});
	};
});