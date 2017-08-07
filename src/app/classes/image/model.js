define([
	'underscore',
    'parse',
	
	'entities/text',
	'entities/link'
], function(
	_, Parse,
	TextEntity, LinkEntity
) {
	
	var TYPES = {
		
		thumbUrl				: Parse.File,
		thumbProp				: Object,
		
		// image variants
		
		originalUrl				: Parse.File,
		originalProp			: Object,
		
		title					: TextEntity,
		alignment				: Array,
		creditLink				: LinkEntity
		
	};
	
	var model = Parse.Object.extend('Image', {
		
		//view: null,
		
		types : function () {
			return TYPES;
		},
		
		
		getUrlAttrName : function (name) {
			return name + 'Url';
		},
		
		
		getPropAttrName : function (name) {
			return name + 'Prop';
		},
		
		
		/*apply : function () {
			
			if (this.view)
				this.view.apply();
			
		}*/
		
	});
	
	return model;

});