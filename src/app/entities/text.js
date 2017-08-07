// Text Entity

define([
	'underscore',
	'entities/entity'
], function(
	_, EntityObject
) {
	
	var Entity = class Entity extends EntityObject {
		
		has (name) {
			
			return _.has(this._value, name);
			
		}
		
		'get' (name) {
			
			return this._value[name];
			
		}
		
		'set' (name, value) {

			if (_.isString(value))
				this._value[name] = value;
			
		}
		
		unset (name) {
			
			delete this._value[name];
			
		}
		
		decode () {
			
			var raw = this._decode();
			
			this._value = {};
			
			_.each(raw, function (value, name) {this.set(name, value);}, this);
			
		}
		
		encode () {
			
			this._encode(this._value);
			
		}
		
		toTemplate () {
			
			var value = _.clone(this._value);
			
			if (_.has(this._value, app.settings.config.DEFAULT_LANGUAGE)) {
				
				value._text = this._value[app.settings.config.DEFAULT_LANGUAGE];
				value._language = app.settings.config.DEFAULT_LANGUAGE;
				
			} else {
				
				var lang = _.find(_.pluck(app.settings.enums.language, 'code'), function (code) {
					return _.has(this._value, code);
				}, this);
				
				if (lang) {
					value._text = this._value[lang];
					value._language = lang;
				}
				
			}
			
			return value;
			
		}
		
		value () {
			
			var value = '';
			
			if (_.has(this._value, app.settings.config.DEFAULT_LANGUAGE))
				value = this._value[app.settings.config.DEFAULT_LANGUAGE];
				
			else {
				
				var lang = _.find(_.pluck(app.settings.enums.language, 'code'), function (code) {
					return _.has(this._value, code);
				}, this);
				
				if (lang)
					value = this._value[lang];
				
			}
			
			return value;
			
		}
		
	}
	
	return Entity;
	
});