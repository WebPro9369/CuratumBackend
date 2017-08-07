define([
    'underscore',
    'backbone',
    'parse',
    
    'views/image-list',
    
    'text!templates/interview/view.html',
    
    'mCustomScrollbar'
], function (
	_, Backbone, Parse,
	ImageListView,
	viewTemplate
) {
	
	var view = Backbone.View.extend({
	
		events : {},
		
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('InterviewView.initialize');
	
			_.bindAll(this, 'render', 'build');
			
			this.images = {};
	
			this.template = _.template(viewTemplate);
			
			this.images.interviewPicture = new ImageListView({
				parent		: this,
				limit		: 1,
				type		: 'view'
			});
			
		},
	
	
		render : function() {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('InterviewView.render');
	
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
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('InterviewView.build');
			
			this.model = model;
			
			_.bindModelToView(
				this.model,
				this,
				{
					interviewTitle				: function ($control, value) {$control.html(value ||'&mdash;');},
					interviewingBrand			: function ($control, value) {$control.html(value ||'&mdash;');},
					interviewHeader				: function ($control, value) {$control.html(value ||'&mdash;');},
					interviewSubHeader			: function ($control, value) {$control.html(value ||'&mdash;');},
					interviewDescription		: function ($control, value) {$control.html(value ||'&mdash;');},
					interviewURL				: function ($control, value) {$control.html(value ||'&mdash;');},
					interviewDetailTitle		: function ($control, value) {$control.html(value ||'&mdash;');},
					interviewDetailDescription	: function ($control, value) {$control.html(value ||'&mdash;');},
					interviewVideoURL			: function ($control, value) {$control.html(value ||'&mdash;');},
					interviewHideHeader			: function ($control, value) {$control.html(value ||'&mdash;');},
					interviewPictureAlignment	: function ($control, value) {$control.html(value ||'&mdash;');},
					color						: function ($control, value) {$control.html(value ||'&mdash;');},
					pictureCredit				: function ($control, value) {$control.html(value ||'&mdash;');},
					pictureCreditURL			: function ($control, value) {$control.html(value ||'&mdash;');}
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