define([
    'underscore',
    'parse',
    
    'proto/view/nested-form',
	'proto/view/nested-view',
    
    'classes/tag/collection',
    'classes/tag/model',
    
    'views/tag/item',
    'views/tag/form',
    
    'controls/list/manager',
    
    'controls/list/filter/enum',
    
    'controls/list/search',
    'controls/list/pagination',
    
    'text!templates/tag/list.html'
], function (
	_, Parse,
	NestedFormProto, NestedViewProto,
	TagCollection, TagModel,
	TagItem, TagForm,
	ManagerControl,
	EnumFilterControl,
	SearchControl, PaginationControl,
	listTemplate
) {
	
	const VIEW = {
		TITLE	 	: 'Tag',
		NAME		: 'TagList',
		ID			: 'tag',
		LIST_EMPTY	: '<tr><td colspan="3">No matching records found</td></tr>'
	};

	var view = Parse.View.extend({
	
		el : '#body',
		
		events : _.unpairs([
			['click [data-action="create"][rel="' + VIEW.ID + '"]'	, 'doShowForm'],
			['click [data-action="update"][rel="' + VIEW.ID + '"]'	, 'doShowForm']
		]),
		
		title : 'Tag list',
		route : 'tag',
	
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.initialize');
	
			_.bindAll(this, 'render', 'fetch', 'refresh', 'addOne', 'addAll', 'beforeFilter', 'doShowForm');
			
			this.form = {};
			this.view = {};
			this.route = 'tag';
	
			this.template = _.template(listTemplate);
			
			this.collection = new TagCollection;
			this.collection.query = new Parse.Query(TagModel);
			this.collection.query.descending('createdAt');
			this.collection.bind('reset', this.addAll);
			
			this.manager = new ManagerControl(this.collection, app.locationManager, false);

			this.manager
			.filter(
				
				'type',
				EnumFilterControl,
				{
					type            : 'Number',
					datasource      : TagModel.prototype.enums('type')
				}
				
			)
			.search('q', SearchControl)
			.pagination('p', PaginationControl)
			.listener(this.refresh);
			
			this.collection.bind('filter:type', this.beforeFilter);

			this.form['tag'] = new TagForm({collection: this.collection});
	
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
			
			this.fetchNestedForm();
			this.manager.invalidate();
			
		},
		
		
		refresh : function (ev) {
			
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
			
			var view = new TagItem({model : model});
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
		
		
		beforeFilter : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.beforeFilter');
			
			this.route = 'tag' + (!_.isNull(this.manager.filter('type').value()) ? '/' + this.manager.filter('type').value() : '');
			app.view.updateMenu(this.route);
				
		},
		
		
		doShowForm : function (ev) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.doShowForm');
			
			var
				$target = $(ev.currentTarget),
				data = $target.data(),
				params = {};
			
			if (type = this.manager.filter('type').value())
				params.type = type;
			
			this.form['tag'].prebuild(data && data.id && (model = this.collection.get(data.id)) ? model : new TagModel(params));
			
			return false;
			
		}
		
	})
	.extend(_.clone(NestedFormProto))
	.extend(_.clone(NestedViewProto));
	
	return view;

});