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
		
		brand					: Parse.Object,
		
		subject					: TextEntity,
		header					: TextEntity,
		subheader				: TextEntity,
		headerHide				: TextEntity,
		desc					: TextEntity,
		detailTitle				: TextEntity,
		detailDesc				: TextEntity,
		color					: String,
		
		image					: Parse.Object,
		
		sourceLink				: LinkEntity,
		videoLink				: LinkEntity,
		
		published				: Boolean
		
	};
	
	var model = Parse.Object.extend('Interview', {
		
		_formats: {
			
			_thumb : function (model, values) {
				return values.image && values.image.thumbUrl && values.image.thumbUrl.url ? values.image.thumbUrl.url : null;
			},
			
			_title : function (model, values) {
				
				var value = '';
				
				if (values.subject._text)
					value += values.subject._text;
				
				if (values.header._text || values.subheader._text) {
					
					value += ':';
					
					if (values.header && values.header._text)
						value += ' ' + values.header._text;
					
					if (values.subheader && values.subheader._text)
						value += ' ' + values.subheader._text;
					
				} else if (values.detailTitle._text)
					value += (value ? ': ' : '') + values.detailTitle._text;
				
				return value;
				
			}
			
		},
		
		
		types : function () {
			return TYPES;
		},
		
		
		datasource : function () {
			
			var values = this.toTemplate();
			return {id: this.id, text: values._title};
			
		}
		
	});
	
	return model;

});