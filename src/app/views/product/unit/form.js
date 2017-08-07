define([
    'underscore',
    'parse',
    
    'proto/view/nested-controls',
    
    'classes/product-unit-type-value/collection',
    'classes/product-unit-type-value/model',
    
    'controls/form/dictionary',
    
    'text!templates/product/unit/form.html',
    
    'jquery-validation',
    'jquery-validation.defaults',
    'bootstrap-currency',
], function (
	_, Parse,
	NestedControlsProto,
	ProductUnitTypeValueCollection, ProductUnitTypeValueModel,
	DictionaryControl,
	formTemplate
) {
	
	const VIEW = {
		TITLE	 	: 'SKU',
		NAME		: 'ProductUnitControl',
		ID			: 'product-unit'
	};
	
	var view = Parse.View.extend({
	
		tagName : 'div',
	
		events : _.unpairs([
			['click [data-action="remove"][rel="' + VIEW.ID + '"]'			, 'doRemove']
		]),
	
	
		initialize : function(options) {
			
			//if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.initialize');
			
			_.bindAll(this, 'render', 'show', 'hide', 'build', 'submit', 'doRemove');
			
			this.controls = {};
			
			this.template = _.template(formTemplate);
			
			this.controls.value = new DictionaryControl({
				name		: 'value',
				Collection	: ProductUnitTypeValueCollection,
				Model		: ProductUnitTypeValueModel,
				iterator	: 'datasourceWithType',
				multiple	: true,
				nullable	: true,
				beforeFetch	: function (query) {
					query.include(['type'])
					query.ascending('value');
					query.limit(1000);
				}
			});
			
		},
		
		
		fetch : function (model) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.fetch');
			
			var promises = [];
			
			this.fetchNestedControls(promises);
			
			return Parse.Promise.when(promises)
		
		},
		
		
		render : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.render');

			this.$el.html(this.template(VIEW));
			
			this.$quantityIncrement = this.$('[name="quantityIncrement"][form="' +  VIEW.ID + '"]');
			
			this.renderNestedControls();
			
			this.$('form#' + VIEW.ID + '-form').validate({
				context : this.$el,
				rules : {
					'quantityIncrement'		: {
						number				: true
					},
					'basePrice'				: {
						currencyNumber			: true
					},
					'salePrice'				: {
						currencyNumber			: true,
						currencyDefaultRequired	: true
					}
				},
				submitHandler : this.submit
			});
			
			this.$('.currency-control').bootstrapCurrency({currencies: app.settings.enums.currency, currency: app.settings.config.DEFAULT_CURRENCY});
			
			return this;
			
		},
		
		
		show : function () {
			
			this.$el.removeClass('form-hidden');
			
		},
		
		
		hide : function () {
			
			this.$el.addClass('form-hidden');
			
		},
		
		
		build : function (model) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.build');
			
			this.model = model;
			
			this.assignNestedControls(this.model);
			
			this.model.bindView(
				this,
				{
					value						: null,
					quantityLimit				: function ($control, value) {$control.html(value || 0);},
					quantityAvailable			: function ($control, value) {$control.html(value || 0);},
					basePrice					: function ($control, value) {$control.bootstrapCurrency('set', value);},
					salePrice					: function ($control, value) {$control.bootstrapCurrency('set', value);}
				},
				{
					form						: VIEW.ID + '-form'
				}
			);
			
			this.$quantityIncrement.val('');
			
			this.show();
			
		},
		
		
		submit : function(form) {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.submit');
			
			var self = this;
			
			this.model.unbindView(
				this,
				{
					value						: null,
					quantityLimit				: null,
					quantityAvailable			: null,
					basePrice					: function ($control, value) {return $control.bootstrapCurrency('get');},
					salePrice					: function ($control, value) {return $control.bootstrapCurrency('get');}
				},
				{
					form						: VIEW.ID + '-form'
				}
			);
			
			var quantityIncrement = parseInt(this.$quantityIncrement.val());
			
			if (quantityIncrement !== 0) {
				
				this.model.increment('quantityLimit', quantityIncrement);
				this.model.increment('quantityAvailable', quantityIncrement);
				
				this.model.setQuantityIncrement(quantityIncrement);
				
			}
			
			var promises = [];
			
			this.applyNestedControls(promises);
			
			return false;
	
		},
		
		
		doRemove : function(ev) {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.doRemove');
			
			this.model.collection.remove(this.model);
			this.remove();
			
			return false;
			
		}
		
		
	})
	.extend(_.clone(NestedControlsProto));

	return view;

});