define([
    'underscore',
    'parse',
    
    'proto/view/nested-form',
	'proto/view/nested-view',
    
    'classes/product-unit/collection',
    'classes/product-unit/model',
    
    './item',
    './form',
    
    'text!templates/product/unit/list.html',
    
    'jquery-ui'
], function (
	_, Parse,
	NestedFormProto, NestedViewProto,
	ProductUnitCollection, ProductUnitModel,
	ProductUnitItem, ProductUnitForm,
	listTemplate
) {
	
	const VIEW = {
		TITLE	 	: 'SKU',
		NAME		: 'ProductUnitList',
		ID			: 'product-unit',
		LIST_EMPTY	: '<tr><td colspan="4">No matching records found</td></tr>'
	};
	
	var view = Parse.View.extend({
	
		events : _.unpairs([
			['click [data-action="create"][rel="' + VIEW.ID + '"]'	, 'doCreate'],
			['click [data-action="remove"][rel="' + VIEW.ID + '"]'	, 'doRemove'],
			['click [data-action="update"][rel="' + VIEW.ID + '"]'	, 'doShowForm']
		]),
		
		_disabled : null,
		
		
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.initialize');
	
			_.bindAll(this, 'disable', 'enable', 'assign', 'sync', 'render', 'fetch', 'addValue', 'removeValue', 'resetValues', 'updateValues', 'totalQuantityIncrement', 'minSalePrice', 'maxSalePrice', 'apply', 'doCreate', 'doRemove', 'doShowForm');
			
			this.form = {};
			
			this._disabled = false;
			
			this.template = _.template(listTemplate);
			
			if (options.name)
				this.name = options.name;
			
			this.type = options.type === VIEW_TYPE_FORM ? VIEW_TYPE_FORM : VIEW_TYPE_FORM;
			
			this.collection = new ProductUnitCollection;
			this.collection.bind('add', this.addValue);
			this.collection.bind('remove', this.removeValue);
			this.collection.bind('reset', this.resetValues);
			
			this.form['product-unit'] = new ProductUnitForm({collection: this.collection});
			
		},
		
		
		disable : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.disable ' + this.name);
	
			this._disabled = true;
			
		},
		
		
		enable : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.enable ' + this.name);
			
			this._disabled = false;
			
		},
		
		
		assign : function (model) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.assign ' + this.name);
			
			this.model = model;
			
			this.sync();
			
		},
		
		
		sync : function () {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.sync ' + this.name);
			
			if (this.name && this.model.has(this.name)) {
				
				var value = this.model.get(this.name);
				
				this.collection.reset(_.isArray(value) ? value : [value]);
				
				
			} else
				this.collection.reset();
			
		},
		
		
		render : function() {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.render');
	
			this.$el.html(this.template(VIEW));
			
			if (this._disabled)
				return;
			
			this.$items = this.$('[role="items"]');
			
			if (this.type === VIEW_TYPE_FORM) {
				
				this.$items.sortable({
					items	: "> [data-cid]",
					handle  : '.ui-sortable-handle > .icon-cursor-move',
					cursor  : 'move'
				}).disableSelection();
		    		
			}
			
			this.renderNestedForm();
			this.renderNestedView();
			
		},
		
		
		fetch : function () {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.fetch');
			
			var promises = [];
			
			this.fetchNestedForm(promises);
			
			return Parse.Promise.when(promises);
			
		},
		
		
		addValue : function(model) {
			
			var view;
			
			if (this.type === VIEW_TYPE_FORM)
				view = new ProductUnitItem({model: model});
			
			this.$items.append(view.render().el);
			
			this.updateValues();
				
			
		},
		
		
		removeValue : function(model) {
			
			this.updateValues();
				
		},
	
	
		resetValues : function(collection, filter) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.resetValues');

			this.$items.find('> :not([role="dropzone"])').remove();
			this.collection.each(this.addValue);
			
			this.updateValues();
			
		},
		
		
		updateValues : function() {
			
			var
				selected = this.collection.selected(),
				form = this.form['product-unit'];
			
			if (selected && selected.cid === form.model.cid)
				form.show();
			
			else
				form.hide();
			
		},
		
		
		totalQuantityIncrement : function () {
			
			return this.collection.reduce(function (memo, model) {return memo + (model._quantityIncrement || 0);}, 0);
			
		},
		
		
		minSalePrice : function () {
			
			return this.collection.reduce(
				function (memo, model) {
					
					var value = model.get('salePrice') || {};
					
					_.each(value, function (amount, currency) {
						
						if (!_.has(memo, currency) || amount < memo[currency])
							memo[currency] = amount;
						
					});
					
					return memo;
					
				},
				{}
			);
			
		},
		
		
		maxSalePrice : function () {
			
			return this.collection.reduce(
				function (memo, model) {
					
					var value = model.get('salePrice') || {};
					
					_.each(value, function (amount, currency) {
						
						if (!_.has(memo, currency) || amount > memo[currency])
							memo[currency] = amount;
						
					});
					
					return memo;
					
				},
				{}
			);
			
		},
		
		
		apply : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.apply ' + this.name);
			
			if (this._disabled)
				return Parse.Promise.as();
			
			if (this.name) {
				
				var items = this.collection.ordered(this.$items.sortable('toArray', {attribute: 'data-cid'}));
				
				var before = _.map(this.model.get(this.name), function (item) {return item.id;});
				var after = _.map(items, function (item) {return item.id;});
				
				if (!_.isEmpty(after)) {
					
					if (!_.isEqual(before, after))
						this.model.set(this.name, items);
				
				} else if (this.model.has(this.name))
					this.model.unset(this.name);
				
			}
			
			return Parse.Promise.as();
					
		},
		
		
		doCreate : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.apply ' + this.name);
			
			var model = new ProductUnitModel({product: this.model});
			
			this.collection.add(model);
			
			return false;
			
		},
		
		
		doRemove : function (ev) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.doRemove');
			
			var
				$target = $(ev.currentTarget),
				data = $target.data();

			if (data && data.id && (model = this.collection.getByCid(data.id)))
				this.collection.remove(model);
			
			return false;
			
		},
		
		
		doShowForm : function (ev) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.doShowForm');
			
			var
				$target = $(ev.currentTarget),
				data = $target.data();

			if (data && data.id && (model = this.collection.getByCid(data.id))) {
				
				this.form['product-unit'].build(model);
				model.select();
				
			}
			
			return false;
			
		}
		
		
	})
	.extend(_.clone(NestedFormProto))
	.extend(_.clone(NestedViewProto));
	
	return view;

});