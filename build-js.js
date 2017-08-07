({
	shim : {
		'underscore'					: {
			exports	: '_'
		},
		'parse.core'					: {
			deps	: ['jquery', 'underscore'],
			exports	: 'Parse'
		},
		'parse'							: {
			deps	: ['parse.core'],
			exports	: 'Parse'
		},
		'algoliasearch'					: {
			exports	: 'AlgoliaSearch'
		},
		'jquery'						: {
			exports	: '$'
		},
		'numeral'						: {
			exports : 'numeral'
		},
		'moment'						: {
			exports : 'numeral'
		},
		'bootstrap'						: {
			deps	: ['jquery'],
			exports	: 'jquery'
		},
		'noty'							: {
			deps	: ['jquery'],
			exports	: 'noty'
		},
		'router'						: {
			deps	: ['underscore', 'parse']
		},
		'mCustomScrollbar'				: {
			deps	: ['jquery']
		}, 
		'jquery-validation'				: {
			deps	: ['jquery'],
			exports	: '$.validator'
		},
		'jquery-validation.defaults'	: {
			deps	: ['jquery-validation']
		}
	},
	paths : {
		
		// App
		'proto'							: 'app/_proto',
		'router'						: 'app/router',
		'classes'						: 'app/classes',
		'entities'						: 'app/entities',
		
		'views'							: 'app/views',
		'controls'						: 'app/controls',
		'sources'						: 'sources',
		'templates'						: 'app/templates',
		
		// Libs
		'underscore'					: 'libs/underscore/underscore',
		'underscore.extension'			: 'libs/underscore/extension',
		'parse.core'					: 'libs/parse/parse-1.5.0',
		'parse'							: 'libs/parse/extension',
		'numeral'						: 'libs/numeral/numeral',
		'moment'						: 'libs/moment/moment',
		'algoliasearch'					: 'libs/algoliasearch/algoliasearch.min',
		
		// Theme
		'jquery'						: 'assets/plugins/jquery/jquery-1.11.1.min',
		'bootstrap'						: 'assets/plugins/bootstrap/js/bootstrap',
		'layout'						: 'assets/theme/layout',
		'noty'							: 'assets/plugins/noty/jquery.noty.packaged',
		'jquery-validation'				: 'assets/plugins/jquery-validation/jquery.validate',
		'jquery-validation.defaults'	: 'assets/plugins/jquery-validation/defaults',
		'select2'						: 'assets/plugins/select2/select2',
		'jquery.magnific-popup'			: 'assets/plugins/magnific/jquery.magnific-popup',
		'filedrop-iterate'				: 'assets/plugins/filedrop-iterate/jquery.filedrop-iterate',
		'jquery-ui'						: 'assets/plugins/jquery-ui/jquery-ui-1.10.4.min',
		'icheck'						: 'assets/plugins/icheck/icheck',
		'jquery.cookies'				: 'assets/plugins/jquery-cookies/jquery.cookies',
		'mCustomScrollbar'				: 'assets/plugins/mcustom-scrollbar/jquery.mCustomScrollbar.concat.min',
		'bootstrap-multilanguage'		: 'assets/plugins/bootstrap-multilanguage/bootstrap-multilanguage',
		'bootstrap-link'				: 'assets/plugins/bootstrap-link/bootstrap-link',
		'bootstrap-currency'			: 'assets/plugins/bootstrap-currency/bootstrap-currency',
		
	},
	baseUrl					: './src/',
	name					: 'main',
	out						: './public/main.js',
	optimize				: 'none',
	preserveLicenseComments	: false,
	throwWhen: {
        optimize: true
    }

})