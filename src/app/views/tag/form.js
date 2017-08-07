define([
    'underscore',
    'parse',
    
    'proto/view/nested-controls',
    
    'classes/tag/model',
    
    'controls/form/enum',
    
    'text!templates/tag/form.html',
    
    'jquery-validation',
    'jquery-validation.defaults',
    'bootstrap-multilanguage',
    'icheck'
], function (
	_, Parse,
	NestedControlsProto,
	TagModel,
	EnumControl,
	formTemplate
) {
	
	const VIEW = {
		TITLE	 	: 'Tag',
		NAME		: 'TagForm',
		ID			: 'tag'
	};
	
	var view = Parse.View.extend({
	
		events : {},
		
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.initialize');
	
			_.bindAll(this, 'render', 'fetch', 'prebuild', 'build', 'submit');
			
			this.controls = {};
	
			this.template = _.template(formTemplate);
			
			this.controls.type = new EnumControl({
				name		: 'type',
				datasource	: TagModel.prototype.enums('type')
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
			
			this.$('form#' + VIEW.ID + '-form').validate({
				context : this.$el,
				rules : {
					'type' : {
						required : true
					},
					'value' : {
						multilanguageDefaultRequired : true
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
			
			this.$('.modal-title > .model-op').html(this.model.isNew() ? ' create' : 'update');
			this.$('.modal-title > .model-id').html(!this.model.isNew() ? this.model.id : '');
			
			this.assignNestedControls(model);
			
			this.model.bindView(
				this,
				{
					value						: function ($control, value) {$control.bootstrapMultilanguage('set', value);},
					published					: function ($control, value) {$control.iCheck(value === true ? 'check' : 'uncheck');}
				},
				{
					form						: VIEW.ID + '-form'
				}
			);
			
			this.$('form#' + VIEW.ID + '-form').valid();
			
			this.$('.modal').modal('show');
			
			this.$('[data-toggle="tab"]').first().tab('show');
			
		},
		
		
		submit : function(form) {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.submit');
	
			var self = this;
			
			this.model.unbindView(
				this,
				{
					value						: function ($control, value) {return $control.bootstrapMultilanguage('get');},
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
					
					self.$('.modal').modal('hide');
					
					self.collection.fetch();
					
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