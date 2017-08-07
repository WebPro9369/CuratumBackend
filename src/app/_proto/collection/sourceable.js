define([
	'underscore',
    'parse'
], function(_, Parse) {
	
	var prototype = {

		toDatasource : function(iterator) {
			
			return this.chain()
			.map(
				
				function(model) {
					
					if (_.isFunction(model[iterator]))
						return model[iterator]();
						
				}
				
			)
			.compact()
			.value();
			
		},
	
	};
	
	return prototype;

});