define([
	'underscore',
	'moment',
	'numeral',
	'parse',
	
	'entities/text'
], function(
	_, moment, numeral, Parse,
	TextEntity
) {
	
	var TYPES = {
		code					: String,
		title					: TextEntity,
		value					: Array,
		published				: Boolean
	};
	
	var model = Parse.Object.extend('ProductUnitType', {
		
		types : function () {
			return TYPES;
		},
		
		
		datasource : function () {
			
			var values = this.toTemplate();
			return values.title._text ? {id: this.id, text: values.title._text} : null;
			
		}
		
	});
	
	return model;

});