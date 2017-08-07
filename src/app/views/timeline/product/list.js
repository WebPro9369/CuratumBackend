define([
    'jquery',
    'underscore',
    'parse',
    
    'collections/boutique',
    'models/boutique',
    
    'collections/product',
    'models/product',
    
    'views/timeline/product/list/item',
    
    'views/search',
    'views/filter',
    'views/sorting',
    'views/pagination',
    
    'text!templates/timeline/product/list.html'
], function (
	$, _, Parse,
	BoutiqueCollection, BoutiqueModel,
	ProductCollection, ProductModel,
	ItemView,
	SearchView, FilterView, SortingView, PaginationView,
	listTemplate
) {

	var view = Parse.View.extend({
	
		events : {
			'ifChanged [name="selected"]'		: 'doSelect'
		},
		
		_selected: null,
		
	
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductListView.initialize');
	
			_.bindAll(this, 'render', 'fetch', 'addOne', 'addAll', 'selected', 'doSelect');
			
			this._selected = [];
			this.filter = {};
	
			this.template = _.template(listTemplate);
			
			this.collection = new ProductCollection;
			this.collection.query = new Parse.Query(ProductModel);
			this.collection.query.include(['boutique', 'brand', 'interview']);
			this.collection.bind('add', this.addOne);
			this.collection.bind('reset', this.addAll);
			
			this.filter.boutique = new FilterView({
				name		: 'boutique',
				collection	: this.collection,
				Collection	: BoutiqueCollection,
				Model		: BoutiqueModel,
				order		: {
					boutiqueName	: true
				},
				text		: 'boutiqueName'
			});
			
			this.search = new SearchView({
				collection	: this.collection
			});
			
			this.sorting = new SortingView({
				collection	: this.collection,
				fields		: [
					{title: ''},
					{title: 'Date', attribute: 'curationDate'},
					{title: 'Boutique'},
					{title: 'Product name', attribute: 'productName'},
					{title: 'Price', attribute: 'price'},
					{title: 'Available', attribute: 'quantityAvailable'},
					{title: 'Size'},
					{title: 'Brand', attribute: 'brandName'},
					{title: 'Category', attribute: 'category'}
				],
				descending: 'createdAt'
			});
			
			this.pagination = new PaginationView({
				collection	: this.collection
			});
			
		},
	
	
		render : function() {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductListView.render');
			
			this.$el.html(this.template());
			
			this.$items = this.$('[role="items"]');
			
			_.each(this.filter, function (filter, name) {
				
				filter.setElement(this.$('[role="filter"] [name="' + name + '"]'));
				
			}, this);

			this.search.setElement(this.$('[role="search"]')).render();
			this.sorting.setElement(this.$('[role="sorting"]')).render();
			this.pagination.setElement(this.$('[role="pagination"]')).render();
			
		},
		
		
		fetch : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductListView.fetch');
			
			var self = this;
			
			var promises = [];
			
			_.each(this.filter, function (filter, name) {
				
				promises.push(filter.fetch());
				
			});
			
			var promise = Parse.Promise.when(promises).then(
				
				function () {
				
					_.each(self.filter, function (filter, name) {
				
						filter.apply();
						
					});
					
					return self.collection.fetch();
					
				}
				
			).then(
			
				function () {
					
					self.collection.trigger('pagination.recount');
					
				},
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
			
			model.select(_.contains(this._selected, model.id));
			var view = new ItemView({model : model});
			this.$items.append(view.render().el);
			
		},
	
	
		addAll : function(collection, filter) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductListView.addAll');
	
			this.$items.html('');
			
			if (this.collection.length > 0)
				this.collection.each(this.addOne);
				
			else
				this.$items.html('<tr><td colspan="9">No matching records found</td></tr>');
			
		},
		
		
		selected : function (items) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductListView.selected');
			
			if (_.isArray(items)) {
				
				this._selected = items;
				
				this.collection.each(function (model) {
					model.select(_.contains(this._selected, model.id));
				}, this);
			
			} else {
				
				var items = _.map(this._selected, function (id) {
					
					var
						model = ProductModel.createWithoutData(id),
						value = model._toPointer(),
						model = null;
					return value;
					
				});
				
				return items;
				
			}
			
		},
		
		
		doSelect : function(ev) {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductListView.doSelect');
			
			var
				$target = $(ev.currentTarget),
				data = $target.data(),
				selected = $target.prop('checked');
			
			if (selected === true && !_.contains(this._selected, data.id))
				this._selected.push(data.id);
			
			else if (selected !== true && _.contains(this._selected, data.id))
				this._selected = _.without(this._selected, data.id);
			
			return false;
			
		}
		
		
	});
	
	return view;

});