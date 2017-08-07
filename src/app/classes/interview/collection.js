define([
	'parse',
	'./model',
	
	'proto/collection/sourceable'
], function(
	Parse, Model,
	SourceableCollectionProto
) {
	
	var collection = Parse.Collection.extend({
		
		model : Model
	
	})
	.extend(_.clone(SourceableCollectionProto));
	
	return collection;

});