define([
	'underscore',
    'parse'
], function(_, Parse) {
	
	
	var prototype = {
		
		format : function (type) {
			return _.has(this, '_formats') && _.has(this._formats, type) ? this._formats[type](this) : null;
		}
	
	};
	
	return prototype;

});