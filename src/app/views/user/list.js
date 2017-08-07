define([
    'underscore',
    'parse',
    
    'proto/view/nested-form',
	'proto/view/nested-view',
    
    'classes/timeline/collection',
    'classes/timeline/model',
    
    'classes/user/collection',
    'classes/user/model',
    
    'views/user/item',
    'views/user/form',
    'views/user/view',
    
    'controls/list/manager',
    
    'controls/list/filter/dictionary',
    'controls/list/search',
    'controls/list/pagination',
    'controls/list/theme',
    
    'text!templates/user/list.html'
], function (
	_, Parse,
	NestedFormProto, NestedViewProto,
	TimelineCollection, TimelineModel,
	UserCollection, UserModel,
	UserItem, UserForm, UserView,
	ManagerControl,
	DictinaryFilterControl, SearchControl, PaginationControl, ThemeControl,
	listTemplate
) {
	
	const VIEW = {
		TITLE	 	: 'User',
		NAME		: 'UserList',
		ID			: 'user',
		LIST_EMPTY	: '<tr><td colspan="5">No matching records found</td></tr>'
	};

	var view = Parse.View.extend({
	
		el : '#body',
		
		events : _.unpairs([
			['click [data-action="update"][rel="' + VIEW.ID + '"]'				, 'doShowForm'],
			['click [data-action="view"][rel="' + VIEW.ID + '"]'				, 'doShowView']
		]),
		
		title : 'User list',
		route : 'user',
		
	
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.initialize');
	
			_.bindAll(this, 'render', 'fetch', 'refresh', 'addOne', 'addAll', 'doShowForm', 'doShowView');
			
			this.form = {};
			this.view = {};
	
			this.template = _.template(listTemplate);
			
			this.collection = new UserCollection;
			this.collection.query = new Parse.Query(UserModel);
			this.collection.query.descending('createdAt');
			this.collection.bind('reset', this.addAll);
			
			this.manager = new ManagerControl(this.collection, app.locationManager, false);
			this.manager
			.filter(
				
				'timelineViewed',
				DictinaryFilterControl,
				{
					Collection	: TimelineCollection,
					Model		: TimelineModel,
					beforeFetch	: function (query) {
						query.ascending('subject');
						query.limit(1000);
					}
				}
				
			)
			.search('q', SearchControl)
			.pagination('p', PaginationControl)
			.listener(this.refresh);
			
			/*this.search = new SearchView({
				name		: 'q',
				collection	: this.collection,
				field		: 'username',
				placeholder	: 'Username ...'
			});*/
			
			/*this.filter.timelineViewed = new FilterView({
				name		: 'timelineViewed',
				collection	: this.collection,
				Collection	: TimelineCollection,
				Model		: TimelineModel,
				order		: {
					timelineTitle	: true
				},
				text		: 'timelineTitle'
			});*/
			
			/*this.pagination = new PaginationView({
				name		: 'p',
				collection	: this.collection
			});*/
			
			this.form['user'] = new UserForm({
				collection	: this.collection
			});
			
			this.view['user'] = new UserView({
				collection	: this.collection
			});
	
		},
	
	
		render : function() {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.render');
	
			this.$el.html(this.template(VIEW));
			
			this.$items = this.$('[role="items"]');
			
			this.manager.render(this);
			
			this.renderNestedForm();
			this.renderNestedView();
			
		},
		
		
		fetch : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.fetch');
			
			this.manager.invalidate();
			
		},
		
		
		refresh : function () {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.refresh');
			
			return this.manager.fetch().then(
				
				null,
				function (error) {
					
					app.view.alert(
						null,
						'danger',
						'Failed to get list items',
						error.message,
						false
					);
					
				}
			
			);
			
		},
		
		
		addOne : function(model) {
			
			var view = new UserItem({model : model});
			this.$items.append(view.render().el);
			
		},
	
	
		addAll : function(collection, filter) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.addAll');
	
			this.$items.html('');

			if (this.collection.length > 0)
				this.collection.each(this.addOne);
				
			else
				this.$items.html(VIEW.LIST_EMPTY);
				
		},
		
		
		doShowForm : function (ev) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.doShowForm');
			
			var
				$target = $(ev.currentTarget),
				data = $target.data();
			
			if (data && data.id && (model = this.collection.get(data.id)))
				this.form.user.build(model);
			
			return false;
			
		},
		
		
		doShowView : function (ev) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.doShowView');
			
			var
				$target = $(ev.currentTarget),
				data = $target.data();
			
			if (data && data.id && (model = this.collection.get(data.id)))
				this.view.user.build(model);
			
			return false;
			
		}
		
	})
	.extend(_.clone(NestedFormProto))
	.extend(_.clone(NestedViewProto));
	
	return view;

});