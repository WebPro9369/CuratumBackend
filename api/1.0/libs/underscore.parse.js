var _ = require('underscore');

////////////////////////////////////////////////////////////////////////////////
// Underscore extension

_.mixin({
	
	isDefined: function (value) {
		return !_.isUndefined(value);
	},
	
	isNotNull: function (value) {
		return !_.isNull(value);
	},
	
	isParseId: function (value) {
		
		return _.isString(value) && value.match(/^[A-Za-z0-9]{10}$/);
		
	},
	
	isParseAcl: function (value) {
		
		return value && (value instanceof Parse.ACL);
		
	},
	
	isParseObject: function (value) {
		
		return value && (value instanceof Parse.Object);
		
	},
	
	isParseRole: function (value) {
		
		return value && (value instanceof Parse.Role);
		
	},
	
	isParseUser: function (value) {
		
		return value && (value instanceof Parse.User);
		
	},
	
	requestMatch : function (request, name, type, result) {
		
		if (!_.has(request, name))
			return false;
			
		var value = request[name];
		
		if (_.isUndefined(value))
			return false;
		
		var matches = false;
		
		if (!_.isUndefined(type)) {
			
			if (type === 'Id')
				matches = _.isParseId(value);
			
			else if (type === 'Date')
				matches = _.isDate(value);
				
			else if (type === 'Array')
				matches = _.isArray(value) && !_.isEmpty(value);
				
			else if (type === 'Object')
				matches = _.isObject(value) && !_.isEmpty(value);
				
			else if (type === 'String')
				matches = _.isString(value) && !_.isEmpty(value);
				
			else if (type === 'Number')
				matches = _.isNumber(value) && _.isFinite(value);
				
			else if (type === 'Boolean')
				matches = _.isBoolean(value);
			
			else if (_.isFunction(type))
				matches = type(value);
			
		} else {
		
			if (_.isDate(value))
				matches = true;
			
			else if (_.isArray(value) && !_.isEmpty(value))
				matches = true;
			
			else if (_.isObject(value) && !_.isEmpty(value))
				matches = true;
				
			else if (_.isString(value) && !_.isEmpty(value))
				matches = true;
			
			else if (_.isNumber(value) && _.isFinite(value))
				matches = true;
			
			else if (_.isBoolean(value))
				matches = true;
				
		}
		
		if (!_.isUndefined(result) && _.isObject(result))
			result[name] = value;
		
		return matches;
		
	},
	
	
	includeMerge : function (specifiedIncludes, availableIncludes, defaultIncludes) {
		
		var result = [];
		
		if (!_.isUndefined(specifiedIncludes) && _.isArray(specifiedIncludes))
			result = _.union(result, specifiedIncludes);
		
		if (!_.isUndefined(defaultIncludes) && _.isArray(defaultIncludes))
			result = _.union(result, defaultIncludes);
		
		var requiredIncludes = [];
		
		_.each(result, function (includes) {
			
			return _.reduce(
				includes.split(/\./),
				function (base, include) {
					base.push(include);
					requiredIncludes.push(base.join('.'));
					return base;
				},
				[]
			);
			
		});
		
		if (!_.isEmpty(requiredIncludes))
			result = _.union(result, requiredIncludes);
		
		if (!_.isUndefined(availableIncludes) && _.isArray(availableIncludes))
			result = _.intersection(result, availableIncludes);
		
		return result;
		
	}
	
});
