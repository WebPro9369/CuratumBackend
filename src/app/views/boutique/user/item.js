define([
    'underscore',
    'parse',
    
    'text!templates/boutique/user/item.html'
], function(
	_, Parse,
	itemTemplate
) {
	
	const VIEW = {
		TITLE	 	: 'User',
		NAME		: 'BoutiqueUserItem',
		ID			: 'boutique-user'
	};
	
	var view = Parse.View.extend({
	
		tagName : 'tr',
	
		events : _.unpairs([
			['click [data-action="remove"][rel="' + VIEW.ID + '"]'		, 'doRemove']
		]),
	
	
		initialize : function(options) {
			
			//if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.initialize');
			
			_.bindAll(this, 'render', 'doRemove');
			
			this.template = _.template(itemTemplate);
			
			this.model.bind('change', this.render);
	
		},
	
	
		render : function() {
			
			//if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.render');
			
			this.$el.html(this.template(_.defaults({}, VIEW, this.model.toTemplate())));
			
			this.$el.attr('data-id', this.model.id);
			
			return this;
			
		},
		
		
		doRemove : function (ev) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.doRemove');
			
			var
				$target = $(ev.currentTarget);
			
			var self = this;
			
			Parse.Cloud.run('adminBoutiqueSecurityUser', {id: this.options.boutiqueId, userToRemove: this.model.get('username')}).then(
				
				function (result) {
					
					self.remove();
					
				},
				function (error) {
					
					app.view.alert(
						self.$el,
						'danger',
						'Failed to unassign ' + VIEW.TITLE,
						error.message,
						false
					);
					
				}
				
			);
			
			return false;
			
		}
		
		
	});
	
	return view;

});