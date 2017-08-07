define([
    'underscore',
    'parse',
    
    'proto/view/nested-controls',
    
    'classes/user/model',
    
    'text!templates/user/form.html',
    
    'jquery-validation',
    'jquery-validation.defaults'
], function (
	_, Parse,
	NestedControlsProto,
	UserModel,
	formTemplate
) {
	
	const VIEW = {
		TITLE	 	: 'User',
		NAME		: 'UserForm',
		ID			: 'user'
	};
	
	var view = Parse.View.extend({
	
		events : {},
		
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.initialize');
	
			_.bindAll(this, 'render', 'build', 'submit');
			
			this.controls = {};
	
			this.template = _.template(formTemplate);
			
		},
		
		
		fetch : function () {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.fetch');
			
			var promises = [];
			
			this.fetchNestedControls(promises);
			
			var self = this;
			
			return Parse.Promise.when(promises).then(

				null,
				function (error) {
					
					app.view.alert(
						self.$el,
						'danger',
						'An error occurred while building user form',
						error.message,
						false 
					);
					
				}
				
			);
			
		},
	
	
		render : function() {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.render');
	
			this.$el.html(this.template(VIEW));
			
			this.$transactionValue = this.$('[name="transaction-value"]');
			
			this.renderNestedControls();
			
			/*this.$el.validate({
				errorElement: 'div',
				errorClass: 'form-error',
				validClass: 'form-success',
				errorPlacement: processValidationError,
				success: processValidationSuccess,
				rules : {
					'transaction-value' : {
						required	: true,
						number		: true
					}
				},
				ignore: '.ignore',
				submitHandler : this.submit,
				showErrors		: processValidationErrors
			});*/
			
			return this;
			
		},
		
		
		fetch : function() {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.fetch');
		
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
					balance						: function ($control, value, model) {$control.html(value > 0 ? numeral(value).format(MONEY_FORMAT) : '&mdash;');},
				}
			);
			
			this.$transactionValue.val('');
			
			this.$el.valid();
			
			this.$('.modal').modal('show');
			
			this.$('[data-toggle="tab"]').first().tab('show');
			
		},
		
		
		submit : function(form) {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.submit');
			
			var self = this;
			
			var promises = [];
			
			if (value = Number(this.$transactionValue.val())) {
				
				var
					params = {
						user	: this.model.id,
						value	: value
					};
			
				promises.push(Parse.Cloud.run('transactionCreate', params));
				
			}
			
			Parse.Promise.when(promises).then(
				
				function (result) {
					
					self.collection.fetch();
					
					self.$('.modal').modal('hide');
					
					app.view.alert(
						null,
						'success',
						'',
						'User changed',
						3000
					);
					
				},
				function (error) {
					
					app.view.alert(
						self.$el,
						'danger',
						'Failed to change user',
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