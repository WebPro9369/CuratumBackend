define([
    'underscore',
    'parse',
    
    'proto/view/nested-controls',
    
    'classes/interview/model',
    
    'classes/brand/collection',
    'classes/brand/model',
    
    'controls/form/dictionary',
    
    'controls/form/image',
    
    'text!templates/interview/form.html',
    
    'jquery-validation',
    'jquery-validation.defaults',
    'bootstrap-multilanguage',
    'bootstrap-link',
    'icheck'
], function (
	_, Parse,
	NestedControlsProto,
	InterviewModel,
	BrandCollection, BrandModel,
	DictionaryControl,
	ImageControl,
	formTemplate
) {
	
	const VIEW = {
		TITLE	 	: 'Interview',
		NAME		: 'InterviewForm',
		ID			: 'interview'
	};
	
	var view = Parse.View.extend({
	
		events : {},
		
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.initialize');
	
			_.bindAll(this, 'render', 'fetch', 'prebuild', 'build', 'submit');
			
			this.controls = {};
	
			this.template = _.template(formTemplate);
			
			this.controls.brand = new DictionaryControl({
				name		: 'brand',
				Collection	: BrandCollection,
				Model		: BrandModel,
				nullable	: true,
				beforeFetch	: function (query) {
					query.select(['title']);
					query.ascending('title');
					query.limit(1000);
				}
			});
			
			this.controls.image = new ImageControl({
				parent		: this,
				name		: 'image',
				limit		: 1,
				type		: VIEW_TYPE_FORM,
				raw			: true
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
					query.include(['image']);
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
					'title' : {
						multilanguageDefaultRequired : true
					}
				},
				submitHandler : this.submit
			});
			
			this.$('.multilanguage-control').bootstrapMultilanguage({languages: app.settings.enums.language, language: app.settings.config.DEFAULT_LANGUAGE});
			this.$('.link-control').bootstrapLink();
			
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
					subject						: function ($control, value) {$control.bootstrapMultilanguage('set', value);},
					header						: function ($control, value) {$control.bootstrapMultilanguage('set', value);},
					subheader					: function ($control, value) {$control.bootstrapMultilanguage('set', value);},
					headerHide					: function ($control, value) {$control.bootstrapMultilanguage('set', value);},
					desc						: function ($control, value) {$control.bootstrapMultilanguage('set', value);},
					detailTitle					: function ($control, value) {$control.bootstrapMultilanguage('set', value);},
					detailDesc					: function ($control, value) {$control.bootstrapMultilanguage('set', value);},
					sourceLink					: function ($control, value) {$control.bootstrapLink('set', value);},
					videoLink					: function ($control, value) {$control.bootstrapLink('set', value);},
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
					subject						: function ($control, value) {return $control.bootstrapMultilanguage('get');},
					header						: function ($control, value) {return $control.bootstrapMultilanguage('get');},
					subheader					: function ($control, value) {return $control.bootstrapMultilanguage('get');},
					headerHide					: function ($control, value) {return $control.bootstrapMultilanguage('get');},
					desc						: function ($control, value) {return $control.bootstrapMultilanguage('get');},
					detailTitle					: function ($control, value) {return $control.bootstrapMultilanguage('get');},
					detailDesc					: function ($control, value) {return $control.bootstrapMultilanguage('get');},
					sourceLink					: function ($control, value) {return $control.bootstrapLink('get');},
					videoLink					: function ($control, value) {return $control.bootstrapLink('get');},
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