define([
    'jquery',
    'underscore',
    'moment',
    'parse',
    
    'text!templates/timeline/product/list/item.html',
    'icheck'
], function(
	$, _, moment, Parse,
	itemTemplate
) {
	
	var view = Parse.View.extend({
	
		tagName : 'tr',
	
		events : {},
	
	
		initialize : function() {
			
			//if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductListItemView.initialize');
			
			_.bindAll(this, 'render');
			
			this.template = _.template(itemTemplate);
			
			this.model.bind('change', this.render);
	
		},
	
	
		render : function() {
			
			//if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductListItemView.render');
			
			this.$el.html(this.template(this.model.toTemplate()));
			
			this.$selected = this.$('[name="selected"]');
			
			this.$selected.data('id', this.model.id);
			
			this.$selected.iCheck({
				checkboxClass: 'icheckbox_flat'
			});
			
			this.$selected.iCheck(this.model._selected === true ? 'check' : 'uncheck');
			
			return this;
			
		}
		
		
	});
	
	return view;

});