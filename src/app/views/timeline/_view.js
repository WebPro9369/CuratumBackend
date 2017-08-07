define([
    'underscore',
    'parse',
    
    'views/image-list',
    
    'text!templates/timeline/view.html',
    
    'mCustomScrollbar'
], function (
	_, Parse,
	ImageListView,
	viewTemplate
) {
	
	var view = Parse.View.extend({
	
		events : {},
		
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('TimelineView.initialize');
	
			_.bindAll(this, 'render', 'build');
			
			this.images = {};
	
			this.template = _.template(viewTemplate);
			
			this.images.timelinePicture = new ImageListView({
				parent		: this,
				limit		: 1,
				type		: 'view'
			});
			
			this.images.authRequiredImagePhone = new ImageListView({
				parent		: this,
				limit		: 1,
				type		: 'view'
			});
			
			this.images.authRequiredImageTablet = new ImageListView({
				parent		: this,
				limit		: 1,
				type		: 'view'
			});
			
			this.images.discountImagePhone = new ImageListView({
				parent		: this,
				limit		: 1,
				type		: 'view'
			});
			
			this.images.discountImageTablet = new ImageListView({
				parent		: this,
				limit		: 1,
				type		: 'view'
			});
			
			this.images.wonImagePhone = new ImageListView({
				parent		: this,
				limit		: 1,
				type		: 'view'
			});
			
			this.images.wonImageTablet = new ImageListView({
				parent		: this,
				limit		: 1,
				type		: 'view'
			});
			
		},
	
	
		render : function() {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('TimelineView.render');
	
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
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('TimelineView.build');
			
			this.model = model;
			
			this.$('.modal-title').html('<strong>Timeline</strong> view <span class="pull-right">' + this.model.id + '</span>');
			
			_.bindModelToView(
				this.model,
				this,
				{
					timelineTitle			: function ($control, value) {$control.html(value ||'&mdash;');},
					timelineSubTitle		: function ($control, value) {$control.html(value ||'&mdash;');},
					timelineDescription		: function ($control, value) {$control.html(value ||'&mdash;');},
					isMain					: function ($control, value) {$control.html(value === true ? 'Yes' : 'No');},
					dontShow				: function ($control, value) {$control.html(value === true ? 'Yes' : 'No');},
					sharingLink				: function ($control, value) {$control.html(value ||'&mdash;');},
					tapstreamLink			: function ($control, value) {$control.html(value ||'&mdash;');},
					fontColor				: function ($control, value) {$control.html(value ||'&mdash;');},
					promoDiscount			: function ($control, value) {$control.html(numeral(value).format('0.00'));},
					wonTextNotification		: function ($control, value) {$control.html(value ||'&mdash;');},
					availableCountry		: function ($control, value) {$control.html(_.isArray(value) ? _.map(value, function (tag) {return '<span class="badge badge-primary">' + tag + '</span>';}).join(' ') : '&mdash;');}
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