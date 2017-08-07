define([
    'underscore',
    'parse',
    
    'proto/view/nested-controls',
    
    'classes/product-unit-type/model',
    
    './value/list',
    
    'text!templates/product-unit-type/form.html',
    
    'jquery-validation',
    'jquery-validation.defaults',
    'bootstrap-multilanguage',
    'icheck'
], function (
	_, Parse,
	NestedControlsProto,
	ProductUnitTypeModel,
	ValueList,
	formTemplate
) {
	
	const VIEW = {
		TITLE	 	: 'SKU Type',
		NAME		: 'ProductUnitTypeForm',
		ID			: 'product-unit-type'
	};
	
	var view = Parse.View.extend({
	
		events : {},
		
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.initialize');
	
			_.bindAll(this, 'render', 'fetch', 'prebuild', 'build', 'rebuild', 'submit');
			
			this.controls = {};
	
			this.template = _.template(formTemplate);
			
			this.controls.value = new ValueList({
				name		: 'value',
				type		: VIEW_TYPE_FORM
			});
			
		},
		
		
		fetch : function (model) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.fetch');
			
			var promises = [];
			
			this.fetchNestedControls(promises);
			
			return Parse.Promise.when(promises);
			
		},
		
		
		prebuild : function (model) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.prebuild');
			
			var self = this;
			
			Parse.Promise.as().then(
				
				function () {
					
					if (model.isNew())
						return Parse.Promise.as(model);
						
					var query = new Parse.Query(model.className);
					query.include(['value']);
					return query.get(model.id);
					
				}
				
			).then(
				
				function (result) {
					
					self.build(result);
					
				},
				function (error) {
					
					app.view.alert(
						null,
						'danger',
						'An error occurred while building ' + VIEW.TITLE + ' form',
						error.message,
						false 
					);
					
				}
				
			);
			
		},
		
		
		render : function() {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.render');

			this.$el.html(this.template(VIEW));
			
			this.$tabGeneral = this.$('[data-toggle="tab"][href="#' + VIEW.ID + '-form-general"]');
			this.$tabValue = this.$('[data-toggle="tab"][href="#' + VIEW.ID + '-form-value"]');
			this.$buttonSubmit = this.$('form#' + VIEW.ID).find('[type="submit"]');
			
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
			
			this.$('input[type="checkbox"]').iCheck({checkboxClass: 'icheckbox_flat'});
			
			this.renderNestedControls();
			
			return this;
			
		},
		
		
		build : function (model) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.build');
			
			if (model instanceof Parse.Object)
				this.model = model;
			
			this.assignNestedControls(model);
			
			this.model.bindView(
				this,
				{
					value						: null,
					title						: function ($control, value) {$control.bootstrapMultilanguage('set', value);},
					published					: function ($control, value) {$control.iCheck(value === true ? 'check' : 'uncheck');}
				},
				{
					form						: VIEW.ID + '-form'
				}
			);
			
			this.$('form#' + VIEW.ID + '-form').valid();
			
			this.rebuild();
			
			this.$('.modal').modal('show');
			
		},
		
		
		rebuild : function () {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.rebuild');
			
			this.$('.modal-title > .model-op').html(this.model.isNew() ? ' create' : 'update');
			this.$('.modal-title > .model-id').html(!this.model.isNew() ? this.model.id : '');
			
			if (this.model.isNew())
				this.$tabValue.hide();
			else
				this.$tabValue.show();
			
			this.$buttonSubmit.html(this.model.isNew() ? 'Save and fill values' : 'Save changes');
			
			if (this.model.isNew())
				this.$tabGeneral.tab('show');
			else
				this.$tabValue.tab('show');
			
		},
		
		
		submit : function(form) {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.submit');
	
			var self = this;
			
			var isNew = this.model.isNew();
			
			this.model.unbindView(
				this,
				{
					value						: null,
					title						: function ($control, value) {return $control.bootstrapMultilanguage('get');},
					published					: function ($control, value) {return $control.prop('checked');}
				},
				{
					form						: VIEW.ID + '-form'
				}
			);
			
			var promises = [];
			
			this.applyNestedControls(promises);
			
			Parse.Promise.when(promises).then(
				
				function () {
					
			 		return self.model.save();
			 		
				}
				
			).then(
				
				function (result) {
					
					if (isNew)
						self.rebuild();
						
					else {
						
						self.$('.modal').modal('hide');
						self.collection.fetch();
						
					}
					
					app.view.alert(
						null,
						'success',
						'',
						VIEW.TITLE + ' successfully ' + (result.existed() ? 'updated' : 'created'),
						3000
					);
					
				},
				function (error) {
					
					app.view.alert(
						self.$el,
						'danger',
						'An error occurred while saving ' + VIEW.TITLE,
						error.message,
						false 
					);
					
				}
			
			);
	
			return false;
	
		}
		
		
	})
	.extend(_.clone(NestedControlsProto));
	
	return view;

});