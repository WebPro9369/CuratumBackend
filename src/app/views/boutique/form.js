define([
    'underscore',
    'parse',
    
    'proto/view/nested-controls',
    
    'classes/boutique/model',
    
    'controls/form/image',
    './user/list',
    
    'text!templates/boutique/form.html',
    
    'jquery-validation',
    'jquery-validation.defaults',
    'bootstrap-multilanguage',
    'bootstrap-link',
    'icheck'
], function (
	_, Parse,
	NestedControlsProto,
	BoutiqueModel,
	ImageListControl, UserList,
	formTemplate
) {
	
	const VIEW = {
		TITLE	 	: 'Boutique',
		NAME		: 'BoutiqueForm',
		ID			: 'boutique'
	};
	
	var view = Parse.View.extend({
	
		events : {},
		
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.initialize');
	
			_.bindAll(this, 'render', 'fetch', 'prebuild', 'build', 'submit');
			
			this.controls = {};
	
			this.template = _.template(formTemplate);
			
			this.controls.logo = new ImageListControl({
				parent		: this,
				name		: 'logo',
				limit		: 1,
				type		: VIEW_TYPE_FORM,
				raw			: true
			});
			
			this.controls.image = new ImageListControl({
				parent		: this,
				name		: 'image',
				limit		: 1,
				type		: VIEW_TYPE_FORM,
				raw			: true
			});
			
			this.controls.mapImage = new ImageListControl({
				parent		: this,
				name		: 'mapImage',
				limit		: 1,
				type		: VIEW_TYPE_FORM,
				raw			: true
			});
			
			this.controls.security = new UserList({});
			
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
					query.include(['logo', 'image', 'mapImage']);
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
			this.$tabSecurity = this.$('[data-toggle="tab"][href="#' + VIEW.ID + '-form-security"]');
			this.$buttonSubmit = this.$('form#' + VIEW.ID).find('[type="submit"]');
			
			this.$('form#' + VIEW.ID + '-form').validate({
				context : this.$el,
				rules : {
					'title' : {
						required : true
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
			
			this.assignNestedControls(model);
			
			this.model.bindView(
				this,
				{
					subject						: function ($control, value) {$control.bootstrapMultilanguage('set', value);},
					title						: function ($control, value) {$control.bootstrapMultilanguage('set', value);},
					desc						: function ($control, value) {$control.bootstrapMultilanguage('set', value);},
					detailTitle					: function ($control, value) {$control.bootstrapMultilanguage('set', value);},
					detailDesc					: function ($control, value) {$control.bootstrapMultilanguage('set', value);},
					link						: function ($control, value) {$control.bootstrapLink('set', value);},
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
		
		
		rebuild : function (forceSecurity) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.rebuild');
			
			this.$('.modal-title > .model-op').html(this.model.isNew() ? ' create' : 'update');
			this.$('.modal-title > .model-id').html(!this.model.isNew() ? this.model.id : '');
			
			if (this.model.isNew())
				this.$tabSecurity.hide();
			else {
				
				if (forceSecurity)
					this.controls.security.assign(this.model);
					
				this.$tabSecurity.show();
				
			}
			
			this.$buttonSubmit.html(this.model.isNew() ? 'Save and specify security' : 'Save changes');
			
			if (!this.model.isNew() && forceSecurity === true)
				this.$tabSecurity.tab('show');
				
			else
				this.$tabGeneral.tab('show');
				
			
		},
		
		
		submit : function(form) {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.submit');
	
			var self = this;
			
			var isNew = this.model.isNew();
			
			this.model.unbindView(
				this,
				{
					subject						: function ($control, value) {return $control.bootstrapMultilanguage('get');},
					title						: function ($control, value) {return $control.bootstrapMultilanguage('get');},
					desc						: function ($control, value) {return $control.bootstrapMultilanguage('get');},
					detailTitle					: function ($control, value) {return $control.bootstrapMultilanguage('get');},
					detailDesc					: function ($control, value) {return $control.bootstrapMultilanguage('get');},
					link						: function ($control, value) {return $control.bootstrapLink('get');},
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
						self.rebuild(true);
						
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