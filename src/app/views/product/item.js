define([
    'underscore',
    'moment',
    'parse',
    
    'text!templates/product/item.html'
], function(
	_, moment, Parse,
	itemTemplate
) {
	
	const VIEW = {
		TITLE	 	: 'Product',
		NAME		: 'ProductItem',
		ID			: 'product'
	};
	
	var view = Parse.View.extend({
	
		tagName : 'tr',
	
		events : _.unpairs([
			['click [data-action="activate"][rel="' + VIEW.ID + '"]'		, 'doActivate']
		]),
	
	
		initialize : function() {
			
			//if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.initialize');
			
			_.bindAll(this, 'render', 'updateHeight', 'doActivate');
			
			this.template = _.template(itemTemplate);
			
			this.model.bind('change', this.render);
	
		},
	
	
		render : function() {
			
			//if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.render');
			
			this.$el.html(this.template(_.defaults({}, VIEW, this.model.toTemplate())));
			
			if (this.options.theme === THEME_TYPE_GALLERY)
				this.$el.addClass('col-md-3 table-item');
			
			this.$el.attr('data-id', this.model.id);
			
			return this;
			
		},
		
		
		updateHeight : function() {
			
			//if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.updateHeight');
			
			if (this.options.theme === THEME_TYPE_GALLERY)
				this.$el.css('height', this.$el.height() + 'px');
			
		},
		
		
		doActivate : function(ev) {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.doActivate');
			
			var
				$target = $(ev.currentTarget),
				data = $target.data();
			
			this.model.set('isValid', data.value === true);
			
			var self = this;
			
			this.model.save().then(
					
				function (result) {
					
					app.view.alert(
						self.$el,
						'success',
						'',
						'Product was successfully activated',
						3000
					);
					
				},
				function (error) {
					
					app.view.alert(
						self.$el,
						'danger',
						'Failure to activate/deactivate the product',
						error.message,
						false
					);
					
				}
					
			);
			
			return false;
			
		},
		
		
	});
	
	return view;

});