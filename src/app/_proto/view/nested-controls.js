define([
	'underscore'
], function(_) {
	
	
	var prototype = {
		
		
		prefetchNestedControls: function (promises) {
			
			_
			.chain(this.controls)
			.filter(function (control, name) {return _.isFunction(control.prefetch);})
			.each(function (control, name) {promises.push(control.prefetch());})
			.value();
			
		},
		
		
		fetchNestedControls: function (promises) {
			
			_
			.chain(this.controls)
			.filter(function (control, name) {return _.isFunction(control.fetch);})
			.each(function (control, name) {promises.push(control.fetch());})
			.value();
			
		},


		renderNestedControls: function () {
			
			_.each(this.controls, function (control, name) {
				
				control.setElement(this.$('[name="' + name + '"]'));
				
				if (_.isFunction(control.render))
					control.render();
				
			}, this);
			
		},

		
		assignNestedControls: function (object) {
			
			_
			.chain(this.controls)
			.filter(function (control, name) {return _.isFunction(control.assign);})
			.each(function (control, name) {control.assign(object);})
			.value();
			
		},

		
		applyNestedControls: function (promises) {
			
			_
			.chain(this.controls)
			.filter(function (control, name) {return _.isFunction(control.apply);})
			.each(function (control, name) {promises.push(control.apply());})
			.value();
			
		}
	
	};
	
	return prototype;

});

