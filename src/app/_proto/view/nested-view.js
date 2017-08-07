define([
	'underscore'
], function(_) {
	
	
	var prototype = {

		renderNestedView: function () {
			
			_.each(this.view, function (view, name) {
				
				view.setElement(this.$('[role="view"][rel="' + name + '"]'));
				
				if (_.isFunction(view.render))
					view.render();
					
			}, this);
			
		},
		
		
		buildNestedView: function () {
			
			_
			.chain(this.view)
			.filter(function (view, name) {return _.isFunction(view.build);})
			.each(function (view, name) {view.build();})
			.value();
			
		}
	
	};
	
	return prototype;

});