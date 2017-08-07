define([
	'underscore',
    'parse'
], function(
	_, Parse
) {
	
	var TYPES = {
		occasion			: Parse.Object,
		archetype			: Parse.Object,
		weather				: Parse.Object,
		product				: Parse.Object
	};
	
	var model = Parse.Object.extend('ProductMap', {
		
		types : function () {
			return TYPES;
		}
		
	});
	
	return model;

});