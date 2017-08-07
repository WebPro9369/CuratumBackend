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
		type					: Number,
		value					: TextEntity,
		published				: Boolean
	};
	
	var ENUMS = {
		
		type: [
			{id: TAG_TYPE_SOCIAL	, text: 'Social'},
			{id: TAG_TYPE_ARCHETYPE	, text: 'Archetype'},
			{id: TAG_TYPE_PRODUCT	, text: 'Product'},
			{id: TAG_TYPE_WEATHER	, text: 'Weather'},
			{id: TAG_TYPE_OCCASION	, text: 'Occasion'}
		]
		
	};
	
	var model = Parse.Object.extend('Tag', {
		
		types : function () {
			return TYPES;
		},
		
		
		enums : function (name) {
			return ENUMS[name] || [];
		},
		
		
		datasource : function () {
			
			var values = this.toTemplate();
			return values.value._text ? {id: this.id, text: values.value._text} : null;
			
		}

	});
	
	return model;

});
