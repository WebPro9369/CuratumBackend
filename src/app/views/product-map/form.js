define([
    'underscore',
    'parse',
    
    'classes/product-map/model',
    
    'text!templates/tag/form.html',
    
    'jquery-validation',
    'icheck'
], function (
	_, Parse,
	TagModel,
	formTemplate
) {
	
	var view = Parse.View.extend({
	
		events : {},
		
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('TagForm.initialize');
	
			_.bindAll(this, 'render', 'build', 'submit');
			
			this.controls = {};
	
			this.template = _.template(formTemplate);
			
		},
		
		
		fetch : function () {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('TagForm.fetch');
			
			var promises = [];
			
			_.each(this.controls, function (control, name) {
				promises.push(control.fetch());
			});
			
			return Parse.Promise.when(promises).then(

				null,
				function (error) {
					
					app.view.alert(
						null,
						'danger',
						'An error occurred while building tag form',
						error.message,
						false 
					);
					
				}
				
			);
			
		},
	
	
		render : function() {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('TagForm.render');
	
			this.$el.html(this.template());
			
			_.each(this.controls, function (control, name) {
				control.setElement(this.$('#' + name));
			}, this);
			
			this.$el.validate({
				errorElement: 'div',
				errorClass: 'form-error',
				validClass: 'form-success',
				errorPlacement: processValidationError,
				success: processValidationSuccess,
				rules : {
					value : {
						required : true
					}
				},
				ignore: '.ignore',
				submitHandler : this.submit,
				showErrors		: processValidationErrors
			});
			
			this.$('[name="published"]').iCheck({
				checkboxClass: 'icheckbox_flat'
			});
			
			return this;
			
		},
		
		
		build : function (model) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('TagForm.build');
			
			this.model = model;
			
			this.$('.modal-title').html('<strong>Tag</strong> ' + (this.model.isNew() ? ' create' : 'update'));
			
			_.each(this.controls, function (control, name) {
				control.assign(model);
			});
			
			_.bindModelToView(
				this.model,
				this,
				{
					published					: function ($control, value) {$control.iCheck(value === true ? 'check' : 'uncheck');},
				}
			);
			
			this.$el.valid();
			
			this.$('.modal').modal('show');
			
			this.$('[data-toggle="tab"]').first().tab('show');
			
		},
		
		
		submit : function(form) {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('TagForm.submit');
	
			var self = this;
			
			_.bindViewToModel(
				this.model,
				this,
				{
					published					: function ($control, value) {return $control.prop('checked');},
				}
			);
			
			var promises = [];
			
			_.each(this.controls, function (control, name) {
				promises.push(control.apply());
			});
			
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
						'Tag successfully ' + (result.existed() ? 'updated' : 'created'),
						3000
					);
					
				},
				function (error) {
					
					app.view.alert(
						self.$el,
						'danger',
						'An error occurred while saving the tag',
						error.message,
						false 
					);
					
				}
			
			);
	
			return false;
	
		}
		
		
	});
	
	return view;

});