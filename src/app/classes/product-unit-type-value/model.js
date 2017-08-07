define([
	'underscore',
	'moment',
	'numeral',
	'parse',
	
	'entities/text'
], function(
	_, moment, numeral, Parse,
	TextEntity
) {
	
	var TYPES = {
		code					: String,
		type					: Parse.Object,
		title					: TextEntity
	};
	
	var model = Parse.Object.extend('ProductUnitTypeValue', {
		
		_selected : false,
		
		
		types : function () {
			return TYPES;
		},
		
		
		datasource : function () {
			
			var values = this.toTemplate();
			return values.title._text ? {id: this.id, text: values.title._text} : null;
			
		},
		
		
		datasourceWithType : function () {
			
			var values = this.toTemplate();
			return values.title._text ? {id: this.id, text: (values.type ? values.type.title._text + ' / ' : '') + values.title._text} : null;
			
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
			
		}
		
	});
	
	return model;

});