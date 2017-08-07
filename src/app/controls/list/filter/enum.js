/*
EnumFilterControl

collection.query	: Parse.Query (required)		- Filtered query
name				: String (required) 			- Filtered attribute and storage key
datasource			: Array (required)				- Datasource array with items which should have id and text attributes
type				: String (default = 'String')	- Value data type
disabled			: Boolean						- Disable control
storage				: StorageManager				- StorageManager instance to hold values
beforeApply			: Function						- The function called when changing values

*/

define([
    'underscore',
    'parse',
    
    'select2'
], function(
	_, Parse
) {
	
	var
		TYPE_STRING		= 'String',
		TYPE_NUMBER		= 'Number',
		TYPE_BOOLEAN	= 'Boolean'
	
	var view = Parse.View.extend({

		events : {
			'change'	: 'doChange'
		},
		

		initialize : function(options) {
			
			_.bindAll(this, 'fetch', 'render', 'apply', 'value', 'reset', 'ready', 'disable', 'enable', 'invalidate', 'build', 'doChange');
			
			this._ready = false;
			this._disabled = false;
			
			this._options = options;
			
			if (options.name)
				this._name = options.name;
			else
				throw 'name is required';
				
			if (!(this.collection && (this.collection.query instanceof Parse.Query)))
				throw 'collection.query must be instance of Parse.Query';
				
			if (options.datasource && _.isArray(options.datasource))
				this._datasource = options.datasource;
			else
				throw 'datasource is empty';
				
			this._type = options.type || 'String';
			this._storage = options.storage || null;
			this._nullable = options.nullable === false ? false : true;
			
			if (this._storage && this._storage.has(this._name)) {
				
				var value = this._storage.get(this._name, '');
				
				if (this._type === TYPE_BOOLEAN) {
					
					if (value.match(/^true$/i)) this._value = true;
					else if (value.match(/^false$/i)) this._value = false;
					
				} else if (this._type === TYPE_NUMBER)
					this._value = parseFloat(value);
					
				else if (this._type === TYPE_STRING)
					this._value = String(value);
					
				else
					this._value = null; 
				
			} else
				this._value = null;
			
		},
		
		
		fetch : function() {
			
			return Parse.Promise.as(this.build());
			
		},
		
		
		render : function() {},
		
		
		apply : function() {
			
			if (this._storage) {
				
				if (!_.isNull(this._value))
					this._storage.set(this._name, String(this._value));
				else
					this._storage.unset(this._name);
				
			}

			if (_.isFunction(this._options.beforeApply))
				this._options.beforeApply(this, this.collection.query, this._value);
			
			else if (!_.isNull(this._value))
				this.collection.query.equalTo(this._name, this._value);
				
			else
				this.collection.query._removeConstraint(this._name, 'equalTo');
				
			this._ready = true;

			this.collection.trigger('filter:' + this._name, 'filter:' + this._name, this.collection, this, this._name, this._value);
			this.collection.trigger('filter:*', 'filter:*', this.collection, this, this._name, this._value);
			
		},
		
		
		value : function (complex) {
			
			if (complex === true)
				return _.findWhere(this._datasource, {id: this._value})
				
			else
				return this._value;
			
		},
		
		
		reset : function () {
			
			this._value = null;
			
		},
		
		
		ready : function() {
			
			return this._ready;
			
		},
		
		
		disable : function() {
			
			this._disabled = true;
			
			this.invalidate();
			
		},
		
		
		enable : function() {
			
			this._disabled = false;
			
			this.invalidate();
			
		},
		
		
		invalidate : function () {
			
			this._ready = false;
			
			var self = this;
			
			this.fetch().then(
				
				function () {
					
					if (_.isNull(self._value) && self._nullable !== true && !_.isEmpty(self._datasource)) {
						
						var value = _.first(self._datasource);
						
						self._value = value.id;
						
						self.$el.select2('val', String(self._value));
						
					}
					
					self.apply();
					
				}
				
			);
			
		},
		
		
		build : function () {
			
			var params = {
				data		: this._datasource,
				allowClear	: this._nullable
			};
			
			this.$el.select2(params);
			
			this.$el.select2('val', String(this._value));
			
		},
		
		
		doChange : function(ev) {
			
			var
				$target = $(ev.currentTarget),
				data = $target.select2('data');
			
			this._value = data && _.has(data, 'id') ? data.id : null;
			
			this.apply();
				
		}
		
		
	});
	
	return view;
	
});