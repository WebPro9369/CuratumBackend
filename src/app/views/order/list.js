define([
    'underscore',
    'parse',
    
    'proto/view/nested-form',
	'proto/view/nested-view',
    
    'classes/order/collection',
    'classes/order/model',
    
    'views/order/item',
    'views/product/view',
    
    'controls/list/manager',
    
    'controls/list/search',
    'controls/list/pagination',
    'controls/list/theme',
    
    'text!templates/order/list.html'
], function (
	_, Parse,
	NestedFormProto, NestedViewProto,
	OrderCollection, OrderModel,
	OrderItem, ProductView,
	ManagerControl,
	SearchControl, PaginationControl, ThemeControl,
	listTemplate
) {
	
	const VIEW = {
		TITLE	 	: 'Order',
		NAME		: 'OrderList',
		ID			: 'order',
		LIST_EMPTY	: '<tr><td colspan="10">No matching records found</td></tr>'
	};

	var view = Parse.View.extend({
	
		el : '#body',
		
		events : _.unpairs([
			['click [data-action="view"][rel="product"]'	, 'doShowProductView']
		]),
		
		title : 'Order list',
		route : 'order',
		
	
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.initialize');
	
			_.bindAll(this, 'render', 'fetch', 'refresh', 'addOne', 'addAll', 'doShowProductView');
			
			this.form = {};
			this.view = {};
	
			this.template = _.template(listTemplate);
			
			this.collection = new OrderCollection;
			this.collection.query = new Parse.Query(OrderModel);
			this.collection.query.include(['product', 'productSize']);
			this.collection.query.exists('status');
			this.collection.bind('reset', this.addAll);
			
			/*this.search = new SearchView({
				name		: 'q',
				collection	: this.collection,
				fields		: ['name'],
				searchable	: true
			});
			
			this.sorting = new SortingView({
				name		: 's',
				collection	: this.collection,
				fields		: [
					{title: 'Order number', attribute: 'orderNumber'},
					{title: 'Created at', attribute: 'createdAt'},
					{title: 'Name', attribute: 'name'},
					{title: 'Address', attribute: 'address'},
					{title: 'Email', attribute: 'email'},
					{title: 'Zip', attribute: 'zip'},
					{title: 'Item'},
					{title: 'Size'},
					{title: 'Status'},
					{title: 'Old'},
					{title: 'Actions'}
				],
				descending: 'createdAt'
			});
			
			this.pagination = new PaginationView({
				name		: 'p',
				collection	: this.collection
			});*/
			
			this.manager = new ManagerControl(this.collection, app.locationManager, false);
			this.manager
			.search('q', SearchControl)
			.pagination('p', PaginationControl)
			.listener(this.refresh);
			
			this.view['product'] = new ProductView();
	
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
			
			var view = new OrderItem({model : model});
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
		
		
		doShowProductView : function (ev) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.doShowProductView');
			
			var
				$target = $(ev.currentTarget),
				data = $target.data();
			
			if (data && data.id && (model = this.collection.get(data.id)) && model.has('product') && (product = model.get('product')))
				this.productView.build(product);
			
			return false;
			
		}
		
	})
	.extend(_.clone(NestedFormProto))
	.extend(_.clone(NestedViewProto));
	
	return view;

});