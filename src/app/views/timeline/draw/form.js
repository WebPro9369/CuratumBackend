define([
    'underscore',
    'parse',
    
    'collections/user',
    'models/user',
    
    'views/timeline/draw/user/item',
    
    'text!templates/timeline/draw/form.html',
    
    'jquery-validation'
], function (
	_, Parse,
	UserCollection, UserModel,
	DrawUserItem,
	formTemplate
) {
	
	var stages = [
		{tabIndex: 0	, nextEnabled: true		, cancelEnabled: true	, nextTitle: 'Get winners'},	// 0
		{tabIndex: 1	, nextEnabled: false	, cancelEnabled: false	, nextTitle: ''},				// 1
		{tabIndex: 1	, nextEnabled: true		, cancelEnabled: true	, nextTitle: 'Resume'},			// 2
		{tabIndex: 1	, nextEnabled: true		, cancelEnabled: true	, nextTitle: 'Award winners'},	// 3
		{tabIndex: 1	, nextEnabled: false	, cancelEnabled: false	, nextTitle: ''},				// 4
		{tabIndex: 1	, nextEnabled: true		, cancelEnabled: false	, nextTitle: 'Resume'},			// 5
		{tabIndex: 1	, nextEnabled: true		, cancelEnabled: false	, nextTitle: 'Finish'},			// 6
	];
	
	var view = Parse.View.extend({
	
		events : {},
		
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('TimelineDrawForm.initialize');
	
			_.bindAll(this, 'render', 'count', 'fetch', 'award', 'addOne', 'addAll', 'build', 'updateUI', 'submit');
			
			this.template = _.template(formTemplate);
			
			this.collection = new UserCollection;
			this.collection.query = new Parse.Query(UserModel);
			this.collection.query.limit(1000);
			this.collection.bind('add', this.addOne);
			this.collection.bind('reset', this.addAll);
			
		},
		
		
		render : function() {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('TimelineDrawForm.render');
	
			this.$el.html(this.template());
			
			this.$items = this.$('[role="items"]');
			
			this.$tabs = this.$('.nav.nav-tabs.nav-primary > li > a');
			this.$nextBtn = this.$('button[type="submit"]');
			this.$cancelBtn = this.$('button[type="button"][data-dismiss="modal"]');
			
			this.$alertContainer = this.$('.modal-body');
			
			this.$totalCount = this.$('[name="totalCount"]');
			this.$winnerCount = this.$('[name="winnerCount"]');
			this.$winAmount = this.$('[name="winAmount"]');
			this.$notificationMessage = this.$('[name="notificationMessage"]');
			
			this.$el.validate({
				errorElement: 'div',
				errorClass: 'form-error',
				validClass: 'form-success',
				errorPlacement: processValidationError,
				success: processValidationSuccess,
				rules : {
					winnerCount : {
						required	: true,
						number		: true,
						min			: 1
					},
					winAmount : {
						required	: true,
						number		: true,
						min			: 0.01
					}
				},
				ignore: '.ignore',
				submitHandler : this.submit,
				showErrors		: processValidationErrors
			});
			
			return this;
			
		},
		
		
		count : function() {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('TimelineDrawForm.count');
			
			var self = this;
			
			return this.collection.query.count().then(
				
				function (result) {
					
					self.totalCount = result || 0;
					
					self.$totalCount.html(self.totalCount);
					self.$winnerCount.data('ruleMax', _.min([self.totalCount, 1000]));
					
				},
				function (error) {
					
					app.view.alert(
						self.$alertContainer,
						'danger',
						'Failed to count items',
						error.message,
						false
					);
					
				}
			
			);
		
		},
		
		
		fetch : function() {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('TimelineDrawForm.fetch');
			
			var self = this;
			
			this.collection.reset();
			this.collection.query._removeConstraint('objectId', 'containedIn');
			
			return this.collection.query.find().then(
				
				function (results) {
					
					var items = _.map(results, function (user) {
						return user.id;
					});
					
					console.log(items);
					
					var winners = _
						.chain(items)
						.shuffle()
						.first(self.winnerCount)
						.value();
					
					console.log(winners);
					
					self.collection.query.containedIn('objectId', winners);
					
					return self.collection.fetch();
					
				}
			
			).then(
				
				function () {
					
					self.stage += 2;
					self.updateUI();
					
				},
				function (error) {
					
					self.stage++;
					self.updateUI();
					
					app.view.alert(
						self.$alertContainer,
						'danger',
						'Failed to count items',
						error.message,
						false
					);
					
				}
			
			);
		
		},
		
		
		award : function() {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('TimelineDrawForm.award');
			
			var self = this;
			
			var promise = Parse.Promise.as();
			
			_.each(this.collection.notAwarded(), function (user) {
				
				promise = promise.then(
					
					function () {
						
						var params = {
							user		: user.id,
							value		: self.winAmount,
							timeline	: self.model.id
						};
						
						if (!_.isEmpty(self.notificationMessage))
							params.message = self.notificationMessage;
						
						return Parse.Cloud.run('promoDiscountAward', params).then(
							
							function (result) {
								user.award(true, result);
							},
							function (error) {
								user.award(false, null, error.message);
								return Parse.Promise.error(error);
							}
							
						);
						
					}
					
				);
				
			});
			
			promise = promise.then(
				
				function () {
					
					self.stage += 2;
					self.updateUI();
					
					app.view.alert(
						self.$alertContainer,
						'success',
						'',
						'All winners successfully awarded',
						3000
					);
					
				},
				function (error) {
					
					self.stage++;
					self.updateUI();
					
					app.view.alert(
						self.$alertContainer,
						'danger',
						'Failed to award winners',
						error.message,
						false
					);
					
				}
				
			);
			
			
		}, 
		
		
		addOne : function(model) {
			
			var view = new DrawUserItem({model : model});
			this.$items.append(view.render().el);
			
		},
	
	
		addAll : function(collection, filter) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('TimelineDrawForm.addAll');
	
			this.$items.html('');
			
			if (this.collection.length > 0)
				this.collection.each(this.addOne);
				
			else
				this.$items.html('<tr><td colspan="4">No matching records found</td></tr>');

		},
		
		
		build : function (model) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('TimelineDrawForm.build');
			
			this.model = model;
			
			// Reset
			this.totalCount = -1;
			this.stage = 0;
			
			this.collection.query.equalTo('timelineViewed', model);
			this.collection.query._removeConstraint('objectId', 'containedIn');
			
			this.updateUI();
			
			this.count();
			
			this.$el.valid();
			
			this.$('.modal').modal('show');
			
			
			
		},
		
		
		updateUI: function () {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('TimelineDrawForm.updateUI ' + this.stage);
			
			var stage = stages[this.stage];
			
			// Update buttons
			this.$nextBtn.html(stage.nextTitle);
			
			if (stage.nextEnabled && stage.nextTitle)
				this.$nextBtn.show();
			else
				this.$nextBtn.hide();
			
			if (stage.cancelEnabled)
				this.$cancelBtn.show();
			else
				this.$cancelBtn.hide();
			
			// Update tab control
			this.$tabs.eq(stage.tabIndex).tab('show');
			
			if (this.stage === 0) {
				
				this.$totalCount.html('Counting ...');
				
				this.$winnerCount.val('');
				this.$winnerCount.data('ruleMax', this.totalCount);
				
				this.$winAmount.val('');
				
				this.$notificationMessage.val('');
				
			}
			
		},
		
		
		submit : function(form) {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('TimelineDrawForm.submit');
			
			if (this.stage === 0) {
				
				this.winnerCount = parseInt(this.$winnerCount.val());
				this.winAmount = parseFloat(this.$winAmount.val());
				this.notificationMessage = this.$notificationMessage.val();
				
				this.stage++;
				this.fetch();
			
			// 1 - fetching winners
			
			} else if (this.stage === 2) {
				
				this.stage--;
				this.fetch();
				
			} else if (this.stage === 3) {
				
				this.stage++;
				this.award();
			
			// 4 - awarding winners
			
			} else if (this.stage === 5) {
				
				this.stage--;
				this.award();
			
			} else if (this.stage === 6) {
				
				self.$('.modal').modal('hide');
				
			}
			
			this.updateUI();
			
			/*var self = this;
			
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
						self.$alertContainer,
						'success',
						'',
						'User changed',
						3000
					);
					
				},
				function (error) {
					
					app.view.alert(
						self.$alertContainer,
						'danger',
						'Failed to change user',
						error.message,
						false
					);
					
				}
					
			);*/
			
			return false;
	
		}
		
		
	});
	
	return view;

});