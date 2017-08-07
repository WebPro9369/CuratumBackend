define([
	'underscore',
	'moment',
	'numeral',
	'parse',
	
	'entities/text',
	'entities/link'
], function(
	_, moment, numeral, Parse,
	TextEntity, LinkEntity
) {
	
	var TYPES = {
		
		type					: Number,
		boutique				: Parse.Object,
		
		subject					: TextEntity,
		subtitle				: TextEntity,
		desc					: TextEntity,
		textColor				: String,
		
		sharingLink				: LinkEntity,
		tapstreamLink			: LinkEntity,
		
		product					: Array,
		
		image					: Parse.Object,
		
		discounted				: Boolean,
		authRequiredImage		: Parse.Object,
		discountImage			: Parse.Object,
		wonImage				: Parse.Object,
		
		sortOrder				: Number,
		
		availableCountry		: Array,
		primary					: Boolean,
		private					: Boolean,
		published				: Boolean
		
	};
	
	var ENUMS = {
		
		type: [
			{id: TIMELINE_TYPE_MEN			, text: 'Men Personalized Collection'		, roles: [ROLE_ADMIN]},
			{id: TIMELINE_TYPE_WOMEN		, text: 'Women Personalized Collection'		, roles: [ROLE_ADMIN]},
			{id: TIMELINE_TYPE_BEAUTY		, text: 'Beauty Personalized Collection'	, roles: [ROLE_ADMIN]},
			{id: TIMELINE_TYPE_PARTNER		, text: 'Partner Collection'				, roles: [ROLE_ADMIN, ROLE_PARTNER]},
			{id: TIMELINE_TYPE_FEATURED		, text: 'Featured Collection'				, roles: [ROLE_ADMIN]}
		]
		
	};
	
	var model = Parse.Object.extend('Timeline', {
		
		_formats: {
			
			_thumb : function (model, values) {
				return values.image && values.image.thumbUrl && values.image.thumbUrl.url ? values.image.thumbUrl.url : null;
			},
			
			_type : function (model, values) {
				return (value = _.findWhere(ENUMS.type, {id: values.type})) ? value.text : null; 
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
			return values.subject._text ? {id: this.id, text: values.subject._text} : null;
			
		}
		
	});
	
	return model;

});