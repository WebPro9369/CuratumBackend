define([
	'underscore',
	'backbone'
], function(
	_, Backbone
) {
	

	var addMethod = function(length, method, attribute) {
		switch (length) {
		case 1:
			return function() {
				return _[method](this[attribute]);
			};
		case 2:
			return function(value) {
				return _[method](this[attribute], value);
			};
		case 3:
			return function(iteratee, context) {
				return _[method](this[attribute], cb(iteratee, this), context);
			};
		case 4:
			return function(iteratee, defaultVal, context) {
				return _[method](this[attribute], cb(iteratee, this), defaultVal, context);
			};
		default:
			return function() {
				var args = slice.call(arguments);
				args.unshift(this[attribute]);
				return _[method].apply(_, args);
			};
		}
	}; 

	var addUnderscoreMethods = function(Class, methods, attribute) {
		
		_.each(
			methods,
			function(length, method) {
				if (_[method]) Class.prototype[method] = addMethod(length, method, attribute);
			}
		);
		
	};

	var cb = function(iteratee, instance) {
		if (_.isFunction(iteratee))
			return iteratee;
		/*if (_.isObject(iteratee) && !instance._isModel(iteratee))
			return modelMatcher(iteratee);*/
		if (_.isString(iteratee))
			return function(model) {
				return model.get(iteratee);
			};
		return iteratee;
	};
	
	/*var modelMatcher = function(attrs) {
		var matcher = _.matches(attrs);
		return function(model) {
			return matcher(model.attributes);
		};
	};*/ 


	var Collection = function(models, options) {

		this._reset();
		
		this.initialize.apply(this, arguments);
		
		if (models)
			this.reset(
				models,
				_.extend({silent : true}, options)
			);
			
	};
	

	_.extend(Collection.prototype, Backbone.Events, {

		initialize : function() {
		},
		

		get: function(obj) {
			
			//console.log(obj, this._byId, this._byId[obj], this.modelId(obj.attributes || obj), this._byId[this.modelId(obj.attributes || obj)],  obj.cid , this._byId[obj.cid])
			
			if (obj == null)
				return void 0;
				
			return this._byId[obj] || this._byId[this.modelId(obj.attributes || obj)] || obj.cid && this._byId[obj.cid];
			
		},

		
		fetch : function () {
			
			var self = this;
			
			return this.query.find().then(
				
				function (results) {
					
					console.log('nnn1')
					try {
						console.log(results);
						//console.log(_.map(results, function (result) {return new BrandModel(result.toJSON());}))
						//self.collection.reset(_.map(results, function (result) {return new self.collection.model(result.toJSON());}));
						self.reset(results);
						//self.collection.add(results[0]);
					} catch (e) {
						console.log(e)
					}
					console.log('nnn2')
					
				}
			
			);
		},
		
		
		add: function(model, options) {
			
			options = options ? _.clone(options) : {};
			
			this.models.push(model);
			this.length++;
			
			this._addReference(model);
			
			if (!options.silent)
				this.trigger('add', model, this, options);
			
		},
		
		
		remove: function(model, options) {
			
			options = options ? _.clone(options) : {};
			
			var index = this.indexOf(model);
	        this.models.splice(index, 1);
    	    this.length--;
    	    
			this._removeReference(model);
			
			if (!options.silent)
				model.trigger('remove', model, this, options);
			
		},
		

		reset : function(models, options) {
			
			options = options ? _.clone(options) : {};
			
			this._reset();
			
			this.models = models;
			this.length = _.isArray(models) ? models.length : 0;
			
			_.each(models, function (model) {
				
				this._addReference(model);
				
			}, this);
			
			this.cid = _.uniqueId(this.cidPrefix);
			
			if (!options.silent)
				this.trigger('reset', this, options);
				
			return models;
		},
		

		modelId: function(model) {
			return model.id;
		},
		
		
		modelCid: function() {
			return _.uniqueId(this.cidPrefix);
		},
		
		
		_reset: function() {
			this.length = 0;
			this.models = [];
			this._byId  = {};
		},
		

		_addReference: function(model, options) {
			this._byId[model.cid] = model;
			var id = this.modelId(model);
			if (id != null)
				this._byId[id] = model;
			//model.on('all', this._onModelEvent, this);
		},


		_removeReference: function(model, options) {
			delete this._byId[model.cid];
			var id = this.modelId(model);
			if (id != null)
				delete this._byId[id];
			/*if (this === model.collection)
				delete model.collection;
			model.off('all', this._onModelEvent, this);*/
		}
		
	});
	

	var collectionMethods = {
		forEach : 3,
		each : 3,
		map : 3,
		collect : 3,
		reduce : 0,
		foldl : 0,
		inject : 0,
		reduceRight : 0,
		foldr : 0,
		find : 3,
		detect : 3,
		filter : 3,
		select : 3,
		reject : 3,
		every : 3,
		all : 3,
		some : 3,
		any : 3,
		include : 3,
		includes : 3,
		contains : 3,
		invoke : 0,
		max : 3,
		min : 3,
		toArray : 1,
		size : 1,
		first : 3,
		head : 3,
		take : 3,
		initial : 3,
		rest : 3,
		tail : 3,
		drop : 3,
		last : 3,
		without : 0,
		difference : 0,
		indexOf : 3,
		shuffle : 1,
		lastIndexOf : 3,
		isEmpty : 1,
		chain : 1,
		sample : 3,
		partition : 3,
		groupBy : 3,
		countBy : 3,
		sortBy : 3,
		indexBy : 3,
		findIndex : 3,
		findLastIndex : 3
	};

	addUnderscoreMethods(Collection, collectionMethods, 'models');
	

	var extend = function(protoProps, staticProps) {
		var parent = this;
		var child;

		// The constructor function for the new subclass is either defined by you
		// (the "constructor" property in your `extend` definition), or defaulted
		// by us to simply call the parent constructor.
		if (protoProps && _.has(protoProps, 'constructor')) {
			child = protoProps.constructor;
		} else {
			child = function() {
				return parent.apply(this, arguments);
			};
		}

		// Add static properties to the constructor function, if supplied.
		_.extend(child, parent, staticProps);

		// Set the prototype chain to inherit from `parent`, without calling
		// `parent`'s constructor function and add the prototype properties.
		child.prototype = _.create(parent.prototype, protoProps);
		child.prototype.constructor = child;

		// Set a convenience property in case the parent's prototype is needed
		// later.
		child.__super__ = parent.prototype;

		return child;
	}; 

	
	Collection.extend = extend; 

	return Collection;

}); 