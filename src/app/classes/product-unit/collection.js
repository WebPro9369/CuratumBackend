define([
	'parse',
	'./model'
], function(
	Parse, Model
) {
	
	var collection = Parse.Collection.extend({
		
		model : Model,
		
		
		ordered : function(order) {
			
			return this.sortBy(
				
				function(model) {
					return _.indexOf(this, model.cid);
				},
				order
				
			);
			
		},
		
		
		selected : function () {
			
			return this.find(function (model) {return model._selected === true;});
			
		}
	
	});
	
	return collection;

});