require.config({
	shim	: {
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
	paths	: {
		
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
		
	}
});

const ROLE_ADMIN		= 'admin';
const ROLE_PARTNER		= 'partner';

const DATETIME_FORMAT	= 'MMM D, YYYY h:mm A';
const DATE_FORMAT		= 'MMM D, YYYY';
const DATE_FORMAT_ISO	= 'YYYY-MM-DD';
const DATE_FORMAT_YEAR	= 'MMM, YYYY';
const DATE_FORMAT_MONTH	= 'MMM D';
const DATE_FORMAT_DAY	= 'D';
const TIME_FORMAT		= 'h:mm A';
const MONEY_FORMAT		= '$0,0.00';
const NUMBER_FORMAT		= '0,0';


const
	TAG_TYPE_SOCIAL		= 1,
	TAG_TYPE_ARCHETYPE	= 2,
	TAG_TYPE_PRODUCT	= 3,
	TAG_TYPE_WEATHER	= 4,
	TAG_TYPE_OCCASION	= 5,
	TAG_TYPE			= [TAG_TYPE_SOCIAL, TAG_TYPE_ARCHETYPE, TAG_TYPE_PRODUCT, TAG_TYPE_WEATHER, TAG_TYPE_OCCASION];

const
	TRANSACTION_TYPE_MANUALLY_ENTERED			= 0,
	TRANSACTION_TYPE_BALANCE_USED				= 1,
	TRANSACTION_TYPE_WON_TIMELINE_VIEWED		= 2001;

const
	IMAGE_ALIGNMENT_TOP				= 'T',
	IMAGE_ALIGNMENT_MIDDLE			= 'M',
	IMAGE_ALIGNMENT_BOTTOM			= 'B',
	IMAGE_ALIGNMENT_LEFT			= 'L',
	IMAGE_ALIGNMENT_CENTER			= 'C',
	IMAGE_ALIGNMENT_RIGHT			= 'R',
	IMAGE_ALIGNMENT_VERTICAL = [IMAGE_ALIGNMENT_TOP, IMAGE_ALIGNMENT_MIDDLE, IMAGE_ALIGNMENT_BOTTOM],
	IMAGE_ALIGNMENT_HORIZONTAL = [IMAGE_ALIGNMENT_LEFT, IMAGE_ALIGNMENT_CENTER, IMAGE_ALIGNMENT_RIGHT],
	IMAGE_ALIGNMENT = [IMAGE_ALIGNMENT_TOP, IMAGE_ALIGNMENT_MIDDLE, IMAGE_ALIGNMENT_BOTTOM, IMAGE_ALIGNMENT_LEFT, IMAGE_ALIGNMENT_CENTER, IMAGE_ALIGNMENT_RIGHT];

const
	TIMELINE_TYPE_MEN		= 1,
	TIMELINE_TYPE_WOMEN		= 2,
	TIMELINE_TYPE_BEAUTY	= 3,
	TIMELINE_TYPE_PARTNER	= 4,
	TIMELINE_TYPE_FEATURED	= 5,
	TIMELINE_TYPE = [TIMELINE_TYPE_MEN, TIMELINE_TYPE_WOMEN, TIMELINE_TYPE_BEAUTY, TIMELINE_TYPE_PARTNER, TIMELINE_TYPE_FEATURED];
	
const
	PACKAGE_WEIGHT_UNITS_TYPE_KILOGRAMS	= 'KG',
	PACKAGE_WEIGHT_UNITS_TYPE_POUNDS	= 'LB',
	PACKAGE_WEIGHT_UNITS_TYPE = [PACKAGE_WEIGHT_UNITS_TYPE_KILOGRAMS, PACKAGE_WEIGHT_UNITS_TYPE_POUNDS];

const
	PACKAGE_SIZE_UNITS_TYPE_CENTIMETERS	= 'CM',
	PACKAGE_SIZE_UNITS_TYPE_INCHES		= 'IN',
	PACKAGE_SIZE_UNITS_TYPE = [PACKAGE_SIZE_UNITS_TYPE_CENTIMETERS, PACKAGE_SIZE_UNITS_TYPE_INCHES];

const
	DEBUG_LEVEL = {
		NONE	: 0,
		ERROR	: 1,
		WARNING	: 2,
		NOTICE	: 3,
		TRACE	: 4
	};

const
	PAGINATION_DEFAULT_SIZE			= 20;

const
	THEME_TYPE_TABLE				= 'table',
	THEME_TYPE_GALLERY				= 'gallery',
	THEME_TYPE = [THEME_TYPE_TABLE, THEME_TYPE_GALLERY];

const
	ASSET_NO_IMAGE					= 'assets/images/no-image.png';
	
const
	VIEW_TYPE_FORM					= 'form',
	VIEW_TYPE_VIEW					= 'view';

var app = {
	
	DEBUG_LEVEL		: DEBUG_LEVEL.TRACE,
	
	settings		: null,
	user			: null,
	boutiques		: null,
	boutique		: null,
	
	router			: null,
	locationManager	: null

};

const
	ALGOLIA_APPLIATION_ID	= 'RG6651XH9I',
	ALGOLIA_API_KEY			= 'c49b9a60f9285c9271a902695550e3eb';

require([
	'underscore', 'underscore.extension', 'parse', 'router', 'controls/location-manager'
], function(
	_, _extension, Parse, AppRouter, LocationManager
) {
	
	Parse.initialize('curatum', 'gdMCyU24kLhT7QjudGTW');
	Parse.serverURL = '/parse';
	//Parse.serverURL = 'https://curatum.herokuapp.com/parse';
	
	app.router = new AppRouter();
	
	app.locationManager = new LocationManager(app.router);
	
	Parse.history.start();

});
