define([
    'jquery',
    'underscore',
    'numeral',
    'parse',
    
    'text!templates/timeline/draw/user/item.html'
], function(
	$, _, numeral, Parse,
	itemTemplate
) {
	
	var view = Parse.View.extend({
	
		tagName : 'tr',
	
		events : {},
	
	
		initialize : function() {
			
			//if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('UserItem.initialize');
			
			_.bindAll(this, 'render');
			
			this.template = _.template(itemTemplate);
			
			this.model.bind('change', this.render);
	
		},
	
	
		render : function() {
			
			//if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('UserItem.render');
			
			this.$el.html(this.template(this.model.toTemplate()));
			
			return this;
			
		}
		
		
	});
	
	return view;

});