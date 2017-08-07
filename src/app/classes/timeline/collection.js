define([
	'parse',
	'./model'
], function(
	Parse,
	Model
) {
	
	var collection = Parse.Collection.extend({
		
		model : Model,
		
		toDatasource : function() {
			
			return this.map(
				
				function(model) {
					return {id: model.id, text: model.has('subject') ? model.get('subject') : ''};
				}
				
			);
			
		}
	
	});
	
	return collection;

});