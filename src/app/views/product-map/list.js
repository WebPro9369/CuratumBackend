define([
    'underscore',
    'parse',
    
    'classes/product-map/collection',
    'classes/product-map/model',
    
    'classes/tag/collection',
    'classes/tag/model',
    
    './item',
    
    'text!templates/product-map/list.html'
], function (
	_, Parse,
	ProductMapCollection, ProductMapModel,
	TagCollection, TagModel,
	ItemView,
	listTemplate
) {
	
	const VIEW = {
		TITLE	 	: 'Product Map',
		NAME		: 'ProductMapList',
		ID			: 'product-map',
		LIST_EMPTY	: _.unpairs([
			[THEME_TYPE_TABLE	, '<tr><td colspan="3">No matching records found</td></tr>'],
			[THEME_TYPE_GALLERY	, '<div class="col-md-12"><div class="thumbnail"><div class="caption">No matching records found</div></div></div>'] 
		])
	};

	var view = Parse.View.extend({
	
		el : '#body',
		
		events : {
		},
		
		title : 'Product map list',
		route : 'product/product-map',
		
	
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.initialize');
	
			_.bindAll(this, 'render', 'fetch', 'addOne', 'addAll');
			
			this.tags = {};
			
			this.template = _.template(listTemplate);
			
			this.tags = new TagCollection;
			this.tags.query = new Parse.Query(TagModel);
			this.tags.query.containedIn('type', [TAG_TYPE_ARCHETYPE, TAG_TYPE_WEATHER, TAG_TYPE_OCCASION]);
			this.tags.query.limit(1000);
			
			this.collection = new ProductMapCollection;
			this.collection.query = new Parse.Query(ProductMapModel);
			/*if (this.type)
				this.collection.query.equalTo('type', this.type);*/
			this.collection.query.limit(1000);
			this.collection.bind('add', this.addOne);
			this.collection.bind('reset', this.addAll);
			
		},
	
	
		render : function() {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.render');
	
			this.$el.html(this.template());
			
			this.$map = this.$('[role="map"]');
			this.$header = this.$('[role="header"]');
			this.$items = this.$('[role="items"]');
			
		},
		
		
		fetch : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.fetch');
			
			var self = this;
			
			Parse.Promise.as().then(
				
				function () {
					
					return self.tags.fetch();
					
				}
				
			).then(
				
				function () {
					
					return self.collection.fetch();
					
				}
				
			).then(
				
				function () {
					
					//self.collection.trigger('pagination.recount');
					
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
			this.$items.append(view.render().el);
			
		},
	
	
		addAll : function(collection, filter) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.addAll');
			
			this.$header.html('<th class="col-md-1"></th>');
			this.$items.html();
			
			var
				archetypeTags = this.tags.filterByType(TAG_TYPE_ARCHETYPE),
				occasionTags = this.tags.filterByType(TAG_TYPE_OCCASION),
				archetypeCells = [];
			
			_.each(
				archetypeTags,
				function (model) {
					this.$header.append('<th class="col-md-1">' + (model.get('value').en || '&mdash;') + '</th>');
					archetypeCells.push('<td data-archetype-id="' + model.id + '"></td>');
				},
				this
			);
			
			_.each(
				occasionTags,
				function (model) {
					//this.$header.append('<th class="col-md-1">' + (model.get('value') || '&mdash;') + '</th>');
					this.$items.append('<tr data-occasion-id="' + model.id + '"><th>' + (model.get('value').en || '&mdash;') + '</th>' + archetypeCells.join('') + '</tr>');
				},
				this
			);
				
		}
		
	});
	
	return view;

});