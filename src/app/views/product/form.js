define([
    'underscore',
    'numeral',
    'moment',
    'parse',
    
    'proto/view/nested-controls',
    
    'classes/product/model',
    
    'classes/boutique/collection',
    'classes/boutique/model',
    
    'classes/brand/collection',
    'classes/brand/model',
    
    'classes/interview/collection',
    'classes/interview/model',
    
    'classes/tag/collection',
    'classes/tag/model',
    
    'classes/product-category/collection',
    'classes/product-category/model',
    
    /*'collections/tic-category',
    'models/tic-category',
    
    'sources/linkshare-merchant',*/
    
    /*'views/product/image/list',
    'views/product/size/list',
    
    'views/image-builder',
    
    'views/image-list',*/
    
    //'views/product/timeline/list',
    
    './unit/list',
    
    'controls/form/dictionary',
    'controls/form/enum',
    'controls/form/image',
    
    'text!templates/product/form.html',
    
    'jquery-validation',
    'jquery-validation.defaults',
    'bootstrap-multilanguage',
    'bootstrap-link',
    'icheck'
], function (
	_, numeral, moment, Parse,
	NestedControlsProto,
	ProductModel,
	BoutiqueCollection, BoutiqueModel,
	BrandCollection, BrandModel,
	InterviewCollection, InterviewModel,
	TagCollection, TagModel,
	ProductCategoryCollection, ProductCategoryModel,
	/*TicCategoryCollection, TicCategoryModel,
	LinkshareMerchantSource,
	ProductImageListView, ProductSizeListView,
	ImageBuilder,
	ImageListView,
	TimelineList,*/
	UnitList,
	DictionaryControl, EnumControl, ImageControl,
	formTemplate
) {
	
	var weightUnits = [
		{id: 'KG', text: 'Kilograms'},
		{id: 'LB', text: 'Pounds'}
	];
	
	var linearUnits = [
		{id: 'CM', text: 'Centimeters'},
		{id: 'IN', text: 'Inches'}
	];
	
	var shippingTypes = [
		{id: 'Fedex', text: 'Fedex'},
		{id: 'Flat', text: 'Flat'}
	];
	
	const VIEW = {
		TITLE	 	: 'Product',
		NAME		: 'ProductForm',
		ID			: 'product'
	};
	
	var view = Parse.View.extend({
	
		events : {
			//'click [data-action="product-form-linkshare-update"]'	: 'doLinkshareUpdate'
		},
		
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.initialize');
	
			_.bindAll(this, 'render', 'fetch', 'prebuild', 'build', 'rebuild', 'submit'/*, 'doLinkshareUpdate'*/);
			
			this.controls = {};
	
			this.template = _.template(formTemplate);
			
			// Init controls
			this.controls.boutique = new DictionaryControl({
				name		: 'boutique',
				Collection	: BoutiqueCollection,
				Model		: BoutiqueModel,
				nullable	: true,
				beforeFetch	: function (query) {
					query.select(['title']);
					query.ascending('title');
					query.limit(1000);
				}
			});
			
			this.controls.brand = new DictionaryControl({
				name		: 'brand',
				Collection	: BrandCollection,
				Model		: BrandModel,
				nullable	: true,
				beforeFetch	: function (query) {
					query.select(['title']);
					query.ascending('title');
					query.limit(1000);
				}
			});
			
			this.controls.interview = new DictionaryControl({
				name		: 'interview',
				Collection	: InterviewCollection,
				Model		: InterviewModel,
				nullable	: true,
				beforeFetch	: function (query) {
					query.select(['subject', 'header', 'subheader', 'detailTitle']);
					query.ascending('interviewingBrand');
					query.limit(1000);
				}
			});
			
			this.controls.category = new DictionaryControl({
				name		: 'category',
				Collection	: ProductCategoryCollection,
				Model		: ProductCategoryModel,
				nullable	: true,
				beforeFetch	: function (query) {
					query.select(['title']);
					query.ascending('interviewingBrand');
					query.limit(1000);
				}
			});
			
			this.controls.availableCountry = new EnumControl({
				name		: 'availableCountry',
				datasource	: _.map(app.settings.enums.country, function (country) {return {id: country.code, text: country.title};}),
				multiple	: true,
				nullable	: true
			});
			
			this.controls.unit = new UnitList({
				name		: 'unit',
				type		: VIEW_TYPE_FORM
			});
			
			this.controls.hashTags = new DictionaryControl({
				name		: 'hashTags',
				Collection	: TagCollection,
				Model		: TagModel,
				multiple	: true,
				nullable	: true,
				beforeFetch	: function (query) {
					query.select(['value']);
					query.equalTo('type', TAG_TYPE_SOCIAL);
					query.ascending('value');
					query.limit(1000);
				}
			});
			
			this.controls.archetypeTags = new DictionaryControl({
				name		: 'archetypeTags',
				Collection	: TagCollection,
				Model		: TagModel,
				multiple	: true,
				nullable	: true,
				beforeFetch	: function (query) {
					query.select(['value']);
					query.equalTo('type', TAG_TYPE_ARCHETYPE);
					query.ascending('value');
					query.limit(1000);
				}
			});
			
			this.controls.productTags = new DictionaryControl({
				name		: 'productTags',
				Collection	: TagCollection,
				Model		: TagModel,
				multiple	: true,
				nullable	: true,
				beforeFetch	: function (query) {
					query.select(['value']);
					query.equalTo('type', TAG_TYPE_PRODUCT);
					query.ascending('value');
					query.limit(1000);
				}
			});
			
			this.controls.weatherTags = new DictionaryControl({
				name		: 'weatherTags',
				Collection	: TagCollection,
				Model		: TagModel,
				multiple	: true,
				nullable	: true,
				beforeFetch	: function (query) {
					query.select(['value']);
					query.equalTo('type', TAG_TYPE_WEATHER);
					query.ascending('value');
					query.limit(1000);
				}
			});
			
			this.controls.detailImage = new ImageControl({
				parent		: this,
				name		: 'detailImage',
				limit		: 1,
				type		: VIEW_TYPE_FORM,
				raw			: true
			});
			
			this.controls.specImage = new ImageControl({
				parent		: this,
				name		: 'specImage',
				limit		: 1,
				type		: VIEW_TYPE_FORM,
				raw			: true
			});
			
			this.controls.image = new ImageControl({
				parent		: this,
				name		: 'image',
				limit		: 10,
				type		: VIEW_TYPE_FORM,
				multiple	: true,
				raw			: true
			});
			
			/*this.controls.tic = new DictionaryControl({
				name		: 'tic',
				Collection	: TicCategoryCollection,
				Model		: TicCategoryModel,
				nullable	: true,
				scalar		: true,
				beforeFetch	: function (query) {
					query.ascending('SSUTA_LABEL');
					query.limit(1000);
				}
			});*/
			
			/*this.controls.linkshareMerchantId = new EnumControl({
				name		: 'linkshareMerchantId',
				datasource	: LinkshareMerchantSource,
				nullable	: true
			});*/
			
			/*this.controls.productWeightUnits = new EnumControl({
				datasource	: weightUnits,
				nullable	: true,
				beforeSync	: function (model) {
					return model.has('productWeight') && (value = model.get('productWeight')) ? value.units : null;
				}
			});
			
			this.controls.productDimensionsUnits = new EnumControl({
				datasource	: linearUnits,
				nullable	: true,
				beforeSync	: function (model) {
					return model.has('productDimensions') && (value = model.get('productDimensions')) ? value.units : null;
				}
			});
			
			this.controls.shippingType = new EnumControl({
				name		: 'shippingType',
				datasource	: shippingTypes,
				nullable	: true
			});
			
			this.controls.productPictureAlignment = new EnumControl({
				name		: 'productPictureAlignment',
				datasource	: ProductModel.prototype.productPictureAlignmentEnum,
				nullable	: true
			});
			
			// Init views
			this.productImage = new ProductImageListView({
				parent		: this,
				limit		: 5,
				type		: 'form',
				sortable	: true
			});
			
			this.detailPicture = new ImageListView({
				parent		: this,
				limit		: 1,
				type		: 'form'
			});
			
			this.specImage = new ImageListView({
				parent		: this,
				limit		: 1,
				type		: 'form'
			});
			
			this.productSize = new ProductSizeListView({
				parent		: this,
				type		: 'form',
				sortable	: true
			});
			
			this.timelines = new TimelineList({});*/
			
		},
		
		
		fetch : function () {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.fetch');
			
			var promises = [];
			
			this.fetchNestedControls(promises);
			
			return Parse.Promise.when(promises);
			
		},
		
		
		prebuild : function (model) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.prebuild');
			
			var self = this;
			
			Parse.Promise.as().then(
				
				function () {
					
					if (model.isNew())
						return Parse.Promise.as(model);
						
					var query = new Parse.Query(model.className);
					query.include(['detailImage', 'specImage', 'image', 'unit', 'unit.value', 'unit.value.type']);
					return query.get(model.id);
					
				}
				
			).then(
				
				function (result) {
					
					self.build(result);
					
				},
				function (error) {
					
					app.view.alert(
						null,
						'danger',
						'An error occurred while building ' + VIEW.TITLE + ' form',
						error.message,
						false 
					);
					
				}
				
			);
			
		},
	
	
		render : function() {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.render');
			
			var self = this;
	
			this.$el.html(this.template(VIEW));
			
			this.$tabGeneral = this.$('[data-toggle="tab"][href="#' + VIEW.ID + '-form-general"]');
			this.$tabSku = this.$('[data-toggle="tab"][href="#' + VIEW.ID + '-form-sku"]');
			this.$buttonSubmit = this.$('form#' + VIEW.ID).find('[type="submit"]');
			
			//this.$boutique = this.$('[name="boutique"]');
			//this.controls.boutique.setElement(this.$('[name="boutique"]'))
			
			/*this.$curationDate = this.$('[name="curationDate"]');
			
			this.$tags = this.$('[name="tags"]');
			this.$socialHashtags = this.$('[name="socialHashtags"]');
			
			this.$price = this.$('[name="price"]');
			this.$salePrice = this.$('[name="salePrice"]');
			this.$discount = this.$('[name="discount"]');
			
			//this.$linkshareMerchantId = this.$('[name="linkshareMerchantId"]');
			//this.controls.linkshareMerchantId.setElement(this.$('[name="linkshareMerchantId"]'))
			
			//this.$linkshareProductId = this.$('[name="linkshareProductId"]');
			
			/*this.productImage.setElement(this.$('#product-form-product-image')).render();
			this.detailPicture.setElement(this.$('#product-form-detail-picture')).render();
			this.specImage.setElement(this.$('#product-form-spec-image')).render();
			
			this.productSize.setElement(this.$('#product-form-size')).render();
			
			_.each(this.controls, function (control, name) {
				control.setElement(this.$('#' + name));
			}, this);
			
			this.timelines.setElement(this.$('#product-form-timeline')).render();*/
			
			this.$('form#' + VIEW.ID + '-form').validate({
				context : this.$el,
				rules : {
					/*productName				: {
						required : true
					},
					price					: {
						number : true
					},
					salePrice				: {
						required : true,
						number : true
					},
					// Weight & dimensions
					productWeightValue		: {
						number : true
					},
					productDimensionsWidth	: {
						number : true
					},
					productDimensionsHeight	: {
						number : true
					},
					productDimensionsLength	: {
						number : true
					},
					flatRate				: {
						number : true
					},
					flatRateInternational	: {
						number : true
					},
					shippingType			: {
						required : true
					},
					tic						: {
						//required : true,
						number : true
					}*/
				},
				submitHandler	: this.submit,
			});
			
			// Setup controls
			this.$('.datepicker-control').datepicker({
				format: 'mm/dd/yyyy'
			});
			
			this.$('.multilanguage-control').bootstrapMultilanguage({languages: app.settings.enums.language, language: app.settings.config.DEFAULT_LANGUAGE});
			this.$('.link-control').bootstrapLink();
			
			this.$('input[type="checkbox"]').iCheck({checkboxClass: 'icheckbox_flat'});
			
			this.renderNestedControls();

			return this;
			
		},
		
		
		build : function (model) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.build');
			
			if (model instanceof Parse.Object)
				this.model = model;
			
			this.assignNestedControls(model);
			
			this.model.bindView(
				this,
				{
					image						: null,
					hashTags					: null,
					productTags					: null,
					archetypeTags				: null,
					weatherTags					: null,
					unit						: null,
					shippingTypeParam			: null,
					availableCountry			: null,
					curationDate				: function ($control, value) {$control.val(value && (date = moment.utc(value)) && date.isValid() ? date.format('MM/DD/YYYY') : '');},
					subject						: function ($control, value) {$control.bootstrapMultilanguage('set', value);},
					title						: function ($control, value) {$control.bootstrapMultilanguage('set', value);},
					desc						: function ($control, value) {$control.bootstrapMultilanguage('set', value);},
					detailSubject				: function ($control, value) {$control.bootstrapMultilanguage('set', value);},
					detailDesc					: function ($control, value) {$control.bootstrapMultilanguage('set', value);},
					specSubject					: function ($control, value) {$control.bootstrapMultilanguage('set', value);},
					specDesc					: function ($control, value) {$control.bootstrapMultilanguage('set', value);},
					specDesc2					: function ($control, value) {$control.bootstrapMultilanguage('set', value);},
					timelineTitle				: function ($control, value) {$control.bootstrapMultilanguage('set', value);},
					actionLink					: function ($control, value) {$control.bootstrapLink('set', value);},
					sharingLink					: function ($control, value) {$control.bootstrapLink('set', value);},
					productLink					: function ($control, value) {$control.bootstrapLink('set', value);},
					/*curationDate			: function ($control, value) {$control.val(value && (date = moment.utc(value)) && date.isValid() ? date.subtract(7, 'h').format('MM/DD/YYYY') : '');},
					price					: function ($control, value) {$control.val(_.isNumber(value) ? numeral(value).format('0.00') : null);},
					salePrice				: function ($control, value) {$control.val(_.isNumber(value) ? numeral(value).format('0.00') : null);},
					tags					: function ($control, value, model) {
						value = model.isNew() ? model.tagsEnum : value || [];
						$control.select2({tags: value}).select2('val', value);
					},
					socialHashtags			: function ($control, value) {value = value || [];$control.select2({tags: value}).select2('val', value);},
					archetypes				: function ($control, value, model) {
						value = model.isNew() ? model.archetypesEnum : value || [];
						$control.select2({tags: value}).select2('val', value);
					},
					weatherTags				: function ($control, value, model) {
						value = model.isNew() ? model.weatherTagsEnum : value || [];
						$control.select2({tags: value}).select2('val', value);
					},
					isValid					: function ($control, value) {$control.iCheck(value === true ? 'check' : 'uncheck');},
					isValid_1_0_5			: function ($control, value) {$control.iCheck(value === true ? 'check' : 'uncheck');},
					productWeight			: function ($control, value) {
						
						value = value || {};
						
						$control.filter('[rel="value"]').val(value.value || '');
						
					},
					productDimensions		: function ($control, value) {
						
						value = value || {};
						
						$control.filter('[rel="width"]').val(value.width || '');
						$control.filter('[rel="height"]').val(value.height || '');
						$control.filter('[rel="length"]').val(value.length || '');
					
					},
					flatRate				: function ($control, value) {$control.val(_.isNumber(value) ? numeral(value).format('0.00') : null);},
					flatRateInternational	: function ($control, value) {$control.val(_.isNumber(value) ? numeral(value).format('0.00') : null);},
					europeFlatRate			: function ($control, value) {$control.val(_.isNumber(value) ? numeral(value).format('0.00') : null);},
					worldFlatRate			: function ($control, value) {$control.val(_.isNumber(value) ? numeral(value).format('0.00') : null);},
					internationalShipping	: function ($control, value) {$control.iCheck(value === true ? 'check' : 'uncheck');},
					availableCountry		: function ($control, value, model) {
						var tags = _.union(model.countryEnum, value);
						var val = value || [];
						$control.select2({tags: tags}).select2('val', val);
					}*/
				},
				{
					form						: VIEW.ID + '-form'
				}
			);
			
			
			
			/*var data = this.model.toObject();
			
			var keys = _
				.chain(model._defaults)
				.mapObject(function (value, key) {
					return _.isString(value) || _.isNumber(value) ? key : null;
				})
				.compact()
				.value();
			
			_.each(_.pick(data, keys), function (value, key) {
				
				this.$('[name="' + key + '"]').val(value);
				
			}, this);*/
			
			//this.$linkshareProductId.val(this.model.has('linkshareProductId') ? this.model.get('linkshareProductId') : '');
			
			//this.$curationDate.val(this.model.has('curationDate') ? moment(this.model.get('curationDate')).format('MM/DD/YYYY') : '');
			
			/*var
				price = this.model.has('price') ? this.model.get('price') : 0,
				salePrice = this.model.has('salePrice') ? this.model.get('salePrice') : price,
				discount = price > 0 ? (1 - salePrice / price) * 100 : 0,
				valid = (price > 0);
			
			this.$price.val(numeral(price).format('0.00'));
			this.$salePrice.val(numeral(salePrice).format('0.00'));*/
			//this.$discount.ionRangeSlider('update', {from: Math.round(discount), disable: !valid});
			
			/*var tags = this.model.has('tags') ? this.model.get('tags') : [];
			this.$tags.select2({
				tags : tags
			}).select2('val', tags);
			
			var socialHashtags = this.model.has('socialHashtags') ? this.model.get('socialHashtags') : [];
			this.$socialHashtags.select2({
				tags : socialHashtags
			}).select2('val', socialHashtags);*/
			
			// Bind product images
			/*var images = [];
			
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
			
			this.timelines.refresh(model);
			
			//this.dictionary.gender.setElement(this.$('[name="linkshareMerchantId"]'));
			/*this.controls.gender.sync();
			this.dictionary.gender.fetch();*/
			
			/*_.each(this.controls, function (control, name) {
				
				control.bindModel(model);
				
			});*/
			
			this.$('form#' + VIEW.ID + '-form').valid();
			
			this.rebuild();
			
			this.$('.modal').modal('show');
			
		},
		
		
		rebuild : function () {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.rebuild');
			
			this.$('.modal-title > .model-op').html(this.model.isNew() ? ' create' : 'update');
			this.$('.modal-title > .model-id').html(!this.model.isNew() ? this.model.id : '');
			
			if (this.model.isNew())
				this.$tabSku.hide();
			else
				this.$tabSku.show();
			
			this.$buttonSubmit.html(this.model.isNew() ? 'Save and fill SKU' : 'Save changes');
			
			if (this.model.isNew())
				this.$tabGeneral.tab('show');
			else
				this.$tabSku.tab('show');
			
		},
		
		
		submit : function(form) {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.submit');
	
			var self = this;
			
			var isNew = this.model.isNew();
			
			this.model.unbindView(
				this,
				{
					image						: null,
					hashTags					: null,
					productTags					: null,
					archetypeTags				: null,
					weatherTags					: null,
					unit						: null,
					shippingTypeParam			: null,
					availableCountry			: null,
					curationDate				: function ($control, value) {return (date = moment.utc(value)) && date.isValid() ? date.toDate() : undefined;},
					subject						: function ($control, value) {return $control.bootstrapMultilanguage('get');},
					title						: function ($control, value) {return $control.bootstrapMultilanguage('get');},
					desc						: function ($control, value) {return $control.bootstrapMultilanguage('get');},
					detailSubject				: function ($control, value) {return $control.bootstrapMultilanguage('get');},
					detailDesc					: function ($control, value) {return $control.bootstrapMultilanguage('get');},
					specSubject					: function ($control, value) {return $control.bootstrapMultilanguage('get');},
					specDesc					: function ($control, value) {return $control.bootstrapMultilanguage('get');},
					specDesc2					: function ($control, value) {return $control.bootstrapMultilanguage('get');},
					timelineTitle				: function ($control, value) {return $control.bootstrapMultilanguage('get');},
					actionLink					: function ($control, value) {return $control.bootstrapLink('get');},
					sharingLink					: function ($control, value) {return $control.bootstrapLink('get');},
					productLink					: function ($control, value) {return $control.bootstrapLink('get');},
					/*price				: function ($control, value) {$control.val(numeral(value).format('0.00'));},
					salePrice			: function ($control, value) {$control.val(numeral(value).format('0.00'));},*/
					/*curationDate		: function ($control, value) {return (date = moment.utc(value)) && date.isValid() ? date.add(7, 'h').toDate() : undefined;},
					tags				: function ($control, value) {return (value = $control.select2('val')) && !_.isEmpty(value) ? value : undefined;},
					socialHashtags		: function ($control, value) {return (value = $control.select2('val')) && !_.isEmpty(value) ? value : undefined;},
					archetypes			: function ($control, value) {return (value = $control.select2('val')) && !_.isEmpty(value) ? value : undefined;},
					weatherTags			: function ($control, value) {return (value = $control.select2('val')) && !_.isEmpty(value) ? value : undefined;},
					isValid				: function ($control, value) {return $control.prop('checked');},
					isValid_1_0_5		: function ($control, value) {return $control.prop('checked');},
					productWeight		: function ($control, value) {
						
						var value = {
							value	: Number($control.filter('[rel="value"]').val()),
							units	: $control.filter('[rel="units"]').val()
						};
						
						return value;
						
					},
					productDimensions	: function ($control, value) {
						
						var value = {
							width	: Number($control.filter('[rel="width"]').val()),
							height	: Number($control.filter('[rel="height"]').val()),
							length	: Number($control.filter('[rel="length"]').val()),
							units	: $control.filter('[rel="units"]').val()
						};
						
						return value;
					
					},
					internationalShipping	: function ($control, value) {return $control.prop('checked');},
					availableCountry		: function ($control, value) {return (value = $control.select2('val')) && !_.isEmpty(value) ? value : undefined;}*/
				},
				{
					form						: VIEW.ID + '-form'
				}
			);
			
			// Bind product images
			/*var order = this.productImage.order();
			
			for (var i = 1; i <= 5; i++) {
				
				var j = i - 1;
				
				var imageBefore = this.model.has('image' + i) && (image = this.model.get('image' + i)) && (image instanceof Parse.File) ? image : null;
				var imageAfter = (cid = order[j]) && (model = this.productImage.collection.getByCid(cid)) && model.has('image') && (image = model.get('image')) && (image instanceof Parse.File) ? image : null;
				
				if (imageAfter && imageBefore) {
					
					if (imageBefore.url() !== imageAfter.url())
						this.model.set('image' + i, imageAfter);
				
				} else if (imageAfter)
					this.model.set('image' + i, imageAfter);
						
				else if (imageBefore)
					this.model.unset('image' + i);
				
			}
			
			var selectedImage = _.indexOf(order, this.productImage.collection.selected());
			if (selectedImage >= 0)
				this.model.set('selectedImage', selectedImage);
			else
				this.model.unset('selectedImage');
			
			// Bind detail picture
			var detailPictureBefore = this.model.has('detailPicture') && (image = this.model.get('detailPicture')) && (image instanceof Parse.File) ? image : null;
			var detailPictureAfter = this.detailPicture.collection.length > 0 && (model = this.detailPicture.collection.at(0)) && model.has('image') && (image = model.get('image')) && (image instanceof Parse.File) ? image : null;
			
			if (detailPictureAfter && detailPictureBefore) {
				
				if (detailPictureBefore.url() !== detailPictureAfter.url())
					this.model.set('detailPicture', detailPictureAfter);
					
			} else if (detailPictureAfter)
				this.model.set('detailPicture', detailPictureAfter);
					
			else if (detailPictureBefore)
				this.model.unset('detailPicture');
			
			// Bind specification image
			var specImageBefore = this.model.has('specsImageIpad') && (image = this.model.get('specsImageIpad')) && (image instanceof Parse.File) ? image : null;
			var specImageAfter = this.specImage.collection.length > 0 && (model = this.specImage.collection.at(0)) && model.has('image') && (image = model.get('image')) && (image instanceof Parse.File) ? image : null;
			
			if (specImageAfter && specImageBefore) {
				
				if (specImageBefore.url() !== specImageAfter.url())
					this.model.set('specsImageIpad', specImageAfter);
					
			} else if (specImageAfter)
				this.model.set('specsImageIpad', specImageAfter);
					
			else if (specImageBefore)
				this.model.unset('specsImageIpad');
			
			// Bind product sizes
			this.model.set('productSize', this.productSize.order());
			
			this.model.set('quantityAvailable', this.productSize.total());*/
			
			//this.model.set('isValid', false);
			
			// Duplicate brand name
			/*if (this.model.has('brand') && (brand = this.model.get('brand')) && (brand instanceof Parse.Object) && brand.has('brandName'))
				this.model.set('brandName', brand.get('brandName'));*/
				
			var promises = [];
			/*
			_.each(this.controls, function (control, name) {
				promises.push(control.apply());
			});*/
			
			this.applyNestedControls(promises);
			
			Parse.Promise.when(promises).then(
				
				function () {
					
					if (!isNew) {
						
						if (value = self.controls.unit.totalQuantityIncrement())
							self.model.increment('quantity', value);
						
						var priceFrom = self.controls.unit.minSalePrice();
						
						if (!_.isEmpty(priceFrom))
							self.model.set('priceFrom', priceFrom);
						else
							self.model.unset('priceFrom');
						
						var priceTill = self.controls.unit.maxSalePrice();
						
						if (!_.isEmpty(priceTill))
							self.model.set('priceTill', priceTill);
						else
							self.model.unset('priceTill');
						
					}
			
					//return self.productSize.apply();
					return self.model.save();
					
				}
			
			/*).then(
				
				function (added, removed) {
					
					var relation = self.model.relation('sizeAvailable');
					
					_.each(added, function (item) {
			 			relation.add(item);
			 		});
			 		
			 		return self.model.save();
			 		
				}
				
			).then(
				
				function (result) {
					
					return self.timelines.apply(self.model);
					
				}*/
			
			).then(
				
				function () {
					
					if (isNew)
						self.rebuild(true);
						
					else {
						
						self.$('.modal').modal('hide');
						self.collection.fetch();
						
					}
					
					app.view.alert(
						null,
						'success',
						'',
						VIEW.TITLE + ' successfully modified',
						3000
					);
					
				},
				function (error) {
					
					app.view.alert(
						self.$el,
						'danger',
						'An error occurred while ' + (self.model.isNew() ? 'creating' : 'updating') + ' ' + VIEW.TITLE,
						error.message,
						false 
					);
					
				}
			
			);
	
			return false;
	
		},
		
		
		/*doShowTab : function () {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductFormView.doShowTab');
			
			this.$discount.ionRangeSlider('update');
			
		},
		
		
		doChangePrice : function (ev) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductFormView.doChangePrice');
			
			var
				price = numeral(this.$price.val()),
				discount = numeral(this.$discount.val()),
				valid = this.$price.valid() && this.$salePrice.valid() && (price > 0);
				
			this.$salePrice.prop('disabled', price <= 0 ? 'disabled' : '');
			
			if (valid) {
				
				var
					salePrice = price * (100 - discount) / 100;
				
				this.$salePrice.val(numeral(salePrice).format('0.00'));
				
				this.$discount.ionRangeSlider('update', {from: Math.round(discount), disable: !valid});
				
			} else if (discount > 0)
				this.$discount.ionRangeSlider('update', {from: Math.round(discount), disable: !valid});
			
		},
		
		
		doChangeSalePrice : function (ev) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductFormView.doChangeSalePrice');
			
			var
				price = numeral(this.$price.val()),
				discount = numeral(this.$discount.val()),
				salePrice = numeral(this.$salePrice.val()),
				valid = this.$price.valid() && (price > 0) && this.$salePrice.valid();
			
			if (valid) {
				
				if (price < salePrice) {
					price = salePrice;
					this.$price.val(price.format('0.00'));
				}
				
				var
					discount = (1 - salePrice / price) * 100
				
				this.$discount.ionRangeSlider('update', {from: Math.round(discount), disable: !valid});
				
			} else if (discount > 0)
				this.$discount.ionRangeSlider('update', {from: Math.round(discount), disable: !valid});
			
		},
		
		
		doChangeDiscount : function (ev) {
			
			var
				price = numeral(this.$price.val());
			
			this.$salePrice.val(numeral(price * (100 - ev.fromPers) / 100).format('0.00'));
			
		},*/
		
		
		/*doLinkshareUpdate : function () {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.doLinkshareUpdate');
			
			var
				linkshareMerchantId = this.$linkshareMerchantId.val(),
				linkshareProductId = this.$linkshareProductId.val();
			
			if (_.isEmpty(linkshareMerchantId) || _.isEmpty(linkshareProductId)) {
				
				app.view.alert(
					this.$el,
					'info',
					'Linkshare bridge',
					'First select Merchant and Product Id',
					3000 
				);
				
				return;
				
			}
			
			var self = this;
			
			Parse.Cloud.run(
				'productLinkshareLookup',
				{
					merchant	: linkshareMerchantId,
					product		: linkshareProductId
				}
			).then(
				
				function (data) {
					
					if (_.has(data, 'error'))
					
						app.view.alert(
							self.$el,
							'danger',
							'Linkshare bridge',
							data.error,
							false 
						);
						
					else {
						
						if (data.results.length >= 1) {
							
							var result = data.results[0];
							
							_.each(
								{
									brandName			: 'brand',
									category			: 'primaryCategory',
									//price				: 'retailPrice', // TODO fix price
									productDescription	: 'shortProductDescription',
									productName			: 'productName',
									//salePrice			: 'salePrice', // TODO fix price
									tags				: 'keywords',
								},
								function (lname, name) {
									
									if (!_.has(result, lname))
										return;
										
									var
										$control = self.$('[name="' + name + '"]'),
										value = result[lname];
										
									if (_.has(this, name) && _.isFunction(this[name]))
										this[name]($control, value);
									
									else if ($control.size() === 1 && _.isEmpty($control.val()))
										$control.val(value)
									
								},
								{
									tags		: function ($control, value) {
										
										if (_.isEmpty($control.select2('val')) && !_.isEmpty(value))
											$control.select2('val', value);
										
									}
								}
							);
							
							// TODO fix price
							self.$('[name="salePrice"]').val(result.salePrice);
							
							_.each(result.size, function (size) {
								self.productSize.makeSizeCreate(size, 10);
							});
							
							self.productSize.makeSizeUpdate(result.size);
							
							self.model.set('linksharedAt', moment().utc().toDate());
							
							//self.$el.valid();
							
							app.view.alert(
								self.$el,
								'success',
								'Linkshare bridge',
								'Product successfully updated from Linkshare',
								3000 
							);
							
						} else {
							
							app.view.alert(
								self.$el,
								'warning',
								'Linkshare bridge',
								'No matches found',
								false 
							);
							
						}
						
					}
					
				},
				function (error) {
					
					app.view.alert(
						self.$el,
						'danger',
						'Linkshare bridge',
						'Linkshare bridge not available.<br/>Try to repeat your request later.',
						false 
					);
					
				}
					
			);
			
			return false;
			
		}*/
		
		
	})
	.extend(_.clone(NestedControlsProto));
	
	return view;

});