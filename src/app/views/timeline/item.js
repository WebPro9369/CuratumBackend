define([
    'underscore',
    'parse',
    
    'text!templates/timeline/item.html'
], function(
	_, Parse,
	itemTemplate
) {
	
	const VIEW = {
		TITLE	 	: 'Timeline',
		NAME		: 'TimelineItem',
		ID			: 'timeline'
	};
	
	var view = Parse.View.extend({
	
		tagName : 'tr',
	
		events : {},
	
	
		initialize : function() {
			
			//if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.initialize');
			
			_.bindAll(this, 'render', 'updateHeight');
			
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
			
		}
		
		
	});
	
	return view;

});