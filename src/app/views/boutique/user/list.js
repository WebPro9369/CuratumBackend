define([
    'underscore',
    'parse',
    
	'proto/view/nested-form',
	'proto/view/nested-view',
    
    'classes/user/collection',
    'classes/user/model',
    
    './item',
    
    'text!templates/boutique/user/list.html'
], function (
	_, Parse,
	NestedFormProto, NestedViewProto,
	UserCollection, UserModel,
	UserItem,
	listTemplate
) {
	
	const VIEW = {
		TITLE	 	: 'User',
		NAME		: 'BoutiqueUserList',
		ID			: 'boutique-user',
		LIST_EMPTY	: '<tr role="empty-list"><td colspan="3">No matching records found</td></tr>'
	};

	var view = Parse.View.extend({
	
		events : _.unpairs([
			['click [data-action="security"][rel="' + VIEW.ID + '"]'	, 'doToggleSecurity'],
			['click [data-action="create"][rel="' + VIEW.ID + '"]'		, 'doUserAdd']
		]),
		
		title : 'Boutique list',
		route : 'boutique',
		
	
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.initialize');
	
			_.bindAll(this, 'render', 'assign', 'addOne', 'removeOne', 'addAll', 'updateAll', 'updateEnabled', 'doToggleSecurity', 'doUserAdd');
			
			this.form = {};
			this.view = {};
			
			this.enabled = null;
	
			this.template = _.template(listTemplate);
			
			this.collection = new UserCollection;
			this.collection.query = new Parse.Query(UserModel);
			this.collection.bind('add', this.addOne);
			this.collection.bind('remove', this.removeOne);
			this.collection.bind('reset', this.addAll);
	
		},
	
	
		render : function() {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.render');
	
			this.$el.html(this.template(VIEW));
			
			this.$items = this.$('[role="items"]');
			this.$enabled = this.$('[data-enabled]');
			
			this.$username = this.$('[name="username"][data-form="' + VIEW.ID + '"]')
			
			this.renderNestedForm();
			this.renderNestedView();
			
			this.updateEnabled(null);
			
		},
		
		
		assign : function(model) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.fetch');
			
			this.model = model;
			
			if (this.model.isNew())
				return Parse.Promise.as();
			
			var self = this;
			
			return Parse.Cloud.run('adminBoutiqueSecurityUser', {id: this.model.id}).then(
				
				function (users) {

					if (users === false) {
						
						self.updateEnabled(false);
						self.collection.reset();
						
					} else {
						
						self.updateEnabled(true);
						self.collection.reset(users);
						
					}
				},
				function (error) {
					
					app.view.alert(
						self.$el,
						'danger',
						'Failed to get list items',
						error.message,
						false
					);
					
				}
				
			);
			
		},
		
		
		addOne : function(model) {
			
			this.updateAll();
			
			var view = new UserItem({model : model, boutiqueId: this.model.id});
			this.$items.append(view.render().el);
			
		},
		
		
		removeOne : function(model) {
			
			this.updateAll();
			
		},
	
	
		addAll : function(collection, filter) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.addAll');
			
			this.$items.html('');
			
			if (this.collection.length > 0)
				this.collection.each(this.addOne);
			
			else
				this.updateAll();
				
		},
		
		
		updateAll : function () {
			
			if (this.collection.length > 0)
				this.$items.find('[role="empty-list"]').remove();
			else
				this.$items.html(VIEW.LIST_EMPTY);
			
		},
		
		
		updateEnabled : function (value) {
			
			this.enabled = value;
			
			if (this.enabled === true) {
				
				this.$enabled.filter('[data-enabled="true"]').show();
				this.$enabled.filter('[data-enabled="false"]').hide();
				
			} else if (this.enabled === false) {
				
				this.$enabled.filter('[data-enabled="false"]').show();
				this.$enabled.filter('[data-enabled="true"]').hide();
				
			} else
				this.$enabled.hide();
				
			
		},
		
		
		doToggleSecurity : function (ev) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.doToggleSecurity');
			
			var
				$target = $(ev.currentTarget),
				data = $target.data();
			
			var self = this;
			
			Parse.Cloud.run('adminBoutiqueSecurity', {id: this.model.id, enabled: data.value}).then(
				
				function (result) {
					
					console.log(result);
					
					app.view.alert(
						self.$el,
						'success',
						'',
						'Security successfully ' + (result ? 'enabled' : 'disabled'),
						3000
					);
					
					self.collection.reset();
					self.updateEnabled(result);
					
				},
				function (error) {
					
					app.view.alert(
						self.$el,
						'danger',
						'Failed to toggle security',
						error.message,
						false
					);
					
				}
				
			);
			
			return false;
			
		},
		
		
		doUserAdd : function () {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.doUserAdd');
			
			var self = this;
			
			Parse.Cloud.run('adminBoutiqueSecurityUser', {id: this.model.id, userToAdd: this.$username.val()}).then(
				
				function (result) {
					
					if (self.collection.get(result.id))
						app.view.alert(
							self.$el,
							'info',
							'',
							'User already added',
							false
						);
					
					else
						self.collection.add(result);
					
				},
				function (error) {
					
					app.view.alert(
						self.$el,
						'danger',
						'Failed to assign ' + VIEW.TITLE,
						error.message,
						false
					);
					
				}
				
			);
			
			return false;
			
		}
		
	})
	.extend(_.clone(NestedFormProto))
	.extend(_.clone(NestedViewProto));
	
	return view;

});