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
		
		link					: LinkEntity,
		
		logo					: Parse.Object,
		image					: Parse.Object,
		mapImage				: Parse.Object,
		
		/*phoneNumber				: String,
		emailAddress			: String,
		streetLines				: Array,
		city					: String,
		stateOrProvinceCode		: String,
		country					: String,
		postalCode				: String,*/
		
		location				: Parse.GeoPoint,
		
		boutiqueAddress			: Parse.Object,
		shippingAddress			: Parse.Object,
		
		published				: Boolean
		
	};
	
	var model = Parse.Object.extend('Boutique', {
		
		_formats: {
			
			_thumb : function (model, values) {
				return values.logo && values.logo.thumbUrl && values.logo.thumbUrl.url ? values.logo.thumbUrl.url : null;
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