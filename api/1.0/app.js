var _ = require('underscore');

var app = {
	
	scheme	: require('./scheme.js'),
	config	: {
		DEFAULT_COUNTRY		: 'us',
		DEFAULT_LANGUAGE	: 'en',
		DEFAULT_CURRENCY	: 'usd'
	},
	enums	: {
		country		: require('./app/config/enum/country.js'),
		language	: require('./app/config/enum/language.js'),
		currency	: require('./app/config/enum/currency.js'),
		device		: require('./app/config/enum/device.js'),
		tax			: require('./app/config/enum/tax.js')
	},
	
	Exception: require('./app/exception')
	
};

_.extend(
	app,
	/*{
		Exception : app.exception.prototype
	},*/
	{
		
		matchCountry : function (countryCode) {
			
			if (_.isString(countryCode) && !_.isEmpty(countryCode) && _.findWhere(this.enums.country, {code: countryCode}))
				return countryCode;
			
			else
				return this.config.DEFAULT_COUNTRY;
			
		},
		
		getCountry : function (countryCode) {
			
			return _.findWhere(this.enums.country, {code: countryCode});
			
		},
		
		matchLanguage : function (languageCode) {
			
			if (_.isString(languageCode) && !_.isEmpty(languageCode) && _.findWhere(this.enums.language, {code: languageCode}))
				return languageCode;
			
			else
				return this.config.DEFAULT_LANGUAGE;
			
		},
		
		getLanguage : function (languageCode) {
			
			return _.findWhere(this.enums.language, {code: languageCode});
			
		},
		
		chainLanguage : function (languageCode) {
			
			var result = [languageCode];
			
			if (languageCode !== this.config.DEFAULT_LANGUAGE)
				result.push(this.config.DEFAULT_LANGUAGE);
			
			return result;
			
		},
		
		matchCurrency : function (currencyCode) {
			
			if (_.isString(currencyCode) && !_.isEmpty(currencyCode) && _.findWhere(this.enums.currency, {code: currencyCode}))
				return currencyCode;
			
			else
				return this.config.DEFAULT_CURRENCY;
			
		},
		
		getCurrency : function (currencyCode) {
			
			return _.findWhere(this.enums.currency, {code: currencyCode});
			
		},
		
		
		chainCurrency : function (currencyCode) {
			
			var result = [currencyCode];
			
			if (currencyCode !== this.config.DEFAULT_CURRENCY)
				result.push(this.config.DEFAULT_CURRENCY);
			
			return result;
			
		},
		
		
		getLocaleString : function (value, languageCode) {
			
			if (_.isString(value))
				return value;
			
			else if (_.isObject(value)) {
				
				var
					code = this.matchLanguage(languageCode);
				
				if (_.has(value, code))
					return _.isString(value[code]) ? value[code] : String(value[code]);
				
				else if (code !== this.config.DEFAULT_LANGUAGE && _.has(value, this.config.DEFAULT_LANGUAGE))
					return _.isString(value[this.config.DEFAULT_LANGUAGE]) ? value[this.config.DEFAULT_LANGUAGE] : String(value[this.config.DEFAULT_LANGUAGE]);
				
				else
					return '';
			
			} else if (!_.isEmpty(value))
				return String(value);
			
			else
				return '';
			
		}
		
	}
);

module.exports = app;