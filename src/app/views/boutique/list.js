define([
    'underscore',
    'parse',
    
	'proto/view/nested-form',
	'proto/view/nested-view',
    
    'classes/boutique/collection',
    'classes/boutique/model',
    
    'views/boutique/item',
    'views/boutique/form',
    
    'controls/list/manager',
    
    'controls/list/search-algolia',
    'controls/list/pagination',
    'controls/list/theme',
    
    'text!templates/boutique/list.html'
], function (
	_, Parse,
	NestedFormProto, NestedViewProto,
	BoutiqueCollection, BoutiqueModel,
	BoutiqueItem, BoutiqueForm,
	ManagerControl,
	SearchControl, PaginationControl, ThemeControl,
	listTemplate
) {
	
	const VIEW = {
		TITLE	 	: 'Boutique',
		NAME		: 'BoutiqueList',
		ID			: 'boutique',
		LIST_EMPTY	: _.unpairs([
			[THEME_TYPE_TABLE	, '<tr><td colspan="4">No matching records found</td></tr>'],
			[THEME_TYPE_GALLERY	, '<div class="col-md-12"><div class="thumbnail"><div class="caption">No matching records found</div></div></div>'] 
		])
	};

	var view = Parse.View.extend({
	
		el : '#body',
		
		events : _.unpairs([
			['click [data-action="create"][rel="' + VIEW.ID + '"]'	, 'doShowForm'],
			['click [data-action="update"][rel="' + VIEW.ID + '"]'	, 'doShowForm']
		]),
		
		title : 'Boutique list',
		route : 'boutique',
		
	
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.initialize');
	
			_.bindAll(this, 'render', 'fetch', 'refresh', 'addOne', 'addAll', 'changeTheme', 'doShowForm');
			
			this.form = {};
			this.view = {};
	
			this.template = _.template(listTemplate);
			
			this.collection = new BoutiqueCollection;
			this.collection.query = new Parse.Query(BoutiqueModel);
			this.collection.query.select(['title', 'logo', 'published']);
			this.collection.query.include('logo');
			this.collection.query.descending('createdAt');
			this.collection.bind('reset', this.addAll);
			
			this.manager = new ManagerControl(this.collection, app.locationManager, false);
			this.manager
			.search('q', SearchControl, {indexName: 'Boutique'})
			.pagination('p', PaginationControl)
			.theme('theme', ThemeControl, null, THEME_TYPE_TABLE)
			.listener(this.refresh);
			
			this.collection.bind('theme', this.changeTheme);
			
			this.form['boutique'] = new BoutiqueForm({collection	: this.collection});
	
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
			
			var view = new BoutiqueItem({model : model, theme: this.manager.theme().value(), tagName: this.manager.theme().value('tagName')});
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
				data = $target.data();
			
			this.form['boutique'].prebuild(data && data.id && (model = this.collection.get(data.id)) ? model : new BoutiqueModel());
			
			return false;
			
		}
		
	})
	.extend(_.clone(NestedFormProto))
	.extend(_.clone(NestedViewProto));
	
	return view;

});