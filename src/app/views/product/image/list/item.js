define([
    'jquery',
    'underscore',
    'parse',
    
    'text!templates/product/image/list/item.html'
], function(
	$, _, Parse,
	itemTemplate
) {
	
	var view = Parse.View.extend({
	
		tagName : 'figure',
	
		events : {
			'click [data-action="product-image-remove"]'			: 'doRemove',
			'click [data-action="product-image-select"]'			: 'doSelect'
		},
	
	
		initialize : function(options) {
			
			//if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductImageListItemView.initialize');
			
			_.bindAll(this, 'render', 'doRemove', 'doSelect');
			
			this.template = _.template(itemTemplate);
			
			this.type = options.type === 'form' ? 'form' : 'view'; 
			
			this.model.bind('change', this.render);
	
		},
	
	
		render : function() {
			
			//if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductImageListItemView.render');
			
			this.$el.html(this.template(this.model.toObject()));
			
			this.$el.attr('data-id', this.model.cid);
			
			if (this.model.isSelected())
				this.$el.addClass('active');
			else
				this.$el.removeClass('active');
			
			return this;
			
		},
		
		
		doRemove : function(ev) {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductImageListItemView.doRemove');
			
			this.model.collection.remove(this.model);
			this.remove();
			
			return false;
			
		},
		
		
		doSelect : function(ev) {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductImageListItemView.doSelect');
			
			this.model.select();
			
			return false;
			
		}
		
		
	});
	
	return view;

});