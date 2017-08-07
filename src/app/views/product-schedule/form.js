define([
    'underscore',
    'parse',
    
    'proto/view/nested-controls',
    
    'classes/tag/collection',
    'classes/tag/model',
    
    'classes/product-schedule/model',
    
    'controls/form/assignment',
    
    'text!templates/product-schedule/form.html',
    
    'jquery-validation',
    'icheck'
], function (
	_, Parse,
	NestedControlsProto,
	TagCollection, TagModel,
	ProductScheduleModel,
	AssignmentControl,
	formTemplate
) {
	
	const VIEW = {
		TITLE	 	: 'Product Schedule',
		NAME		: 'ProductScheduleForm',
		ID			: 'product-schedule'
	};
	
	var view = Parse.View.extend({
	
		events : _.unpairs([
			['click [data-action="remove"][rel="' + VIEW.ID + '"]'				, 'doRemove']
		]),
		
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.initialize');
	
			_.bindAll(this, 'render', 'build', 'submit', 'doRemove');
			
			this.controls = {};
	
			this.template = _.template(formTemplate);
			
			this.controls.assignment = new AssignmentControl({
				name			: 'assignment',
				CollectionLeft	: TagCollection,
				ModelLeft		: TagModel,
				CollectionRight	: TagCollection,
				ModelRight		: TagModel,
				datasourceLeft	: 'value',
				datasourceRight	: 'value',
				multiple		: true,
				beforeFetchLeft	: function (query) {
					query.equalTo('type', TAG_TYPE_ARCHETYPE);
					query.ascending('title');
					query.limit(1000);
				},
				beforeFetchRight: function (query) {
					query.equalTo('type', TAG_TYPE_OCCASION);
					query.ascending('title');
					query.limit(1000);
				}
			});
			
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
			
			this.$removeButton = this.$('[data-action="remove"]');
			
			this.renderNestedControls();
			
			this.$el.validate({
				rules : {
				},
				submitHandler : this.submit
			});
			
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
				this
			);
			
			if (this.model.isNew())
				this.$removeButton.hide();
			
			else
				this.$removeButton.show();
			
			this.$el.valid();
			
			this.$('.modal').modal('show');
			
			this.$('[data-toggle="tab"]').first().tab('show');
			
		},
		
		
		submit : function(form) {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.submit');
			
			var self = this;
			
			this.model.unbindView(
				this
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
	
		},
		
		
		doRemove : function () {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.doRemove');
			
			if (this.model.isNew())
				return false;
			
			var self = this;
			
			this.model.destroy().then(
				
				function () {
					
					self.$('.modal').modal('hide');
					
					app.view.alert(
						null,
						'success',
						'',
						'Brand successfully removed',
						3000
					);
					
				},
				function (error) {
					
					app.view.alert(
						self.$el,
						'danger',
						'Failure to remove the brand',
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