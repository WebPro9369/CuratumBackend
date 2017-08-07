define([
    'underscore',
    'parse',
    
    'views/image-list',
    
    'text!templates/brand/view.html',
    
    'mCustomScrollbar'
], function (
	_, Parse,
	ImageListView,
	viewTemplate
) {
	
	const VIEW = {
		TITLE	 	: 'Brand',
		NAME		: 'BrandView',
		ID			: 'brand'
	};
	
	var view = Parse.View.extend({
	
		events : {},
		
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('BrandView.initialize');
	
			_.bindAll(this, 'render', 'build');
			
			this.images = {};
	
			this.template = _.template(viewTemplate);
			
			this.images.brandLogo = new ImageListView({
				parent		: this,
				limit		: 1,
				type		: 'view'
			});
			
			this.images.brandPicture = new ImageListView({
				parent		: this,
				limit		: 1,
				type		: 'view'
			});
			
		},
	
	
		render : function() {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('BrandView.render');
	
			this.$el.html(this.template());
			
			_.each(this.images, function (image, name) {
				image.setElement(this.$('#' + name)).render();
			}, this);
			
			this.$('.mCustomScrollbar').mCustomScrollbar({
				autoHideScrollbar: true,
				theme: 'dark',
				set_height: 200,
				advanced: {
					updateOnContentResize: true
				}
			});
			
			return this;
			
		},
		
		
		build : function (model) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('BrandView.build');
			
			this.model = model;
			
			_.bindModelToView(
				this.model,
				this,
				{
					brandName				: function ($control, value) {$control.html(value ||'&mdash;');},
					brandTitle				: function ($control, value) {$control.html(value ||'&mdash;');},
					brandDescription		: function ($control, value) {$control.html(value ||'&mdash;');},
					brandLinkTitle			: function ($control, value) {$control.html(value ||'&mdash;');},
					brandURL				: function ($control, value) {$control.html(value ||'&mdash;');},
					brandDetailTitle		: function ($control, value) {$control.html(value ||'&mdash;');},
					brandDetailDescription	: function ($control, value) {$control.html(value ||'&mdash;');},
					brandPictureAlignment	: function ($control, value) {$control.html(value ||'&mdash;');},
					color					: function ($control, value) {$control.html(value ||'&mdash;');},
					pictureCredit			: function ($control, value) {$control.html(value ||'&mdash;');},
					pictureCreditURL		: function ($control, value) {$control.html(value ||'&mdash;');}
				},
				{
					attribute	: 'data-name',
					method		: 'html'
				}
			);
			
			_.each(this.images, function (control, name) {
				
				var images = [];
				
				if (model.has(name) && (image = model.get(name)) && (image instanceof Parse.File))
					images.push({name: name, image: image})
					
				control.collection.reset(images);
				
			});
			
			this.$('.modal').modal('show');
			
			this.$('[data-toggle="tab"]').first().tab('show');
			
		}
		
		
	});
	
	return view;

});