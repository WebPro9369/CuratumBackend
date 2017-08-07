var _ = require('underscore');

var simplifyMutliLanguageObject = function (value, lang) {
	
	var result = _
		.chain(lang)
		.map(function (language) {return this[language];}, value || {})
		.compact()
		.first()
		.value();
	
	return result;
	
}

var simplifyMutliCurrencyObject = function (value, curr) {
	
	var result = _
		.chain(curr)
		.map(function (currency) {return currency && this[currency] ? {currency: currency, amount: this[currency]} : null;}, value || {})
		.filter(function (val) {return !_.isEmpty(val);})
		.first()
		.value();
	
	return result;
	
}

var scheme = {};

scheme.classes = {
	
	User					: {
		username				: true,
		fullName				: true,
		timelineViewed			: 'Timeline',
		productCurated			: 'Product',
		defaultShippingAddress	: 'ShippingAddress',
		defaultPaymentCard		: 'PaymentCard',
		archetypeTags			: ['Tag', 'TagWithoutType'],
	},
	
	Tag						: {
		id						: true,
		type					: true,
		value					: [true, 'MLString']
	},
	
	Image					: {
		thumbUrl				: [true, 'File'],
		thumbProp				: true,
		originalUrl				: [true, 'File'],
		originalProp			: true,
		title					: [true, 'MLString'],
		alignment				: true,
		creditTitle				: [true, 'MLString'],
		creditUrl				: true
	},
	
	ProductCategory			: {
		id						: true,
		title					: [true, 'MLString']
	},
	
	ProductUnitTypeValue	: {
		code					: true,
		type					: 'ProductUnitType',
		title					: [true, 'MLString'],
	},
	
	ProductUnitType			: {
		code					: true,
		title					: [true, 'MLString'],
		//value					: 'ProductUnitTypeValue'
	},
	
	ProductUnit				: {
		unitId					: true,
		//product					: 'Product',
		quantityAvailable		: true,
		//type					: 'ProductUnitType',
		value					: 'ProductUnitTypeValue',
		basePrice				: [true, 'MCurrency'],
		salePrice				: [true, 'MCurrency'],
		sortOrder				: true
	},
	
	ShippingAddress			: {
		id						: true,
		title					: true,
		personName				: true,
		phoneNumber				: true,
		emailAddress			: true,
		streetLines				: true,
		city					: true,
		stateOrProvinceCode		: true,
		countryCode				: true,
		postalCode				: true,
		removed					: true,
		removedAt				: true
	},
	
	PaymentCard				: {
		id						: true,
		cardType				: true,
		trailingDigits			: true,
		validThru				: true,
		removed					: true,
		removedAt				: true
	},
	
	Brand					: {
		id						: true,
		createdAt				: true,
		updatedAt				: true,
		subject					: [true, 'MLString'],
		title					: [true, 'MLString'],
		desc					: [true, 'MLString'],
		logo					: ['Image', 'Image'],
		detailTitle				: [true, 'MLString'],
		detailDesc				: [true, 'MLString'],
		image					: ['Image', 'Image'],
		link					: [true, 'ExternalLink'],
		color					: true,
		published				: true
	},
	
	Boutique				: {
		id						: true,
		createdAt				: true,
		updatedAt				: true,
		subject					: [true, 'MLString'],
		title					: [true, 'MLString'],
		desc					: [true, 'MLString'],
		logo					: ['Image', 'Image'],
		phoneNumber				: true,
		emailAddress			: true,
		streetLines				: true,
		city					: true,
		stateOrProvinceCode		: true,
		country					: [true, 'CountryByCode'],
		postalCode				: true,
		location				: [true, 'GeoPoint'],
		shippingAddress			: 'ShippingAddress',
		detailTitle				: [true, 'MLString'],
		detailDesc				: [true, 'MLString'],
		link					: [true, 'ExternalLink'],
		image					: ['Image', 'Image'],
		color					: true,
		mapImage				: ['Image', 'Image'],
		published				: true
	},
	
	Interview				: {
		id						: true,
		createdAt				: true,
		updatedAt				: true,
		subject					: [true, 'MLString'],
		header					: [true, 'MLString'],
		subheader				: [true, 'MLString'],
		headerHide				: [true, 'MLString'],
		desc					: [true, 'MLString'],
		detailTitle				: [true, 'MLString'],
		detailDesc				: [true, 'MLString'],
		image					: ['Image', 'Image'],
		sourceLink				: [true, 'ExternalLink'],
		videoLink				: [true, 'ExternalLink'],
		color					: true,
		brand					: 'Brand',
		published				: true
	},
	
	Product					: {
		id						: true,
		createdAt				: true,
		updatedAt				: true,
		subject					: [true, 'MLString'],
		title					: [true, 'MLString'],
		desc					: [true, 'MLString'],
		boutique				: 'Boutique',
		brand					: 'Brand',
		interview				: 'Interview',
		availableCountry		: true,
		detailSubject			: [true, 'MLString'],
		detailDesc				: [true, 'MLString'],
		curationDate			: true,
		image					: ['Image', 'Image'],
		color					: true,
		packageSize				: true,
		packageWeight			: true,
//		shippingTypeParam (array[*ShippingTypeParam*]) - Available shipping types for product
		published				: true, 
		hashTags				: ['Tag', 'TagWithoutType'],
		archetypeTags			: ['Tag', 'TagWithoutType'],
		productTags				: ['Tag', 'TagWithoutType'],
		weatherTags				: ['Tag', 'TagWithoutType'],
		category				: 'ProductCategory',
		taxCategory				: true,
		actionLink				: [true, 'ExternalLink'],
		specSubject				: [true, 'MLString'],
		specDesc				: [true, 'MLString'],
		specDesc2				: [true, 'MLString'],
		detailImage				: ['Image', 'Image'],
		imageSelected			: true,
		specImage				: ['Image', 'Image'],
		sharingLink				: [true, 'ExternalLink'],
		timelineTitle			: [true, 'MLString'],
		productId				: true,
		productLink				: [true, 'ExternalLink'],
		quantity				: true,
		unit					: 'ProductUnit',
		//relatedProduct			: 'Product'
	},
	
	Timeline				: {
		id						: true,
		createdAt				: true,
		updatedAt				: true,
		subject					: [true, 'MLString'],
		subtitle				: [true, 'MLString'],
		desc					: [true, 'MLString'],
		image					: ['Image', 'Image'],
		product					: 'Product',
		sharingLink				: true,
		tapstreamLink			: true,
		textColor				: true,
		discounted				: true,
		authRequiredImage		: ['Image', 'Image'],
		discountImage			: ['Image', 'Image'],
		wonImage				: ['Image', 'Image'],
		primary					: true,
		expanded				: true,
		private					: true,
		published				: true,
		type					: true
	}
	
};

