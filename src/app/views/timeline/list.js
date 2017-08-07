define([
    'underscore',
    'parse',
    
    'proto/view/nested-form',
	'proto/view/nested-view',
    
    'classes/timeline/collection',
    'classes/timeline/model',
    
    'views/timeline/item',
    'views/timeline/form',
    //'views/timeline/draw/form',
    
    'controls/list/manager',
    
    'controls/list/filter/enum',
    
    'controls/list/search-algolia',
    'controls/list/pagination',
    'controls/list/theme',
    
    'text!templates/timeline/list.html'
], function (
	_, Parse,
	NestedFormProto, NestedViewProto,
	TimelineCollection, TimelineModel,
	TimelineItem, TimelineForm, //TimelineDrawForm,
	ManagerControl,
	EnumFilterControl,
	SearchControl, PaginationControl, ThemeControl,
	listTemplate
) {
	
	const VIEW = {
		TITLE	 	: 'Timeline',
		NAME		: 'TimelineList',
		ID			: 'timeline',
		LIST_EMPTY	: _.unpairs([
			[THEME_TYPE_TABLE	, '<tr><td colspan="6">No matching records found</td></tr>'],
			[THEME_TYPE_GALLERY	, '<div class="col-md-12"><div class="thumbnail"><div class="caption">No matching records found</div></div></div>'] 
		])
	};

	var view = Parse.View.extend({
	
		el : '#body',
		
		events : _.unpairs([
			['click [data-action="create"][rel="' + VIEW.ID + '"]'	, 'doShowForm'],
			['click [data-action="update"][rel="' + VIEW.ID + '"]'	, 'doShowForm'],
			['click [data-action="draw"][rel="' + VIEW.ID + '"]'	, 'doShowDrawForm']
		]),
		
		title : 'Timeline list',
		route : 'timeline',
		
	
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.initialize');
	
			_.bindAll(this, 'render', 'fetch', 'refresh', 'addOne', 'addAll', 'beforeFilter', 'changeTheme', 'doShowForm', 'doShowDrawForm');
			
			this.form = {};
			this.view = {};
			this.route = 'timeline';
	
			this.template = _.template(listTemplate);
			
			this.collection = new TimelineCollection;
			this.collection.query = new Parse.Query(TimelineModel);
			this.collection.query.select(['subject', 'type', 'image', 'primary', 'private', 'published']);
			this.collection.query.descending('createdAt');
			this.collection.bind('reset', this.addAll);
			
			this.manager = new ManagerControl(this.collection, app.locationManager, false);
			this.manager
			.filter(
				
				'type',
				EnumFilterControl,
				{
					type            : 'Number',
					datasource      : TimelineModel.prototype.enums('type')
				}
				
			)
			.search('q', SearchControl, {indexName: 'Timeline'})
			.pagination('p', PaginationControl)
			.theme('theme', ThemeControl, null, THEME_TYPE_TABLE)
			.listener(this.refresh);
			
			this.collection.bind('filter:type', this.beforeFilter);
			
			this.collection.bind('theme', this.changeTheme);
			
			this.form['timeline'] = new TimelineForm({collection: this.collection});
			
			/*this.form['draw'] = new TimelineDrawForm({
				collection	: this.collection
			});*/
	
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
			
			var view = new TimelineItem({model : model, theme: this.manager.theme().value(), tagName: this.manager.theme().value('tagName')});
			this.$items.append(view.render().el);
			view.updateHeight();
			
		},
	
	
		addAll : function(collection, filter) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.addAll');
	
			this.$items.html('');

			if (this.collection.length > 0)
				this.collection.each(this.addOne);
				
			else
				this.$items.html(VIEW.LIST_EMPTY[this.manager.theme().value()]);
				
		},
		
		
		beforeFilter : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.beforeFilter');
			
			this.route = 'timeline' + (!_.isNull(this.manager.filter('type').value()) ? '/' + this.manager.filter('type').value() : '');
			app.view.updateMenu(this.route);
				
		},
		
		
		changeTheme : function () {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.changeTheme');
			
			if (this.manager.theme().value() === THEME_TYPE_GALLERY)
				this.$items.parent().addClass('table-theme-gallery');
			else
				this.$items.parent().removeClass('table-theme-gallery');
			
			this.addAll();
				
		},
		
		
		doShowForm : function (ev) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.doShowForm');
			
			var
				$target = $(ev.currentTarget),
				data = $target.data(),
				params = {};
			
			if (type = this.manager.filter('type').value())
				params.type = type;
			
			this.form['timeline'].prebuild(data && data.id && (model = this.collection.get(data.id)) ? model : new TimelineModel(params));
			
			return false;
			
		},
		
		
		doShowDrawForm : function (ev) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.doShowDrawForm');
			
			var
				$target = $(ev.currentTarget),
				data = $target.data();
			
			if (data && data.id && (model = this.collection.get(data.id)))
				this.drawForm.build(model);
			
			return false;
			
		}
		
	})
	.extend(_.clone(NestedFormProto))
	.extend(_.clone(NestedViewProto));
	
	return view;

});