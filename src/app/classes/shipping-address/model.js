define([
	'underscore',
	'moment',
	'numeral',
	'parse'
], function(
	_, moment, numeral, Parse
) {
	
	var TYPES = {
		
		user					: Parse.User,
		title					: String,
		
		personName				: String,
		phoneNumber				: String,
		emailAddress			: String,
		
		streetLines				: Array,
		city					: String,
		stateOrProvinceCode		: String,
		countryCode				: String,
		postalCode				: String,
		
		removed					: Boolean,
		removedAt				: Date
		
	};
	
	var model = Parse.Object.extend('ShippingAddress', {
		
		types : function () {
			return TYPES;
		}
		
	});
	
	return model;

});