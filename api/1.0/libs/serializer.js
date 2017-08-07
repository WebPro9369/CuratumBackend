// Serializer

var _ = require('underscore');

function Serializer(classes, translators) {
	
	this._classes = classes || {};
	this._translators = _.mapObject(translators || {}, function (translator) {return _.bind(translator, this);}, this);
	this._translatorKeys = _.keys(this._translators);
	
	this._includes = {};
	
	_.each(
		this._classes,
		function (definitions, name) {
		
			this._includes[name] = this.includeIterator(name);
		
		},
		this
	);
	
}


Serializer.prototype.iterateArray = function (items, iterator, translators) {
	
	//console.log('iterateArray', items, iterator, translators);
	
	var res = _
		.chain(items)
		.map(
			function (item) {
				
				//console.log('iterateArray 2', item);
				
				var value;
				
				if (_.isFunction(iterator))
					value = iterator(item);
				
				else if (iterator === true)
					value = item;
					
				else
					value = this.iterateObject(item, iterator);
				
				if (!_.isEmpty(translators))
					
					value = _.reduce(
						translators,
						function (val, translator) {
							return translator(val, item, this._options);
						},
						value,
						this
					);
					
				return value;
				
			},
			this
		)
		.compact()
		.value();
	
	if (!_.isEmpty(res))
		return res; 
	
}


Serializer.prototype.iterateObject = function (item, iterator) {
	
	//console.log('iterateObject');//, item, iterator);
	
	if (_.isObject(iterator) && !_.isEmpty(iterator)) {
		
		var res = {};
	
		_.each(iterator, function (type, name) {
			
			//console.log('1', name)
			
			var value, scheme, translators = {};
			
			if (_.isString(type) && _.has(this._classes, type))
				scheme = this._classes[type];
			
			else if (_.isArray(type)) {
				
				var mtype = _.first(type);
				
				if (_.isString(mtype) && _.has(this._classes, mtype))
					scheme = this._classes[mtype];
				
				else if (_.isFunction(mtype))
					scheme = mtype;
				
				else if (mtype === true)
					scheme = mtype;
				
				translators = _.pick(this._translators, _.intersection(_.rest(type), this._translatorKeys));
				
			} else if (_.isFunction(type))
				scheme = type;
			
			else if (type === true)
				scheme = type;
				
			//console.log(scheme)
			//console.log(_.isUndefined(item.has) ? item : null)
			
			if (_.contains(['id', 'createdAt', 'updatedAt'], name))
				value = item[name];
			
			else if (_.isFunction(item.has) && item.has(name))
				value = item.get(name);
			
			//console.log(value)
			
			//console.log('2', name)
			
			if (_.isArray(value))
				value = this.iterateArray(value, scheme, translators);
				
			else if (_.isObject(value)) {
			
				value = this.iterateObject(value, scheme);
			
				if (!_.isEmpty(translators))
					
					value = _.reduce(
						translators,
						function (val, translator) {
							return translator(val, item, this._options);
						},
						value,
						this
					);
			
			} else if (!_.isEmpty(translators)) {
				
				value = _.reduce(
					translators,
					function (val, translator) {
						return translator(val, item, this._options);
					},
					value,
					this
				);
				
			}
			
			//console.log('4', name)
			
			if (!_.isUndefined(value))
				res[name] = value;
			
		}, this);
		
		if (!_.isEmpty(res))
			return res;
	
	/*} else if (_.isFunction(iterator))
		return iterator(item, this);*/
	
	} else if (iterator === true)
		return item;
	
}


Serializer.prototype.flatten = function (obj, parent, res) {
	
	if (!((_.isArray(obj) || _.isObject(obj)) && !_.isEmpty(obj)))
		return;
	
	_.each(
		obj,
		function (value, key) {
			
			var path = parent + (_.isEmpty(parent) ? '' : '_') + key;
			
			if ((_.isArray(value) || _.isObject(value)) && !_.isEmpty(value))
				this.flatten(value, path, res);
				
			else
				res[path] = value;
		},
		this
	);
	
}


Serializer.prototype.serialize = function (value, type, options) {
	
	try {
		
		//console.log('serialize1');
		
		this._options = options || {};
		
		var scheme;
		
		if (_.isString(type) && _.has(this._classes, type))
			scheme = this._classes[type];
		
		else if (_.isFunction(type))
			scheme = type;
		
		else if (type === true)
			scheme = type;
		
		if (!scheme)
			return;
		
		//console.log('serialize2');
		
		var result;
		
		if (this._options.forceArray === true || _.isArray(value))
			result = this.iterateArray(value || [], scheme);
		
		else if (_.isObject(value))
			result = this.iterateObject(value, scheme);
			
		//console.log('serialize3');
		
		if (this._options.flatten === true) {
			
			var flattened = {};
			
			this.flatten(result, '', flattened);
			
			result = flattened;
			
		}
			
		if (this._options.forceArray === true)
			return _.isEmpty(result) ? [] : result;
		
		if (this._options.forceObject === true)
			return _.isEmpty(result) ? {} : result;
		
		return result;
	
	} catch (e) {
		
		console.log(e)
		return false;
		
	}
		
}

Serializer.prototype.includeIterator = function (currentClassName, currentPath) {
	
	var result = [];
	
	_.each(
		this._classes[currentClassName] || [],
		function (definition, name) {
			
			var className;
			
			if (_.isString(definition))
				className = definition;
			
			else if (_.isArray(definition) && _.isString(definition[0]))
				className = definition[0];
			
			if (!_.isUndefined(className)) {
				
				var path = (currentPath ? currentPath + '.' : '') + name;
				
				result.push(path);
				result = _.union(result, this.includeIterator(className, path));
				
			}
			
		},
		this
	);
	
	return result;

}

Serializer.prototype.includes = function (className, specifiedIncludes, defaultIncludes) {
	
	var availableIncludes = this._includes[className] || [];
	
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

module.exports = Serializer;