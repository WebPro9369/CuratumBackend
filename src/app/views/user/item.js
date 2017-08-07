define([
    'underscore',
    'numeral',
    'parse',
    
    'text!templates/user/item.html'
], function(
	_, numeral, Parse,
	itemTemplate
) {
	
	const VIEW = {
		TITLE	 	: 'User',
		NAME		: 'UserItem',
		ID			: 'user'
	};
	
	var view = Parse.View.extend({
	
		tagName : 'tr',
	
		events : {},
	
	
		initialize : function() {
			
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