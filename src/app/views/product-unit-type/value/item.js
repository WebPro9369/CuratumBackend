define([
    'underscore',
    'parse',
    
    'text!templates/product-unit-type/value/item.html'
], function(
	_, Parse,
	itemTemplate
) {
	
	const VIEW = {
		TITLE	 	: 'SKU Type Value',
		NAME		: 'ProductUnitTypeValueItem',
		ID			: 'product-unit-type-value'
	};
	
	var view = Parse.View.extend({
	
		tagName : 'tr',
	
		events : {},
	
	
		initialize : function(options) {
			
			//if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.initialize');
			
			_.bindAll(this, 'render', 'remove');
			
			this.template = _.template(itemTemplate);
			
			this.model.bind('change', this.render);
			this.model.bind('remove', this.remove);
	
		},
	
	
		render : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.render');
			
			this.$el.html(this.template(_.defaults({}, VIEW, this.model.toTemplate())));
			
			if (this.model._selected === true)
				this.$el.addClass('active');
			else
				this.$el.removeClass('active');
			
			this.$el.attr('data-cid', this.model.cid);
			
			return this;
			
		}
		
		
	});
	
	return view;

});