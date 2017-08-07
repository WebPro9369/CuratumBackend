var _ = require('underscore');
var errors = require('./config/errors');

var Exception = function (code, lang, custom, params) {
	
	this.code = code;
	
	if (params)
		this.params = params;
		
	var message = {};
	
	if (_.isString(custom))
		message[lang] = custom;
	
	else if (_.isObject(custom))
		message = custom;

	if (_.has(message, lang))
		this.message = message[lang];
	
	else if (message = _.chain(this.messages).map(function (v, k) {return this[k] === this.code ? v[lang] : null;},this).compact().first().value())
		this.message = message;
	
	else
		this.message = '';
	
};

Exception.prototype.toString = function () {
	
	return this.message;

}

Exception.prototype.getLocaleMessage = function (code, lang) {
	
	return Exception.prototype.messages[code][lang];
	
}

_.extend(
	Exception.prototype,
	errors
);

_.extend(
	Exception,
	errors
);

module.exports = Exception;