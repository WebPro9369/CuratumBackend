define([
	'underscore',
	'moment',
	'numeral',
	'parse',
	
	'entities/currency'
], function(
	_, moment, numeral, Parse,
	CurrencyEntity
) {
	
	var TYPES = {
		
		unitId					: String,
		product					: Parse.Object,
		value					: Array,
		
		quantityLimit			: Number,
		quantityAvailable		: Number,
		
		basePrice				: CurrencyEntity,
		salePrice				: CurrencyEntity,
		
		sortOrder				: Number
		
	};
	
	var model = Parse.Object.extend('ProductUnit', {
		
		_formats: {
			
			_salePrice : function (model, values) {
				
				return !_.isEmpty(values.salePrice) ? values.salePrice._currency.toUpperCase() + ' ' + numeral(values.salePrice._amount).format(NUMBER_FORMAT) : '';
				
			},
			
			_value : function (model, values) {
				return _.chain(values.value || []).map(function (value) {return value.title ? value.title._text : null;}).compact().value().join(', ');
			}
			
		},
		
		_selected : false,
		_quantityIncrement : null,
		
		
		types : function () {
			return TYPES;
		},
		
		select : function () {
			
			var selected = this.collection.selected();
			
			if (!selected || selected.cid !== this.cid) {
				
				if (selected)
					selected.unselect();
					
				this._selected = true;
				
				this.trigger('change', this);
				
			}
			
		},
		
		unselect : function () {
			
			if (this._selected === true) {
				
				this._selected = false;
				
				this.trigger('change', this);
				
			}
			
		},
		
		setQuantityIncrement : function (value) {
			
			this._quantityIncrement = value;
			this.trigger('change', this);
			
		}
		
	});
	
	return model;

});