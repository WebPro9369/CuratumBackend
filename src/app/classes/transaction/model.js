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
		type					: Number,
		value					: Number,
		params					: Object
	};
	
	var model = Parse.Object.extend('Transaction', {
		
		types : function (filter) {
			return filter ? _.chain(TYPES).map(function (type, name) {return type === filter ? name : null;}).compact().value() : TYPES;
		}
		
	});
	
	return model;

});