define([
	'underscore'
], function(_) {
	
	var mixed = _.mixin({
		
		isDefined: function (value) {
			return !_.isUndefined(value);
		},
		
		isNotNull: function (value) {
			return !_.isNull(value);
		},
		
		unpairs : function (values) {
			
			return _.reduce(
				values,
				function (memo, value) {
					
					if (_.isArray(value) && _.size(value) === 2)
						memo[value[0]] = value[1];
					
					return memo;
					
				},
				{}
			);
			
		}
		
	});

});