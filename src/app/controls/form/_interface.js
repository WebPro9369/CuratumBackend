/*
FormControl Interface

fetch	- Fetch control dependency
render	- Render control

assign	- Assign model to control
apply	- Sync control with model

get		- Get control value
set		- Set control value
unset	- Unset control value

disable	- Disable control
enable	- Enable control

sync	- Sync model with control
build	- Build control

*/

define([
	'parse'
], function(
	Parse
) {
	
	var view = Parse.View.extend({

		events : {},
		

		initialize : function(options) {
			
			_.bindAll(this, 'fetch', 'render', 'assign', 'apply', 'get', 'set', 'unset', 'disable', 'enable', 'sync', 'build');
			
			this._disabled = false;
			
		},
		
		
		fetch : function() {},
		
		
		render : function() {},
		
		
		assign : function (model) {},
		
		
		apply : function() {},
		
		
		get : function () {
			
			return this._value;
			
		},
		
		
		set : function (value) {
			
			this._value = value;
			
		},
		
		
		unset : function () {
			
			this._value = null;
			
		},
		
		
		disable : function () {
			
			this._disabled = true;
			
		},
		
		
		enable : function () {
			
			this._disabled = false;
			
		},
		
		
		sync : function () {},
		
		
		build : function () {}
		
		
	});
	
	return view;
	
});