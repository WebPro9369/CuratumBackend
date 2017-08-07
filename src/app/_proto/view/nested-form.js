define([
	'underscore'
], function(_) {
	
	
	var prototype = {
		
		
		prefetchNestedForm: function (promises) {
			
			_
			.chain(this.form)
			.filter(function (form, name) {return _.isFunction(form.prefetch);})
			.each(function (form, name) {promises.push(form.prefetch());})
			.value();
			
		},
		
		
		fetchNestedForm: function (promises) {
			
			_
			.chain(this.form)
			.filter(function (form, name) {return _.isFunction(form.fetch);})
			.each(function (form, name) {_.isArray(promises) ? promises.push(form.fetch()) : form.fetch();})
			.value();
			
		},
		

		renderNestedForm: function () {
			
			_.each(this.form, function (form, name) {
				
				form.setElement(this.$('[role="form"][rel="' + name + '"]'));
				
				if (_.isFunction(form.render))
					form.render();
					
			}, this);
			
		},
		
		
		buildNestedForm: function () {
			
			_
			.chain(this.form)
			.filter(function (form, name) {return _.isFunction(form.build);})
			.each(function (form, name) {form.build();})
			.value();
			
		},
		
		
		submitNestedForm: function () {
			
			_
			.chain(this.form)
			.filter(function (form, name) {return _.isFunction(form.submit);})
			.each(function (form, name) {form.submit();})
			.value();

		}
		
	
	};
	
	return prototype;

});