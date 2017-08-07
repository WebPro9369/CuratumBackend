define([
	'underscore',
    'parse'
], function(
	_, Parse
) {
	
	var TYPES = {
		date				: Date,
		assignment			: Object
	};
	
	var model = Parse.Object.extend('ProductSchedule', {
		
		types : function () {
			return TYPES;
		}
		
	});
	
	return model;

});