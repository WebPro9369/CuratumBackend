define([
    'underscore',
    'parse',
    
    'proto/view/nested-form',
	'proto/view/nested-view',
    
    'classes/boutique/collection',
    'classes/boutique/model',
    
    'classes/product/collection',
    'classes/product/model',
    
    'views/product/item',
    'views/product/form',
    
    'controls/list/manager',
    
    'controls/list/filter/dictionary',
    
    'controls/list/search-algolia',
    'controls/list/sorting',
    'controls/list/pagination',
    'controls/list/theme',
    
    'text!templates/product/list.html'
], function (
	_, Parse,
	NestedFormProto, NestedViewProto,
	BoutiqueCollection, BoutiqueModel,
	ProductCollection, ProductModel,
	ProductItem, ProductForm,
	ManagerControl,
	DictionaryFilterControl,
	SearchControl, SortingControl, PaginationControl, ThemeControl,
	listTemplate
) {
	
	const VIEW = {
		TITLE	 	: 'Product',
		NAME		: 'ProductList',
		ID			: 'product',
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
		]),
		
		title : 'Product list',
		route : 'product',
		
	
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.initialize');
	
			_.bindAll(this, 'render', 'fetch', 'refresh', 'addOne', 'addAll', 'changeTheme', 'doShowForm');
			
			this.form = {};
			this.view = {};
	
			this.template = _.template(listTemplate);
			
			this.collection = new ProductCollection;
			this.collection.query = new Parse.Query(ProductModel);
			this.collection.query.select(['curationDate', 'title', 'detailImage', 'priceFrom', 'priceTill', 'quantity', 'published']);
			this.collection.query.include('image');
			this.collection.bind('reset', this.addAll);
			
			this.manager = new ManagerControl(this.collection, app.locationManager, false);
			this.manager
			.search('q', SearchControl, {indexName: 'Product'})
			.sorting(
				
				's',
				SortingControl,
				{
					fields		: [
						{title: 'Date'			, attribute: 'curationDate'			, css: 'col-md-1'},
						{title: 'Product name'	, attribute: 'title'				, css: 'col-md-6'},
						{title: 'Price'												, css: 'col-md-2'},
						{title: 'Available'		, attribute: 'quantity'				, css: 'col-md-1'},
						{title: 'Published'											, css: 'col-md-1'},
						{title: 'Actions'											, css: 'col-md-1'}
					],
					value	: '-createdAt'
				}
				
			)
			.pagination('p', PaginationControl)
			.theme('theme', ThemeControl, null, THEME_TYPE_TABLE)
			.listener(this.refresh);
			
			this.collection.bind('theme', this.changeTheme);
			
			this.form['product'] = new ProductForm({
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
			
			var view = new ProductItem({model : model, theme: this.manager.theme().value(), tagName: this.manager.theme().value('tagName')});
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
				data = $target.data(),
				params = {};
			
			// TODO implement global boutique
			//params.boutique = app.view.globalBoutique();
			
			this.form['product'].prebuild(data && data.id && (model = this.collection.get(data.id)) ? model : new ProductModel(params));
			
			return false;
			
		}
		
	})
	.extend(_.clone(NestedFormProto))
	.extend(_.clone(NestedViewProto));
	
	return view;

});