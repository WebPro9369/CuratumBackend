define([
    'underscore',
    'numeral',
    'parse',
    
    'views/user/transaction/list',
    
    'text!templates/user/view.html',
    
    'mCustomScrollbar'
], function (
	_, numeral, Parse,
	UserTransactionList,
	viewTemplate
) {
	
	var view = Parse.View.extend({
	
		events : {},
		
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('UserView.initialize');
	
			_.bindAll(this, 'render', 'build');
			
			this.template = _.template(viewTemplate);
			
			this.transactionList = new UserTransactionList({
				parent		: this,
				type		: 'view'
			});
			
		},
	
	
		render : function() {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('UserView.render');
	
			this.$el.html(this.template());
			
			this.transactionList.setElement(this.$('#user-view-transaction')).render();
			
			this.$('.mCustomScrollbar').mCustomScrollbar({
				autoHideScrollbar: true,
				theme: 'dark',
				set_height: 200,
				advanced: {
					updateOnContentResize: true
				}
			});
			
			return this;
			
		},
		
		
		fetch : function() {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('UserView.fetch');
		
		},
		

		build : function (model) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('UserView.build');
			
			this.model = model;
			
			_.bindModelToView(
				this.model,
				this,
				{
					username				: function ($control, value) {$control.html(value ||'&mdash;');},
					fullName				: function ($control, value) {$control.html(value ||'&mdash;');},
					phoneNumber				: function ($control, value) {$control.html(value ||'&mdash;');},
					balance					: function ($control, value) {$control.html(value ? numeral(value).format(MONEY_FORMAT) : '&mdash;');},
				},
				{
					attribute	: 'data-name',
					method		: 'html'
				}
			);
			
			this.transactionList.build(model);
			
			this.$('.modal').modal('show');
			
			this.$('[data-toggle="tab"]').first().tab('show');
			
		}
		
		
	});
	
	return view;

});