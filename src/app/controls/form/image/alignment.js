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
	'underscore',
	'parse',
    
    'text!./alignment/form.html'
], function(
	_, Parse,
	
	formTemplate
) {
	
	var view = Parse.View.extend({

		events : _.unpairs([
			['click [data-action="alignment"]', 'doChange']
		]),
		

		initialize : function(options) {
			
			_.bindAll(this, 'fetch', 'render', 'assign', 'apply', 'get', 'set', 'unset', 'disable', 'enable', 'sync', 'build', 'doChange');
			
			this._disabled = false;
			
			if (options.name)
				this._name = options.name;
			
			else
				throw 'name is not defined'; 
			
			this._value = [];
			
			this._template = _.template(formTemplate);
			
		},
		
		
		fetch : function() {
			
			return Parse.Promise.as();
			
		},
		
		
		render : function() {
			
			this.$el.html(this._template());
			
			this.$options = this.$('button');
			
		},
		
		
		assign : function (model) {
			
			this.model = model;
			
			this.sync();
			
		},
		
		
		apply : function() {
			
			if (this._disabled === false) {
				
				var
					before = this.model.get(this._name),
					after = this.get();
				
				if (!_.isEmpty(after)) {
					
					if (!_.isEqual(after, before))
						this.model.set(this._name, after);
					
				} else if (!_.isEmpty(before))
					this.model.unset(this._name);
			
			}
			
			return Parse.Promise.as();
			
		},
		
		
		get : function () {
			
			return !_.isEmpty(this._value) ? this._value : undefined;
			
		},
		
		
		set : function (value) {
			
			if (_.isArray(value))
				this._value = _.intersection(value, IMAGE_ALIGNMENT);
			
			else if (_.isString(value) && _.contains(IMAGE_ALIGNMENT, value)) {
				
				if (_.contains(IMAGE_ALIGNMENT_VERTICAL, value))
					this._value = _.difference(this._value, IMAGE_ALIGNMENT_VERTICAL);
					
				else if (_.contains(IMAGE_ALIGNMENT_HORIZONTAL, value))
					this._value = _.difference(this._value, IMAGE_ALIGNMENT_HORIZONTAL);
					
				this._value.push(value);
				
			}
			
		},
		
		
		unset : function () {

			this._value = [];
			
		},
		
		
		disable : function () {
			
			this._disabled = true;
			
		},
		
		
		enable : function () {
			
			this._disabled = false;
			
		},
		
		
		sync : function () {
			
			if (this.model.has(this._name) && (value = this.model.get(this._name)))
				this.set(value);
				
			else
				this.unset();
			
			this.build();
			
		},
		
		
		build : function () {
			
			this.$options.removeClass('active');
			
			_.each(this._value, function (value) {
				
				this.$options.filter('[data-value="' + value + '"]').addClass('active');
				
			}, this);
			
		},
		
		
		doChange : function (ev) {
			
			var
				$target = $(ev.currentTarget),
				data = $target.data();
			
			if (this._disabled === false && data && data.value)
				this.set(data.value);
			
			this.build();
			
			return false;
			
		}
		
		
	});
	
	return view;
	
});