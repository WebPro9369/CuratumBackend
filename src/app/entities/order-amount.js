// OrderAmount Entity

define([
	'underscore',
	'entities/entity'
], function(
	_, EntityObject
) {
	
	var ATTRIBUTES = {
		productPrice	: Number,
		productDiscount	: Number,
		productTotal	: Number,
		shippingPrice	: Number,
		shippingDiscount: Number,
		shippingTotal	: Number,
		balanceTotal	: Number,
		taxTotal		: Number,
		totalPrice		: Number,
		totalDiscount	: Number,
		totalTotal		: Number,
		currency		: String
	};
	
	var Entity = class Entity extends EntityObject {
		
		has (name) {
			
			return _.has(ATTRIBUTES, name) ? _.has(this._value, name) : undefined;
			
		}
		
		'get' (name) {
			
			return _.has(ATTRIBUTES, name) ? this._value[name] : undefined;
			
		}
		
		'set' (name, value) {
			
			if (_.has(ATTRIBUTES, name) && (value instanceof ATTRIBUTES[name]))
				this._value[name] = value;
			
		}
		
		unset (name) {
			
			if (_.has(ATTRIBUTES, name))
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
			
			return this._value;
			
		}
		
	}
	
	return Entity;
	
});