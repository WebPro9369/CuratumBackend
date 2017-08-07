// Base Entity

define([
	'underscore'
], function(
	_
) {
	
	var entity = class Entity {
		
		constructor (model, name) {
			
			this._model = model;
			this._name = name;
			
			this._value = {};
			
			this.decode();
			
		}
		
		_decode () {
			
			return this._model && this._name ? this._model.get(this._name) : {};
				
		}
		
		_encode (raw) {
			
			if (this._model && this._name) {
				
				if (!_.isEmpty(raw))
					this._model.set(this._name, raw);
				
				else
					this._model.unset(this._name);
				
			}
				
		}
		
		decode () {
			
			this._value = this._decode();
				
		}
		
		encode () {
			
			this._encode(this._value);
				
		}
		
	}
	
	return entity;
	
});