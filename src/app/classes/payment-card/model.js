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
		
		cardType				: String,
		trailingDigits			: String,
		validThru				: String,
		
		stripeCardId			: String,
		
		removed					: Boolean,
		removedAt				: Date
		
	};
	
	var model = Parse.Object.extend('PaymentCard', {
		
		types : function () {
			return TYPES;
		}
		
	});
	
	return model;

});