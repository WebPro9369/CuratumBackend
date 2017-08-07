// Currency Entity

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
			
			if (_.isNumber(value))
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
			
			if (_.has(this._value, app.settings.config.DEFAULT_CURRENCY)) {
				
				value._amount = this._value[app.settings.config.DEFAULT_CURRENCY];
				value._currency = app.settings.config.DEFAULT_CURRENCY;
				
			} else {
				
				var curr = _.find(_.pluck(app.settings.enums.currency, 'code'), function (code) {
					return _.has(this._value, code);
				}, this);
				
				if (curr) {
					value._amount = this._value[curr];
					value._currency = curr;
				}
				
			}
			
			return value;
			
		}
		
		value () {
			
			var value = '';
			
			if (_.has(this._value, app.settings.config.DEFAULT_CURRENCY))
				value = this._value[app.settings.config.DEFAULT_CURRENCY];
				
			else {
				
				var curr = _.find(_.pluck(app.settings.enums.currency, 'code'), function (code) {
					return _.has(this._value, code);
				}, this);
				
				if (curr)
					value = this._value[curr];
				
			}
			
			return value;
			
		}
		
	}
	
	return Entity;
	
});