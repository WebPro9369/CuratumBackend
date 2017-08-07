define([
	'underscore',
	'moment',
	'numeral',
	'parse'
], function(
	_, moment, numeral, Parse
) {
	
	var TYPES = {
		state					: Array,
		product					: Parse.Object,
		productUnit				: Parse.Object,
		orderNumber				: String,
		sender					: Parse.Object,
		recipient				: Parse.Object,
		user					: Parse.User,
		amount					: Object,
		shippingTypeSelected	: String,
		shippingTypeParam		: Array,
		paymentCard				: Parse.Object
	};
	
	var model = Parse.Object.extend('Order', {
		
		types : function (filter) {
			return filter ? _.chain(TYPES).map(function (type, name) {return type === filter ? name : null;}).compact().value() : TYPES;
		},
		
	});
	
	return model;

});