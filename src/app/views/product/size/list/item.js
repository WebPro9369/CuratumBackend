define([
    'jquery',
    'underscore',
    'parse',
    
    'text!templates/product/size/list/item.html'
], function(
	$, _, Parse,
	itemTemplate
) {
	
	var view = Parse.View.extend({
	
		tagName : 'tr',
	
		events : {
			'change [name="product-size-title"]'				: 'doChangeTitle',
			'change [name="product-size-quantity"]'				: 'doChangeQuantity',
			'click [data-action="product-size-remove"]'			: 'doRemove'
		},
	
	
		initialize : function(options) {
			
			//if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductSizeListItemView.initialize');
			
			_.bindAll(this, 'render', 'doChangeTitle', 'doChangeQuantity', 'doUpdateTitle', 'doRemove');
			
			this.template = _.template(itemTemplate);
			
			this.type = options.type === 'form' ? 'form' : 'view'; 
			
			this.model.bind('change', this.render);
	
		},
	
	
		render : function() {
			
			//if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductSizeListItemView.render');
			
			this.$el.html(this.template(this.model.toObject()));
			
			this.$el.attr('data-id', this.model.cid);
			
			return this;
			
		},
		
		
		doChangeTitle : function (ev) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductSizeListItemView.doChangeTitle');
			
			var
				$target = $(ev.currentTarget),
				value = $target.val()
			
			this.model.set('title', value);
			
			this.model.collection.trigger('update', this.model);
			
		},
		
		
		doChangeQuantity : function (ev) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductSizeListItemView.doChangeQuantity');
			
			var
				$target = $(ev.currentTarget),
				value = parseInt($target.val())
			
			if (_.isFinite(value))
				this.model.set('quantity', value);
			else
				this.model.unset('quantity');
			
			this.model.collection.trigger('update', this.model);
			
		},
		
		
		doUpdateTitle : function (response, value) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductSizeListItemView.doUpdateTitle');
			
			this.model.set('title', value);
			
		},
		
		
		doRemove : function(ev) {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductSizeListItemView.doRemove');
			
			this.model.delete();
			this.remove();
			
			return false;
			
		}
		
		
	});
	
	return view;

});