define([
    'underscore',
    'parse',
    
    'text!templates/order/item.html'
], function(
	_, Parse,
	itemTemplate
) {
	
	const VIEW = {
		TITLE	 	: 'Order',
		NAME		: 'OrderItem',
		ID			: 'order'
	};
	
	var view = Parse.View.extend({
	
		tagName : 'tr',
	
		events : {
			'click [data-action="order-status"]'			: 'doChangeStatus'
		},
	
	
		initialize : function() {
			
			//if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.initialize');
			
			_.bindAll(this, 'render', 'doChangeStatus', 'makeChangeStatus');
			
			this.template = _.template(itemTemplate);
			
			this.model.bind('change', this.render);
	
		},
	
	
		render : function() {
			
			//if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.render');
			
			this.$el.html(this.template(_.defaults({}, VIEW, this.model.toTemplate())));
			
			this.$el.attr('data-id', this.model.id);
			
			return this;
			
		},
		
		
		doChangeStatus : function(ev) {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.doChangeStatus');
			
			var
				$target = $(ev.currentTarget),
				data = $target.data();
			
			app.view.prompt(
				this.$el,
				'danger',
				'Change order status confirmation',
				'Are you sure you want to change order status to &laquo;' + data.value + '&raquo;?',
				{
					yes	: ['danger', 'Yes, I agree'],
					no	: ['primary', 'No, I do not agree']
				},
				this.makeChangeStatus,
				data
			);
			
			return false;
			
		},
		
		
		makeChangeStatus : function(result, data) {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.makeChangeStatus');
			
			var self = this;
			
			if (result === 'yes' && _.has(data, 'value')) {
				
				Parse.Cloud.run(
					'orderSetStatus',
					{
						order	: this.model.id,
						status	: data.value
					}
				).then(
					
					function (result) {
						
						app.view.alert(
							null,
							'success',
							'',
							'Order status successfully changed',
							3000
						);
						
						self.model.set('status', data.value);
						
					},
					function (error) {
						
						app.view.alert(
							null,
							'danger',
							'Failure to change an order status',
							error.message,
							false
						);
						
					}
						
				);
				
			}
			
		}
		
		
	});
	
	return view;

});