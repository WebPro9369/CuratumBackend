define([
	'underscore',
	'moment',
	'numeral',
	'parse'
], function(
	_, moment, numeral, Parse
) {
	
	var TYPES = {
		username				: String,
		email					: String,
		fullName				: String,
		phoneNumber				: String,
		country					: String,
		timelineViewed			: Array,
		productCurated			: Array,
		productLiked			: Array,
		defaultShippingAddress	: Parse.Object,
		defaultPaymentCard		: Parse.Object,
		archetypeTags			: Array,
		stripeCustomerId		: String,
		balance					: Number
	};
	
	var model = Parse.Object.extend('User', {
		
		types : function () {
			return TYPES;
		}
		
	});
	
	return model;

});