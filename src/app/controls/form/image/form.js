define([
    'underscore',
    'parse',
    
    'proto/view/nested-controls',
    
    './alignment',
    
    'text!./form.html',
    
    'jquery-validation',
    'jquery-validation.defaults',
    'bootstrap-multilanguage',
    'bootstrap-link'
], function (
	_, Parse,
	NestedControlsProto,
	ImageAlignmentControl,
	formTemplate
) {
	
	const VIEW = {
		TITLE	 	: 'Image',
		NAME		: 'ImageItemControl',
		ID			: 'image'
	};
	
	var view = Parse.View.extend({
	
		tagName : 'div',
	
		events : _.unpairs([
			['click [data-action="remove"][rel="' + VIEW.ID + '"]'			, 'doRemove']
		]),
	
	
		initialize : function(options) {
			
			//if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.initialize');
			
			_.bindAll(this, 'fetch', 'render', 'assign', 'apply', 'get', 'set', 'unset', 'disable', 'enable', 'sync', 'build', 'submit', 'doRemove');
			
			this._disabled = false;
			
			this.controls = {};
			
			if (options.name)
				this.name = options.name;
			
			this.template = _.template(formTemplate);
			
			this.controls.alignment = new ImageAlignmentControl({
				parent		: this,
				name		: 'alignment'
			});
			
		},
		
		
		fetch : function() {
			
			return Parse.Promise.as();
			
		},
		
		
		render : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.render');

			this.$el.html(this.template(VIEW));
			this.$el.addClass('row column-seperation m-b-20');
			
			this.renderNestedControls();
			
			this.$('form#' + VIEW.ID + '-form').validate({
				context : this.$el,
				rules : {
				},
				submitHandler : this.submit
			});
			
			this.$('.multilanguage-control').bootstrapMultilanguage({languages: app.settings.enums.language, language: app.settings.config.DEFAULT_LANGUAGE});
			this.$('.link-control').bootstrapLink();
			
			return this;
			
		},
		
		
		assign : function (model) {
			
			this.model = model;
			
			//model.view = this;
			
			this.sync();
			
		},
		
		
		apply : function() {
			
			/*var self = this;
			
			this.model.unbindView(
				this,
				{
					alignment					: null,
					title						: function ($control, value) {return $control.bootstrapMultilanguage('get');},
					creditLink					: function ($control, value) {return $control.bootstrapLink('get');}
				}
			);
			
			var promises = [];
			
			this.applyNestedControls(promises);
			
			/*return Parse.Promise.when(promises).then(
				
				function () {
					
			 		return self.model.save();
			 		
				}
				
			);*/
			
		},
		
		
		get : function () {},
		
		
		set : function (value) {},
		
		
		unset : function () {},
		
		
		disable : function () {},
		
		
		enable : function () {},
		
		
		sync : function () {
			
			this.build();
			
		},
		
		
		build : function () {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.build');
			
			this.assignNestedControls(this.model);
			
			this.model.bindView(
				this,
				{
					alignment					: null,
					originalUrl					: function ($control, value) {$control.attr('src', value instanceof Parse.File ? value.url() : ASSET_NO_IMAGE);},
					title						: function ($control, value) {$control.bootstrapMultilanguage('set', value);},
					creditLink					: function ($control, value) {$control.bootstrapLink('set', value);}
				},
				{
					form						: VIEW.ID + '-form'
				}
			);
			
		},
		
		
		submit : function () {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.submit');
			
			var self = this;
			
			this.model.unbindView(
				this,
				{
					alignment					: null,
					title						: function ($control, value) {return $control.bootstrapMultilanguage('get');},
					creditLink					: function ($control, value) {return $control.bootstrapLink('get');}
				},
				{
					form						: VIEW.ID + '-form'
				}
			);
			
			var promises = [];
			
			this.applyNestedControls(promises);
			
			this.model.trigger('change');
			
			return false;
		
		},
		
		
		doRemove : function(ev) {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.doRemove');
			
			this.model.collection.remove(this.model);
			this.remove();
			
			return false;
			
		}
		
		
	})
	.extend(_.clone(NestedControlsProto));

	return view;

});