define([
    'underscore',
    'parse.core'
], function(_, Parse) {
	
	Parse.Router.prototype._routeToRegExp = function(route) {
	
		var
			namedParam    = /:\w+/g,
			splatParam    = /\*\w+/g,
			escapeRegExp  = /[\-\[\]{}()+?.,\\\^\$\|#\s]/g;
		
		route = route.replace(escapeRegExp, '\\$&').replace(namedParam, '([^\/\!]+)').replace(splatParam, '([^\!]*?)');
					
		return new RegExp('^' + route + '(?:\!.*)?$');
	
	};
	
	Parse.Router.prototype._generate = function (name, params, filters) {
			
		for (var value in this.routes) {
			
			var key = this.routes[value];
			
			if (key == name) {
				
				var parameters = value.match(/:\w+/g);
				parameters = _.map(parameters, function (value) {return value.slice(1);});
				
				if (_.isEmpty(_.difference(parameters, !_.isEmpty(params) && _.isObject(params) ? _.keys(params) : []))) {
					
					return '#' + 
						value.replace(/:(\w+)/g, _.bind(function (match, p1, offset, str) {return this[p1] ? this[p1] : '';}, params)) +
						(
							!_.isEmpty(filters) && _.isObject(filters) ? 
								'!' + _.map(filters, function (value, key) {return key + '=' + encodeURI(value);}).join(',') :
								''
						);
					
				}
				
			}
			
		}
		
		console.error('No matched route for generate');
		console.error(name, params, filters);
		
		return '#';
		
	};
	
	Parse.Query.prototype._removeConstraint = function(key, constraint) {
		
		var constraints = {
			'notEqualTo'				: ['$ne'],
			'lessThan'					: ['$lt'],
			'greaterThan'				: ['$gt'],
			'lessThanOrEqualTo'			: ['$lte'],
			'greaterThanOrEqualTo'		: ['$gte'],
			'containedIn'				: ['$in'],
			'notContainedIn'			: ['$nin'],
			'containsAll'				: ['$all'],
			'exists'					: ['$exists'],
			'doesNotExist'				: ['$exists'],
			'matches'					: ['$regex', '$options'],
			'matchesQuery'				: ['$inQuery'],
			'doesNotMatchQuery'			: ['$notInQuery'],
			'matchesKeyInQuery'			: ['$select'],
			'doesNotMatchKeyInQuery'	: ['$dontSelect'],
			'contains'					: ['$regex'],
			'startsWith'				: ['$regex'],
			'endsWith'					: ['$regex'],
			'near'						: ['$nearSphere'],
			'withinRadians'				: ['$maxDistance'],
			'withinMiles'				: ['$maxDistance'],
			'withinKilometers'			: ['$maxDistance'],
			'withinGeoBox'				: ['$within']
		};
		
		if (_.has(this._where, key) && _.has(constraints, constraint) && _.isObject(this._where[key])) {
			
			var condition = constraints[constraint];
			
			if (conditions = _.intersection(_.keys(this._where[key]), condition)) {
				
				_.each(conditions, function (condition) {
					delete(this[condition]);
				}, this._where[key]);
				
			}
			
			if (_.isEmpty(this._where[key]))
				delete(this._where[key]);
			
		} else if (_.has(this._where, key) && constraint == 'equalTo') {
			delete(this._where[key]);
		}

		return this;
		
	};
	
	Parse.Object.prototype.toTemplate = function () {
		
		var
			types		= _.isFunction(this.types) ? this.types() : {},
			defaults	= {Entity: {}, String: '', Number: null, Boolean: null, Date: null, Array: [], Object: {}};
		
		//console.log(this.types())
		
		var objectValues = _.mapObject(this.attributes, function (value, key) {
			
			if (value && (value instanceof Parse.Object) && _.isFunction(value.toTemplate))
				return value.toTemplate();
				
			else if (value && (value instanceof Parse.File))
				return {name: value.name(), url: value.url()};
			
			else if (_.has(types, key) && types[key].name === 'Entity') {
				
				//var entity = this.entity(key);
				var entity = new types[key](this, key);
				
				return entity.toTemplate();
			
			} else if (_.isArray(value) && !_.isEmpty(value))
				
				return _.map(value, function (val) {return (val instanceof Parse.Object) && _.isFunction(val.toTemplate) ? val.toTemplate() : val;});
				
			else
				return value;
			
		}, this);
		
		//console.log(objectValues)
		
		var defaultValues = _.mapObject(types, function (type, key) {
			
			return type.name && _.has(defaults, type.name) ? defaults[type.name] : null;
			
		});
		
		if (_.has(this, 'id'))
			objectValues.id = objectValues.objectId = this.id;
		
		if (_.has(this, 'createdAt'))
			objectValues.createdAt = this.createdAt;
		
		if (_.has(this, 'updatedAt'))
			objectValues.updatedAt = this.updatedAt;
		
		var values = _.extend(defaultValues, objectValues);
		
		var formattedValues = _.mapObject(this._formats, function (encoder, key) {
			
			return _.isFunction(encoder) ? encoder(this, values) : null;
			
		}, this);
		
		return _.extend(values, formattedValues);
		
	};
	
	Parse.Object.prototype.bindView = function (view, translate, options) {
		
		var
			translate	= translate || {},							// The list of functions for translating values
			attribute	= options && options.attribute || 'name',	// HTML attribute pointing to element
			restrict	= options && options.restrict || [],		// Processing only the specified keys
			defaultValue= options && options.defaultValue || null,	// Default value
			method		= options && options.method || 'val',		// The function to assign a value
			form		= options && options.form || '';			// Additional data-form attribute to bind control
			
		var
			types		= _.isFunction(this.types) ? this.types() : {},
			model		= this;
		
		if (_.isArray(restrict) && !_.isEmpty(restrict))
			types = _.pick(types, restrict);
		
		_.each(
			types,
			function (type, key) {
				
				var $control = view.$('[' + attribute + '="' + key + '"]' + (form ? '[form="' + form + '"]' : ''));
				
				if (_.has(translate, key)) {
					
					if (_.isFunction(translate[key]))
						translate[key](
							$control.size() > 0 ? $control : null,
							_.contains(['createdAt', 'updatedAt', 'id'], key) ? model[key] : model.get(key),
							model,
							view
						);
					
				} else {
					
					if ($control.size() === 1) {
						
						var
							modelValue			= _.contains(['createdAt', 'updatedAt', 'id'], key) ? model[key] : model.get(key),
							controlValue		= null,
							hasValue			= _.contains(['createdAt', 'updatedAt', 'id'], key) ? true : model.has(key);
						
						if (type.name === 'String')
							controlValue = hasValue ? String(modelValue) : null;
							
						else if (type.name === 'Number')
							controlValue = hasValue ? String(modelValue) : null;
							
						else if (type.name === 'Boolean')
							controlValue = hasValue ? String(modelValue) : null;
							
						else if (type.name === 'Date')
							controlValue = hasValue ? String(modelValue) : null;
							
						else if (type.name === 'Array')
							controlValue = hasValue ? String(modelValue) : null;
							
						else if (type.name === 'Object')
							controlValue = null;
						
						if (_.contains(['String', 'Number', 'Boolean', 'Date', 'Array', 'Object'], type.name))
							$control[method](hasValue ? controlValue : (defaultValue || null));
						
					}
					
				}
				
			}
		);

	};
	
	
	Parse.Object.prototype.unbindView = function (view, translate, options) {
			
		var
			translate	= translate || {},							// The list of functions for translating values
			attribute	= options && options.attribute || 'name',	// HTML attribute pointing to element
			restrict	= options && options.restrict || [],		// Processing only the specified keys
			method		= options && options.method || 'val',		// The function to assign a value
			form		= options && options.form || '',			// Additional data-form attribute to bind control
			strict		= options && options.strict || true;		// Strict value types
		
		var
			types		= _.isFunction(this.types) ? this.types() : {},
			model		= this;

		if (_.isArray(restrict) && !_.isEmpty(restrict))
			types = _.pick(types, restrict);
		
		_.each(
			types,
			function (type, key) {
				
				var $control = view.$('[' + attribute + '="' + key + '"]' + (form ? '[form="' + form + '"]' : ''));
				
				if (_.has(translate, key)) {
					
					var modelValue =
						_.isFunction(translate[key])
						?
						translate[key](
							$control.size() > 0 ? $control : null,
							$control.size() === 1 ? $control[method]() : null,
							model,
							view,
							key,
							options
						)
						:
						translate[key];
					
					if (!_.isUndefined(modelValue)) {
						
						/*if (strict && !(modelValue instanceof type))
							console.error('bindFormToModel: unexpected value type for key "' + key + '".');
							//throw 'bindFormToModel: unexpected value type for key "' + key + '".';
						*/
						if (!_.isNull(modelValue))
							model.set(key, modelValue);
					
					} else if (model.has(key))
						model.unset(key);
					
				} else {
					
					if ($control.size() === 1 && _.contains(['String', 'Number', 'Boolean', 'Date', 'Array'], type.name)) {
						
						var
							controlValue		= $control[method](),
							modelValue			= undefined,
							hasValue			= undefined;
						
						if (type.name === 'String') {
							
							modelValue = new type(controlValue);
							hasValue = !_.isEmpty(modelValue);
							
						} else if (type.name === 'Number') {
							
							modelValue = new type(controlValue);
							hasValue = !_.isEmpty(controlValue) && _.isFinite(modelValue);
							
						} else if (type.name === 'Boolean') {

							if (controlValue === 'true')
								modelValue = true;
								
							else if (controlValue === 'false')
								modelValue = false;
							
							hasValue = _.isBoolean(modelValue);
							
						} else if (type.name === 'Date') {
							
							modelValue = new type(controlValue);
							hasValue = !_.isEmpty(controlValue);
							
						} else if (type.name === 'Array') {
							
							modelValue = controlValue.split(/,/);
							hasValue = !_.isEmpty(controlValue) && !_.isEmpty(modelValue);
							
						}
							
						if (hasValue === true && !_.isUndefined(modelValue)) {
							
							if (strict && !(modelValue instanceof type))
								console.error('bindFormToModel: unexpected value type for key "' + key + '".');
								//throw 'bindFormToModel: unexpected value type for key "' + key + '".';
							
							model.set(key, modelValue.valueOf());
							
						} else if (model.has(key))
							model.unset(key);
						
						
					}
					
				}
				
			}
		);
		
	};
	
	
	return Parse;
	
});