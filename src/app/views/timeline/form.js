define([
    'underscore',
    'parse',
    
    'proto/view/nested-controls',
    
    'classes/timeline/model',
    
    'controls/form/enum',
    'controls/form/image',
    
    //'views/timeline/product/list',
    
    'text!templates/timeline/form.html',
    
    'jquery-validation',
    'jquery-validation.defaults',
    'bootstrap-multilanguage',
    'bootstrap-link',
    'icheck'
], function (
	_, Parse,
	NestedControlsProto,
	TimelineModel,
	EnumControl, ImageControl,
	formTemplate
) {
	
	const VIEW = {
		TITLE	 	: 'Timeline',
		NAME		: 'TimelineForm',
		ID			: 'timeline'
	};
	
	var view = Parse.View.extend({
	
		events : {},
		
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.initialize');
	
			_.bindAll(this, 'render', 'fetch', 'prebuild', 'build', 'submit');
			
			this.controls = {};
	
			this.template = _.template(formTemplate);
			
			this.controls.image = new ImageControl({
				parent		: this,
				name		: 'image',
				limit		: 1,
				type		: VIEW_TYPE_FORM,
				raw			: true
			});
			
			this.controls.authRequiredImage = new ImageControl({
				parent		: this,
				name		: 'authRequiredImage',
				limit		: 1,
				type		: VIEW_TYPE_FORM,
				raw			: true
			});
			
			this.controls.discountImage = new ImageControl({
				parent		: this,
				name		: 'discountImage',
				limit		: 1,
				type		: VIEW_TYPE_FORM,
				raw			: true
			});
			
			this.controls.wonImage = new ImageControl({
				parent		: this,
				name		: 'wonImage',
				limit		: 1,
				type		: VIEW_TYPE_FORM,
				raw			: true
			});
			
			this.controls.availableCountry = new EnumControl({
				name		: 'availableCountry',
				datasource	: _.map(app.settings.enums.country, function (country) {return {id: country.code, text: country.title};}),
				multiple	: true,
				nullable	: true
			});
			
			this.controls.type = new EnumControl({
				name		: 'type',
				datasource	: TimelineModel.prototype.enums('type'),
				nullable	: true
			});
			
			//this.products = new ProductList({});
			
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
					query.include(['logo', 'authRequiredImage', 'discountImage', 'wonImage']);
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
			
			//this.products.setElement(this.$('#timeline-form-product')).render();
			
			this.$('form#' + VIEW.ID + '-form').validate({
				context : this.$el,
				rules : {
					subject : {
						multilanguageDefaultRequired : true
					}
				},
				submitHandler : this.submit,
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
					product						: null,
					availableCountry			: null,
					subject						: function ($control, value) {$control.bootstrapMultilanguage('set', value);},
					subtitle					: function ($control, value) {$control.bootstrapMultilanguage('set', value);},
					desc						: function ($control, value) {$control.bootstrapMultilanguage('set', value);},
					sharingLink					: function ($control, value) {$control.bootstrapLink('set', value);},
					tapstreamLink				: function ($control, value) {$control.bootstrapLink('set', value);},
					discounted					: function ($control, value) {$control.iCheck(value === true ? 'check' : 'uncheck');},
					primary						: function ($control, value) {$control.iCheck(value === true ? 'check' : 'uncheck');},
					private						: function ($control, value) {$control.iCheck(value === true ? 'check' : 'uncheck');},
					published					: function ($control, value) {$control.iCheck(value === true ? 'check' : 'uncheck');},
				},
				{
					form						: VIEW.ID + '-form'
				}
			);
			
			this.$('.multilanguage-control').bootstrapMultilanguage({languages: app.settings.enums.language, language: app.settings.config.DEFAULT_LANGUAGE});
			this.$('.link-control').bootstrapLink();
			
			/*var items = _.map(this.model.get('productArray') || [], function (model) {return model.id});
			this.products.selected(items);*/
			
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
					product						: null,
					availableCountry			: null,
					subject						: function ($control, value) {return $control.bootstrapMultilanguage('get');},
					subtitle					: function ($control, value) {return $control.bootstrapMultilanguage('get');},
					desc						: function ($control, value) {return $control.bootstrapMultilanguage('get');},
					sharingLink					: function ($control, value) {return $control.bootstrapLink('get');},
					tapstreamLink				: function ($control, value) {return $control.bootstrapLink('get');},
					discounted					: function ($control, value) {return $control.prop('checked');},
					primary						: function ($control, value) {return $control.prop('checked');},
					private						: function ($control, value) {return $control.prop('checked');},
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
			
			/*var products = this.products.selected();
			var before = _.map(this.model.get('productArray') || [], function (model) {return model.id});
			var after = _.map(products, function (model) {return model.objectId;});
			if (!_.isEmpty(after) && (!_.isEmpty(_.difference(before, after)) || !_.isEmpty(_.difference(after, before))))
				this.model.set('productArray', products);
			
			else if (_.isEmpty(products) && this.model.has('productArray'))
				this.model.unset('productArray');
			
			this.model.save().then(
				
				function (result) {
					
					self.$('.modal').modal('hide');
					
					self.collection.fetch();
					
					app.view.alert(
						null,
						'success',
						'',
						'Timeline successfully ' + (result.existed() ? 'updated' : 'created'),
						3000
					);
					
				},
				function (error) {
					
					app.view.alert(
						self.$el,
						'danger',
						'An error occurred while saving the timeline',
						error.message,
						false 
					);
					
				}
			
			);*/
	
			return false;
	
		}
		
		
	})
	.extend(_.clone(NestedControlsProto));
	
	return view;

});