define([
    'underscore',
    'numeral',
    'parse',
    
    'views/product/image/list',
    'views/product/size/list',
    
    'views/image-list',
    
    'text!templates/product/view.html'
], function (
	_, numeral, Parse,
	ProductImageListView, ProductSizeListView,
	ImageListView,
	viewTemplate
) {
	
	var view = Parse.View.extend({
	
		events : {},
		
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductView.initialize');
	
			_.bindAll(this, 'render', 'build');
	
			this.template = _.template(viewTemplate);
			
			this.productImage = new ProductImageListView({
				limit	: 5,
				type	: 'view'
			});
			
			this.detailPicture = new ImageListView({
				limit	: 1,
				type	: 'view'
			});
			
			this.specImage = new ImageListView({
				limit	: 1,
				type	: 'view'
			});
			
			this.productSize = new ProductSizeListView({
				parent		: this,
				type		: 'view'
			});
			
		},
	
	
		render : function() {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductView.render');
	
			this.$el.html(this.template());
			
			this.productImage.setElement(this.$('#product-form-product-image')).render();
			this.detailPicture.setElement(this.$('#product-form-detail-picture')).render();
			this.specImage.setElement(this.$('#product-form-spec-image')).render();
			
			this.productSize.setElement(this.$('#product-form-size')).render();
			
			return this;
			
		},
		
		
		build : function (model) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductView.build');

			this.model = model;
			
			this.$('.modal-title').html('<strong>Product</strong> view <span class="pull-right">' + this.model.id + '</span>');
			
			_.bindModelToView(
				this.model,
				this,
				{
					brandName				: function ($control, value) {$control.html(value ||'&mdash;');},
					category				: function ($control, value) {$control.html(value ||'&mdash;');},
					productDescription		: function ($control, value) {$control.html(value ||'&mdash;');},
					specs					: function ($control, value) {$control.html(value ||'&mdash;');},
					boutique				: function ($control, value) {$control.html(value instanceof Parse.Object ? value.get('boutiqueName') : '&mdash;');},
					curationDate			: function ($control, value) {$control.html(moment.utc(value).subtract(7, 'h').format('MM/DD/YYYY'));},
					price					: function ($control, value) {$control.html(numeral(value).format('0.00'));},
					salePrice				: function ($control, value) {$control.html(numeral(value).format('0.00'));},
					tags					: function ($control, value) {$control.html(_.isArray(value) ? _.map(value, function (tag) {return '<span class="badge badge-primary">' + tag + '</span>';}).join(' ') : '&mdash;');},
					socialHashtags			: function ($control, value) {$control.html(_.isArray(value) ? _.map(value, function (tag) {return '<span class="badge badge-primary">' + tag + '</span>';}).join(' ') : '&mdash;');},
					archetypes				: function ($control, value) {$control.html(_.isArray(value) ? _.map(value, function (tag) {return '<span class="badge badge-primary">' + tag + '</span>';}).join(' ') : '&mdash;');},
					weatherTags				: function ($control, value) {$control.html(_.isArray(value) ? _.map(value, function (tag) {return '<span class="badge badge-primary">' + tag + '</span>';}).join(' ') : '&mdash;');},
					isValid					: function ($control, value) {$control.html(value === true ? 'Yes' : 'No');},
					isValid_1_0_5			: function ($control, value) {$control.html(value === true ? 'Yes' : 'No');},
					detailTitle				: function ($control, value) {$control.html(value ||'&mdash;');},
					detailDescription		: function ($control, value) {$control.html(value ||'&mdash;');},
					detailSpecsTitle		: function ($control, value) {$control.html(value ||'&mdash;');},
					detailSpecsDescription	: function ($control, value) {$control.html(value ||'&mdash;');},
					interview				: function ($control, value) {$control.html(value instanceof Parse.Object ? value.get('interviewHeader') : '&mdash;');},
					productPictureAlignment	: function ($control, value) {$control.html(value ||'&mdash;');},
					pronoun					: function ($control, value) {$control.html(value ||'&mdash;');},
					sharingLink				: function ($control, value) {$control.html(value ||'&mdash;');},
					color					: function ($control, value) {$control.html(value ||'&mdash;');},
					pictureCredit			: function ($control, value) {$control.html(value ||'&mdash;');},
					pictureCreditURL		: function ($control, value) {$control.html(value ||'&mdash;');},
					productTimelineTitle	: function ($control, value) {$control.html(value ||'&mdash;');},
					productWeight			: function ($control, value) {
						
						value = value || {};
						
						$control.filter('[rel="value"]').html(value.value || '&mdash;');
						$control.filter('[rel="units"]').html(value.units || '&mdash;');
						
					},
					productDimensions		: function ($control, value) {
						
						value = value || {};
						
						$control.filter('[rel="width"]').html(value.width || '&mdash;');
						$control.filter('[rel="height"]').html(value.height || '&mdash;');
						$control.filter('[rel="length"]').html(value.length || '&mdash;');
						$control.filter('[rel="units"]').html(value.units || '&mdash;');
					
					},
					shippingType			: function ($control, value) {$control.html(value ||'&mdash;');},
					flatRate				: function ($control, value) {$control.html(numeral(value).format('0.00'));},
					flatRateInternational	: function ($control, value) {$control.html(numeral(value).format('0.00'));},
					europeFlatRate			: function ($control, value) {$control.html(numeral(value).format('0.00'));},
					worldFlatRate			: function ($control, value) {$control.html(numeral(value).format('0.00'));},
					internationalShipping	: function ($control, value) {$control.html(value === true ? 'Yes' : 'No');},
					availableCountry		: function ($control, value) {$control.html(_.isArray(value) ? _.map(value, function (tag) {return '<span class="badge badge-primary">' + tag + '</span>';}).join(' ') : '&mdash;');}
				},
				{
					attribute	: 'data-name',
					method		: 'html'
				}
			);
			
			// Bind product images
			var images = [];
			
			for (var i = 1; i <= 5; i++) {
				
				if (model.has('image' + i) && (image = model.get('image' + i)) && (image instanceof Parse.File))
					images.push({name: 'image' + i, image: image});
				
			}
			
			this.productImage.collection.reset(images);
			this.productImage.collection.select(this.model.get('selectedImage') || 0);
			
			// Bind detail picture
			var images = [];
			
			if (model.has('detailPicture') && (image = model.get('detailPicture')) && (image instanceof Parse.File))
				images.push({name: 'detailPicture', image: image})
				
			this.detailPicture.collection.reset(images);
			
			// Bind specification image
			var images = [];
			
			if (model.has('specsImageIpad') && (image = model.get('specsImageIpad')) && (image instanceof Parse.File))
				images.push({name: 'specsImageIpad', image: image})
				
			this.specImage.collection.reset(images);
			
			// Bind product sizes
			this.productSize.order(this.model.has('productSize') ? this.model.get('productSize') : []);
			this.productSize.build(!this.model.isNew() ? this.model.relation('sizeAvailable').query() : null);
			
			this.$('.modal').modal('show');
			
			this.$('[data-toggle="tab"]').first().tab('show');
			
		}
		
		
	});
	
	return view;

});