define([
    'jquery',
    'underscore',
    'parse',
    
    'collections/timeline',
    'models/timeline',
    
    'views/product/timeline/list/item',
    
    'text!templates/product/timeline/list.html'
], function (
	$, _, Parse,
	TimelineCollection, TimelineModel,
	ItemView,
	listTemplate
) {

	var view = Parse.View.extend({
	
		events : {},
		
		_selected: null,
		
	
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('TimelineListView.initialize');
	
			_.bindAll(this, 'render', 'fetch', 'addOne', 'addAll', 'refresh', 'apply');
			
			this._selected = [];
			this.model = null;
	
			this.template = _.template(listTemplate);
			
			this.collection = new TimelineCollection;
			this.collection.query = new Parse.Query(TimelineModel);
			this.collection.query.notEqualTo('isMain', true);
			this.collection.query.limit(1000);
			this.collection.query.ascending('timelineTitle');
			this.collection.bind('add', this.addOne);
			this.collection.bind('reset', this.addAll);
			
		},
	
	
		render : function() {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('TimelineListView.render');
	
			this.$el.html(this.template());
			
			this.$items = this.$('[role="items"]');

		},
		
		
		fetch : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('TimelineListView.fetch');
			
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
		
		
		addOne : function(model) {
			
			var view = new ItemView({model : model});
			
			if (this.model instanceof Parse.Object)
				model._selected = _.contains(_.map(model.get('productArray') || [], function (product) {return product.id;}), this.model.id);
				
			this.$items.append(view.render().el);
			
		},
	
	
		addAll : function(collection, filter) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('TimelineListView.addAll');
	
			this.$items.html('');
			
			if (this.collection.length > 0)
				this.collection.each(this.addOne);
				
			else
				this.$items.html('<tr><td colspan="3">No matching records found</td></tr>');
			
		},
		
		
		refresh : function (model) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('TimelineListView.refresh');
			
			this.collection.each(function (timeline) {
				timeline.select(_.contains(_.map(timeline.get('productArray') || [], function (product) {return product.id;}), model.id));
			});
			
		},
		
		
		apply : function (model) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('TimelineListView.apply');
			
			var promises = [];
			
			this.collection.each(function (timeline) {
				
				var changed = true;
				var before = _.map(timeline.get('productArray') || [], function (product) {return product.id;});
				
				if (timeline._selected === true && !_.contains(before, model.id)) {
					
					timeline.addUnique('productArray', model._toPointer());
					
				} else if (timeline._selected !== true && _.contains(before, model.id)) {
					
					timeline.remove('productArray', model._toPointer())
					
				} else
					changed = false;
					
				if (changed)
					promises.push(timeline.save());

			});
			
			return Parse.Promise.when(promises);
			
		}
		
		
	});
	
	return view;

});