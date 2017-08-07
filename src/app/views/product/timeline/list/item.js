define([
    'jquery',
    'underscore',
    'moment',
    'parse',
    
    'text!templates/product/timeline/list/item.html',
    'icheck'
], function(
	$, _, moment, Parse,
	itemTemplate
) {
	
	var view = Parse.View.extend({
	
		tagName : 'tr',
	
		events : {
			'ifChanged [name="selected"]'		: 'doSelect'
		},
	
	
		initialize : function() {
			
			//if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('TimelineListItemView.initialize');
			
			_.bindAll(this, 'render', 'doSelect');
			
			this.template = _.template(itemTemplate);
			
			this.model.bind('change', this.render);
	
		},
	
	
		render : function() {
			
			//if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('TimelineListItemView.render');
			
			this.$el.html(this.template(this.model.toTemplate()));
			
			this.$selected = this.$('[name="selected"]');
			
			this.$selected.iCheck({
				checkboxClass: 'icheckbox_flat'
			});
			
			this.$selected.prop('checked', this.model._selected === true);
			
			this.$selected.iCheck('update');
			
			return this;
			
		},
		
		
		doSelect : function(ev) {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('TimelineListItemView.doSelect');
			
			var
				$target = $(ev.currentTarget),
				selected = $target.prop('checked');
			
			console.log($target, selected)
			
			this.model.select(selected);
			
			return false;
			
		}
		
		
	});
	
	return view;

});