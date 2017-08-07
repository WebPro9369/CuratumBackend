define([
    'underscore',
    'parse',
    
    'proto/view/nested-form',
	'proto/view/nested-view',
    
    'classes/product-unit-type/collection',
    'classes/product-unit-type/model',
    
    'views/product-unit-type/item',
    'views/product-unit-type/form',
    
    'controls/list/manager',
    
    'controls/list/search',
    'controls/list/pagination',
    
    'text!templates/product-unit-type/list.html'
], function (
	_, Parse,
	NestedFormProto, NestedViewProto,
	ProductUnitTypeCollection, ProductUnitTypeModel,
	ProductUnitTypeItem, ProductUnitTypeForm,
	ManagerControl,
	SearchControl, PaginationControl,
	listTemplate
) {
	
	const VIEW = {
		TITLE	 	: 'SKU Type',
		NAME		: 'ProductUnitTypeList',
		ID			: 'product-unit-type',
		LIST_EMPTY	: '<tr><td colspan="4">No matching records found</td></tr>'
	};

	var view = Parse.View.extend({
	
		el : '#body',
		
		events : _.unpairs([
			['click [data-action="create"][rel="' + VIEW.ID + '"]'	, 'doShowForm'],
			['click [data-action="update"][rel="' + VIEW.ID + '"]'	, 'doShowForm']
		]),
		
		title : 'SKU type list',
		route : 'product/product-unit-type',
	
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.initialize');
	
			_.bindAll(this, 'render', 'fetch', 'refresh', 'addOne', 'addAll', 'doShowForm');
			
			this.form = {};
			this.view = {};
	
			this.template = _.template(listTemplate);
			
			this.collection = new ProductUnitTypeCollection;
			this.collection.query = new Parse.Query(ProductUnitTypeModel);
			this.collection.query.select(['code', 'title', 'published']);
			this.collection.query.descending('createdAt');
			this.collection.bind('reset', this.addAll);
			
			this.manager = new ManagerControl(this.collection, app.locationManager, false);

			this.manager
			.search('q', SearchControl)
			.pagination('p', PaginationControl)
			.listener(this.refresh);

			this.form['product-unit-type'] = new ProductUnitTypeForm({collection: this.collection});
	
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
			
			var view = new ProductUnitTypeItem({model : model});
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
			
			this.form['product-unit-type'].prebuild(data && data.id && (model = this.collection.get(data.id)) ? model : new ProductUnitTypeModel({}));
			
			return false;
			
		}
		
	})
	.extend(_.clone(NestedFormProto))
	.extend(_.clone(NestedViewProto));
	
	return view;

});