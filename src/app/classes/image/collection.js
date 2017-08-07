define([
    'parse',
    './model'
], function(
	Parse, Model
) {
	
	var collection = Parse.Collection.extend({
		
		model : Model,
		
		
		/*apply : function() {
			
			return this.each(function (model) {return model.apply();})
			
		},*/
		
		
		unordered : function() {
			
			return this.map(function (item) {return item;})
			
		},
		
		
		ordered : function(order) {
			
			return this.sortBy(
				
				function(model) {
					return _.indexOf(this, model.cid);
				},
				order
				
			);
			
		}
	
	});
	
	return collection;

});