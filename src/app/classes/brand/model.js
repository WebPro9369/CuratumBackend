define([
	'underscore',
	'moment',
	'numeral',
	'parse',
	
	'entities/text',
	'entities/link'
], function(
	_, moment, numeral, Parse,
	TextEntity, LinkEntity
) {
	
	var TYPES = {
		
		subject					: TextEntity,
		title					: TextEntity,
		desc					: TextEntity,
		detailTitle				: TextEntity,
		detailDesc				: TextEntity,
		color					: String,
		
		logo					: Parse.Object,
		image					: Parse.Object,
		
		link					: LinkEntity,
		
		published				: Boolean
		
	};
	
	var model = Parse.Object.extend('Brand', {
		
		_formats: {
			
			_thumb : function (model, values) {
				return values.image && values.image.thumbUrl && values.image.thumbUrl.url ? values.image.thumbUrl.url : null;
			}
			
		},
		
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