scheme.translators = {
	
	File			: function (value) {
		return value instanceof Parse.File ? value.url() : undefined;
	},
	
	GeoPoint		: function (value) {
		return value instanceof Parse.GeoPoint ? {latitude: value.latitude, longitude: value.longitude} : undefined;
	},
	
	CountryByCode		: function (value) {
		return value;
	},
	
	MCurrency		: function (value) {
		
		var result = simplifyMutliCurrencyObject(value, this._options.currency);
		
		return !_.isUndefined(result) && !_.isNaN(result) ? result : undefined;

	},
	
	MLString		: function (value) {
		
		var result = simplifyMutliLanguageObject(value, this._options.language);
		
		return !_.isEmpty(result) ? result : undefined;

	},
	
	ExternalLink	: function (value) {
		
		var result = _.isObject(value) ? _.pick(value || {}, 'title', 'url') : {};
		
		if (_.has(value, 'title') && (title = simplifyMutliLanguageObject(value.title, this._options.language)))
			result.title = title;
		
		if (_.has(value, 'url') && (url = simplifyMutliLanguageObject(value.url, this._options.language)))
			result.url = url;
		
		return !_.isEmpty(result) ? result : undefined;
		
	},
	
	Image			: function (value) {
		
		var result = _.isObject(value) ? _.pick(value || {}, 'title', 'alignment', 'creditTitle', 'creditUrl') : {};
		
		if (_.has(value, 'originalUrl'))
			result.image = value.originalUrl;
		
		if (_.has(value, 'originalProp'))	
			result.prop = value.originalProp;
		
		return !_.isEmpty(result) ? result : undefined;
		
	},
	
	
	TagWithoutType	: function (value) {
		
		return !_.isEmpty(value) ? _.omit(value, 'type') : undefined;
		
	}
	
};


module.exports = scheme;
