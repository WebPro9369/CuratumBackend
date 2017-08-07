define([
    'underscore',
    'parse',
    
    'text!./view.html'
], function (
	_, Parse,
	formTemplate
) {
	
	const VIEW = {
		TITLE	 	: 'Image',
		NAME		: 'ImageItemControl',
		ID			: 'image'
	};
	
	var view = Parse.View.extend({
	
		tagName : 'figure',
	
		events : _.unpairs([
			['click [data-action="' + VIEW.ID + '-remove"]'			, 'doRemove']
		]),
	
	
		initialize : function(options) {
			
			//if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.initialize');
			
			_.bindAll(this, 'fetch', 'render', 'assign', 'apply', 'get', 'set', 'unset', 'disable', 'enable', 'sync', 'build', 'doRemove');
			//_.bindAll(this, 'render', 'doRemove', 'doAlignment', 'doChangeTitle', 'doToggleTitle');
			
			this._disabled = false;
			
			this.controls = {};
			
			if (options.name)
				this.name = options.name;
			
			this.template = _.template(formTemplate);
			
		},
		
		
		fetch : function() {
			
			return Parse.Promise.as();
			
		},
		
		
		render : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.render');
			try {
			this.$el.html(this.template());
			} catch (e) {
				console.log(e)
			}
			
		},
		
		
		assign : function (model) {
			
			this.model = model;
			
			this.sync();
			
		},
		
		
		apply : function() {},
		
		
		get : function () {},
		
		
		set : function (value) {},
		
		
		unset : function () {},
		
		
		disable : function () {},
		
		
		enable : function () {},
		
		
		sync : function () {},
		
		
		build : function () {},
	
	
		/*render : function() {
			
			//if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.render');
			
			this.$el.html(this.template(this.model.toTemplate())).addClass('effect-zoe');
			
			this.$el.attr('data-id', this.model.cid);
			
			if (this.model.has('alignment'))
			
				_.each(this.model.get('alignment'), function (alignment) {
					this.$('[data-action="' + VIEW_ELEMENT_BASE_ID + '-alignment"][data-value="' + alignment + '"]').addClass('active');
				}, this);
				
			
			this.$('h2.title').editable({
				placement	: 'top',
				inputclass	: 'ignore',
				placeholder	: 'Enter image title',
				emptytext	: 'Title is not specified',
				success		: this.doChangeTitle
			});
			
			this.$('h2.title').on('shown, hidden', this.doToggleTitle);
			
			return this;
			
		},*/
		
		
		doRemove : function(ev) {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.doRemove');
			
			/*if (this.type === 'form') {
				this.model.collection.remove(this.model);
				this.remove();
			}*/
			
			return false;
			
		}
		
		
	});

	return view;

});