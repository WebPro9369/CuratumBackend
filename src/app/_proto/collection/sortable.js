define([
	'underscore',
    'parse'
], function(_, Parse) {
	
	var prototype = {

		changed : function() {
			
			return this.filter(
				
				function(model) {
					return model.dirty();
				}
				
			);
			
		},
		
		
		orderChanged : function() {
			
			return this.filter(
				
				function(model) {
					return model.isOrderChanged();
				}
				
			);
			
		},
		
		
		orderApply : function() {
			
			return this.each(
				
				function(model) {
					model.doOrderApply();
				}
				
			);
			
		}
	
	};
	
	return prototype;

});