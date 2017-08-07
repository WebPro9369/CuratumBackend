define([
    'underscore',
    'parse',
    
    'proto/view/nested-controls',
    
    'text!templates/product-unit-type/value/form.html',
    
    'jquery-validation',
    'jquery-validation.defaults',
    'bootstrap-multilanguage'
], function (
	_, Parse,
	NestedControlsProto,
	formTemplate
) {
	
	const VIEW = {
		TITLE	 	: 'SKU Type Value',
		NAME		: 'ProductUnitTypeValueControl',
		ID			: 'product-unit-type-value'
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
			
		},
		
		
		render : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.render');

			this.$el.html(this.template(VIEW));
			
			this.renderNestedControls();
			
			this.$('form#' + VIEW.ID + '-form').validate({
				context : this.$el,
				rules : {
					'code'		: {
						required	: true
					},
					'title'		: {
						multilanguageDefaultRequired	: true
					}
				},
				submitHandler : this.submit
			});
			
			this.$('.multilanguage-control').bootstrapMultilanguage({languages: app.settings.enums.language, language: app.settings.config.DEFAULT_LANGUAGE});
			
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
					title						: function ($control, value) {$control.bootstrapMultilanguage('set', value);},
				},
				{
					form						: VIEW.ID + '-form'
				}
			);
			
			this.show();
			
		},
		
		
		submit : function(form) {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.submit');
			
			var self = this;
			
			this.model.unbindView(
				this,
				{
					title						: function ($control, value) {return $control.bootstrapMultilanguage('get');},
				},
				{
					form						: VIEW.ID + '-form'
				}
			);
			
			var promises = [];
			
			this.applyNestedControls(promises);
			
			this.model.trigger('change');
			
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