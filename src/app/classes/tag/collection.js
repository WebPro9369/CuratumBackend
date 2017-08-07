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
		
		
		filterByType: function (type) {
			
			return this.filter(
				
				function (model) {
					
					return model.get('type') === type;
					
				}
				
			);
			
		}
	
	})
	.extend(_.clone(SourceableCollectionProto));
	
	return collection;

});