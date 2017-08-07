/*
FilterControl Interface

fetch		- Fetch filter dependency
render		- Render filter

apply		- Sync filter with query

value		- Get filter value
reset		- Reset filter value
ready		- Check filter ready

disable		- Disable filter
enable		- Enable filter

invalidate	- Invalidate filter
build		- Build filter

*/

define([
    'underscore',
    'parse',
    
    'select2'
], function(
	_, Parse
) {
	
	var view = Parse.View.extend({

		events : {},
		

		initialize : function(options) {
			
			_.bindAll(this, 'fetch', 'render', 'apply', 'value', 'reset', 'ready', 'disable', 'enable', 'invalidate', 'build');
			
			this._ready = false;
			this._disabled = false;
			
			if (options.name)
				this.name = options.name;
			else
				throw 'name is required';
				
			if (!(this.collection && (this.collection.query instanceof Parse.Query)))
				throw 'collection must be instance of Parse.Collection';
				
			this._value = null;
			
		},
		
		
		fetch : function() {},
		
		
		render : function() {},
		
		
		apply : function() {},
		
		
		value : function() {},
		
		
		reset : function() {
			
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
					
					self.apply();
					
				}
				
			);
			
		},
		
		
		build : function () {}
		
		
	});
	
	return view;
	
});