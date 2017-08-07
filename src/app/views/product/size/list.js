define([
    'jquery',
    'underscore',
    'parse',
    
    'collections/product-size',
    'models/product-size',
    
    'views/product/size/list/item',
    
    'text!templates/product/size/list.html',
    
    'jquery-ui'/*,
    'select2'*/
], function (
	$, _, Parse,
	ProductSizeCollection, ProductSizeModel,
	ItemView,
	listTemplate
) {

	var view = Parse.View.extend({
	
		events : {
			/*'change [name="sizePreset"]'						: 'doChangeSizePreset',
			'click [data-action="product-size-preset-append"]'	: 'doSizePresetAppend',*/
			'click [data-action="product-size-create"]'			: 'doSizeCreate'
		},
		
		/*presets : {
			'Preset 1 (XXXS - XXXL)' : ['XXXS','XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
			'Preset 2' : ['2', '4', '6', '8', '10', '12'],
			'Preset 3' : ['15', '15 &frac12', '15 &frac34', '16', '16 &frac12', '17']
		},*/
		
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductSizeListView.initialize');
	
			_.bindAll(this, 'render', 'order', 'total', 'addSizeModel', 'removeSizeModel', 'updateSizeModel', 'resetSizeCollection', 'updateSizeCollection', 'doSizeCreate', 'makeSizeCreate', 'makeSizeUpdate');
	
			this.template = _.template(listTemplate);
			
			this.parent = options.parent || null;
			
			this.limit = options.limit > 0 ? options.limit : 1;
			
			this.type = options.type === 'form' ? 'form' : 'view';
			
			this.sortable = options.sortable === true;
			
			this.sort = [];
			
			this.collection = new ProductSizeCollection;
			this.collection.bind('add', this.addSizeModel);
			this.collection.bind('remove', this.removeSizeModel);
			this.collection.bind('update', this.updateSizeModel);
			this.collection.bind('reset', this.resetSizeCollection);
			
		},
		
		
		order : function(order) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductSizeListView.order');
			
			if (order) {
				this.sort = order;
				return;
			}
			
			if (this.type === 'form' && this.sortable) {
				
				return _
					.chain(this.$items.sortable('toArray', {attribute: 'data-id'}))
					.map(function (cid) {
						
						return (model = this.getByCid(cid)) && model.has('title') ? model.get('title') : null;
						
					}, this.collection)
					.compact()
					.value();
				
			} else
				return [];
			
		},
		
		
		total : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductSizeListView.order');
			
			return this.collection.total();
			
		},
	
	
		render : function() {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductSizeListView.render');
	
			this.$el.html(this.template());
			
			this.$items = this.$('[role="items"]');
			
			if (this.type === 'form') {
				
				if (this.sortable) {
					
					this.$items.sortable({
						items	: '> [data-id]',
						handle	: '.sortable-handle',
						cursor	: 'move'
					});
		    		this.$('.sortable-handle').disableSelection();
		    		
		    	}
		    	
		    	/*this.$sizePreset = this.$('[name="sizePreset"]');
		    	
		    	this.$sizePreset.select2({
		    		placeholder	: 'Select size preset',
					data		: _.map(this.presets, function (sizes, key) {return {id: key, text: key};}),
					allowClear	: true
				});*/
			
			}
			
		},
		
		
		build : function (query) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductSizeListView.build');
			
			if (query instanceof Parse.Query) {
				
				this.collection.reset();
				this.collection.query = query;
				
				var self = this;
				
				this.collection.fetch().then(
					
					null,
					function (error) {
						
						app.view.alert(
							self.parent.$alertContainer || self.$el,
							'danger',
							'Failed to get product size list',
							error.message,
							false
						);
						
					}
					
				);
				
			} else {
				
				this.collection.query = null;
				this.collection.reset();
				
			}
			
		},
		
		
		apply : function () {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductSizeListView.apply');
			
			var promises = [];
			
			promises.push(Parse.Object.saveAll(this.collection.changed()));
			promises.push(Parse.Object.destroyAll(this.collection.deleted()));
			
			return Parse.Promise.when(promises);
			
		},
		
		
		addSizeModel : function(model) {
			
			if (this.type === 'form')
				this.updateSizeCollection();
			
			var view = new ItemView({model : model, type : this.type});
			this.$items.append(view.render().el);
			
		},
		
		
		removeSizeModel : function(model) {
			
			if (this.type === 'form')
				this.updateSizeCollection();
			
		},
		
		
		updateSizeModel : function(model) {
			
			if (this.type === 'form')
				this.updateSizeCollection();
			
		},
	
	
		resetSizeCollection : function(collection, filter) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductSizeListView.resetSizeCollection');
	
			//this.$items.find('> :not([role="dropzone"])').remove();
			
			this.$items.html('');
			
			this.updateSizeCollection();
			
			if (_.isEmpty(this.sort)) 
				this.collection.each(this.addSizeModel);
			
			else {
				
				var ordered = this.collection.sortBy(
					function (item) {
						return (order = _.indexOf(this, item.has('title') ? item.get('title') : '') + 1) ? order : undefined;
					},
					this.sort
				);
				
				_.each(ordered, this.addSizeModel);
				
			}

			
			
		},
		
		
		updateSizeCollection : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductSizeListView.updateSizeCollection');
			
			this.$('[role="product-form-total-quantity"]').html(this.collection.total() || 'Not available');
			
			if (this.collection.existed().length <= 0)
				this.$items.html(
					'<tr role="empty-list">' +
					(this.type === 'form' ? '<td>&nbsp;</td>' : '') +
					'<td colspan="' + (this.type === 'form' ? '3' : '2') + '">No available size found</td></tr>')
			
			else
				this.$items.find('[role="empty-list"]').remove();
			
		},
		
		
		doSizeCreate : function () {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductSizeListView.doSizeCreate');
			
			this.makeSizeCreate();
			
			return false;
			
		},
		
		
		makeSizeCreate : function (title, quantity) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductSizeListView.makeSizeCreate');
			
			if (title) {
				
				var search = this.collection.filter(function (item) {return item.get('title') === title;});
				
				if (!_.isEmpty(search))
					return
				
			}
			
			var model = new ProductSizeModel;
			
			if (title)
				model.set('title', title);
				
			model.set('quantity', quantity || 0);
			
			this.collection.add(model);
			
		},
		
		
		makeSizeUpdate : function (availableSizes) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductSizeListView.makeSizeUpdate');
			
			this.collection.each(function (model) {
				
				if (model.has('title') && !_.contains(availableSizes, model.get('title')))
					model.set('quantity', 0);
				
			});
			
		},
		
		
		doChangeSizePreset : function (ev) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductSizeListView.doChangeSizePreset');
			
			var
				$target = $(ev.currentTarget);
			
			if (ev.val)
				$target.next().removeClass('hidden');
			else
				$target.next().addClass('hidden');
			
		},
		
		
		doSizePresetAppend : function () {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductSizeListView.doSizePresetAppend');
			
			var
				presetId = this.$sizePreset.select2('val');
				
			if (presetId && _.has(this.presets, presetId) && (preset = this.presets[presetId])) {
				
				_.each(preset, function (size) {
					
					if (!this.find(function (item) {return item.get('title') === size})) {
						
						var model = new ProductSizeModel;
						
						model.set('title', size);
						model.set('quantity', 0);
			
						this.add(model);
						
					}
					
				}, this.collection);
				
			}
			
			return false;
			
		}
		
		
	});
	
	return view;

});