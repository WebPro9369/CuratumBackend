define([
    'underscore',
    'parse',
    
    'classes/transaction/collection',
    'classes/transaction/model',
    
    'views/user/transaction/item',
    
    //'views/pagination',
    
    'text!templates/user/transaction/list.html'
], function (
	_, Parse,
	TransactionCollection, TransactionModel,
	TransactionItem,
	//PaginationView,
	listTemplate
) {

	var view = Parse.View.extend({
	
		events : {},
		
	
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('TransactionList.initialize');
	
			_.bindAll(this, 'render', 'fetch', 'build', 'addOne', 'addAll');
	
			this.template = _.template(listTemplate);
			
			this.collection = new TransactionCollection;
			this.collection.query = new Parse.Query(TransactionModel);
			this.collection.query.descending('createdAt');
			this.collection.bind('add', this.addOne);
			this.collection.bind('reset', this.addAll);
			
			/*this.pagination = new PaginationView({
				collection	: this.collection
			});*/
	
		},
	
	
		render : function() {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('TransactionList.render');
	
			this.$el.html(this.template());
			
			this.$items = this.$('[role="items"]');
			
			//this.pagination.setElement(this.$('[role="pagination"]')).render();
			
		},
		
		
		fetch : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('TransactionList.fetch');
			
			var self = this;
			
			this.collection.fetch().then(
				
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
		
		
		build : function(model) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('TransactionList.build');
			
			this.model = model;
			
			this.collection.query.equalTo('user', model);
			
			this.fetch();
		
		},
		
		
		addOne : function(model) {
			
			var view = new TransactionItem({model : model});
			this.$items.append(view.render().el);
			
		},
	
	
		addAll : function(collection, filter) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('TransactionList.addAll');
	
			this.$items.html('');

			if (this.collection.length > 0)
				this.collection.each(this.addOne);
				
			else
				this.$items.html('<tr><td colspan="2">No matching records found</td></tr>');
				
		}
		
	});
	
	return view;

});