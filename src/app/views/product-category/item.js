define([
    'underscore',
    'parse',
    
    'text!templates/product-category/item.html'
], function(
	_, Parse,
	itemTemplate
) {
	
	const VIEW = {
		TITLE	 	: 'Product Category',
		NAME		: 'ProductCategoryItem',
		ID			: 'product-category'
	};
	
	var view = Parse.View.extend({
	
		tagName : 'tr',
	
		events : {},
	
	
		initialize : function(options) {
			
			//if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.initialize');
			
			_.bindAll(this, 'render');
			
			this.template = _.template(itemTemplate);
			
			this.model.bind('change', this.render);
	
		},
	
	
		render : function() {
			
			//if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.render');
			
			this.$el.html(this.template(_.defaults({}, VIEW, this.model.toTemplate())));
			
			this.$el.attr('data-id', this.model.id);
			
			return this;
			
		}
		
		
	});
	
	return view;

});