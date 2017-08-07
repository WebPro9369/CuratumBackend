define([
	'underscore',
	'moment',
	'numeral',
	'parse',
	
	'entities/text',
	'entities/link',
	'entities/currency',
	'entities/package-size',
	'entities/package-weight'
], function(
	_, moment, numeral, Parse,
	TextEntity, LinkEntity, CurrencyEntity, PackageSizeEntity, PackageWeightEntity
) {
	
	var TYPES = {
		
		productId				: String,
		boutique				: Parse.Object,
		brand					: Parse.Object,
		interview				: Parse.Object,
		category				: Parse.Object,
		
		curationDate			: Date,
		subject					: TextEntity,
		title					: TextEntity,
		desc					: TextEntity,
		detailSubject			: TextEntity,
		detailDesc				: TextEntity,
		specSubject				: TextEntity,
		specDesc				: TextEntity,
		specDesc2				: TextEntity,
		timelineTitle			: TextEntity,
		color					: String,
		
		detailImage				: Parse.Object,
		specImage				: Parse.Object,
		image					: Array,
		imageSelected			: Number,
		
		actionLink				: LinkEntity,
		sharingLink				: LinkEntity,
		productLink				: LinkEntity,
		
		hashTags				: Array,
		productTags				: Array,
		archetypeTags			: Array,
		weatherTags				: Array,
		
		unit					: Array,
		shippingTypeParam		: Array,
		packageSize				: PackageSizeEntity,
		packageWeight			: PackageWeightEntity,
		taxCategory				: String,
		
		quantity				: Number,
		priceFrom				: CurrencyEntity,
		priceTill				: CurrencyEntity,
		
		availableCountry		: Array,
		published				: Boolean,
		
	};
	
	
	var ENUMS = {
		
		packageSize: [
			{id: PACKAGE_WEIGHT_UNITS_TYPE_KILOGRAMS	, text: 'Kilograms'},
			{id: PACKAGE_WEIGHT_UNITS_TYPE_POUNDS		, text: 'Pounds'}
		],
		
		packageWeight: [
			{id: PACKAGE_SIZE_UNITS_TYPE_CENTIMETERS	, text: 'Centimeters'},
			{id: PACKAGE_SIZE_UNITS_TYPE_INCHES			, text: 'Inches'}
		],
		
	};
	

	var model = Parse.Object.extend('Product', {
		
		_formats: {
			
			_thumb : function (model, values) {
				return values.detailImage && values.detailImage.thumbUrl && values.detailImage.thumbUrl.url ? values.detailImage.thumbUrl.url : null;
			},
			
			_priceRange : function (model, values) {
				
				return _.compact([
					_.compact([values.priceFrom._currency ? String(values.priceFrom._currency).toUpperCase() : '', values.priceFrom._amount]).join(' '),
					_.compact([values.priceTill._currency ? String(values.priceTill._currency).toUpperCase() : '', values.priceTill._amount]).join(' ')
				]).join(' - ');
				
			},
			
			_value : function (model, values) {
				return _.map(values.value || [], function (value) {return value.title._text;}).join(', ');
			}
			
		},
		
		
		types : function () {
			return TYPES;
		},
		
		
		enums : function (name) {
			return ENUMS[name] || [];
		},
		
		
		datasource : function () {
			
			var values = this.toTemplate();
			return values.title._text ? {id: this.id, text: values.title._text} : null;
			
		}
		
	});
	
	return model;

});