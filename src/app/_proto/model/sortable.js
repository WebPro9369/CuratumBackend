define([
	'underscore',
    'parse'
], function(_, Parse) {
	
	
	var prototype = {

		doOrderChange: function (value) {
			
			if (_.isUndefined(this.order))
				this.order = this.get('sortOrder');
			
			var changed = this.order !== value;
			 
			this.order = value;
			
			if (changed)
				this.trigger('change');
			
		},
		
		
		doOrderApply: function (value) {
			
			if (this.order !== this.get('sortOrder'))
				this.set('sortOrder', this.order);
			
		},
		
		
		isOrderChanged: function () {
			
			return this.get('sortOrder') !== this.order;
			
		}
	
	};
	
	return prototype;

});