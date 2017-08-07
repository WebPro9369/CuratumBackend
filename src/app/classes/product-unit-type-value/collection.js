define([
	'parse',
	'./model',
	
	'proto/collection/sourceable'
], function(
	Parse, Model,
	SourceableCollectionProto
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
	
	})
	.extend(_.clone(SourceableCollectionProto));
	
	return collection;

});