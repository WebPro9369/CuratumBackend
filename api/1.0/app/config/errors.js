var errors = {
	
	// 500
	INTERNAL_SERVER_ERROR					: 1,
	
	// Runtime
	PARAM_IS_NOT_SPECIFIED					: 100,
	PARAM_IS_NOT_VALID						: 101,
	PARAM_SHOULD_NOT_BE_EMPTY				: 110,
	PARAM_SHOULD_BE_EMAIL					: 111,
	PARAM_SHOULD_HAVE_LENGTH				: 112,
	
	// Security
	AUTHORIZATION_IS_REQUIRED				: 200,
	ACCESS_DENIED							: 201,
	USER_UPDATE_FAILED						: 202,
	USER_IS_NOT_AVAILABLE					: 203,
	
	// Commont object
	OBJECT_IS_NOT_AVAIALABLE				: 300,
	OBJECT_IS_NOT_VALID						: 301,
	OBJECT_CREATE_FAILED					: 302,
	OBJECT_UPDATE_FAILED					: 303,
	OBJECT_DELETE_FAILED					: 304,
	
	// Stripe
	STRIPE_FAILED							: 10000,
	STRIPE_CARD_ADD_FAILED					: 10001,
	
	STRIPE_CARD_ERROR_INVALID_NUMBER		: 10100,
	STRIPE_CARD_ERROR_INVALID_EXPIRY_MONTH	: 10101,
	STRIPE_CARD_ERROR_INVALID_EXPIRY_YEAR	: 10102,
	STRIPE_CARD_ERROR_INVALID_CVC			: 10103,
	STRIPE_CARD_ERROR_INCORRECT_NUMBER		: 10104,
	STRIPE_CARD_ERROR_EXPIRED_CARD			: 10105,
	STRIPE_CARD_ERROR_INCORRECT_CVC			: 10106,
	STRIPE_CARD_ERROR_INCORRECT_ZIP			: 10107,
	STRIPE_CARD_ERROR_CARD_DECLINED			: 10108,
	STRIPE_CARD_ERROR_MISSING				: 10109,
	STRIPE_CARD_ERROR_PROCESSING_ERROR		: 10110,
	
	// Algolia
	ALGOLIA_FAILED							: 20000
	
};


var messages = {
	
	// 500
	INTERNAL_SERVER_ERROR					: {
		en	: 'Internal Server Error'
	},
	
	// Runtime
	PARAM_IS_NOT_SPECIFIED					: {
		en	: 'Parameter is not specified'
	},
	PARAM_IS_NOT_VALID						: {
		en	: 'Parameter is not valid'
	},
	PARAM_SHOULD_NOT_BE_EMPTY				: {
		en	: 'Parameter should not be empty'
	},
	PARAM_SHOULD_BE_EMAIL					: {
		en	: 'Parameter should be email'
	},
	PARAM_SHOULD_HAVE_LENGTH				: {
		en	: 'Parameter should have length'
	},
	
	// Security
	AUTHORIZATION_IS_REQUIRED				: {
		en	: 'Authorization is required'
	},
	ACCESS_DENIED							: {
		en	: 'Access denied'
	},
	USER_UPDATE_FAILED						: {
		en	: 'User update failed'
	},
	USER_IS_NOT_AVAILABLE					: {
		en	: 'User is not available'
	},
	
	// Commont object
	OBJECT_IS_NOT_AVAIALABLE				: {
		en	: 'Item is not available'
	},
	OBJECT_IS_NOT_VALID						: {
		en	: 'Item is not valid'
	},
	OBJECT_CREATE_FAILED					: {
		en	: 'Item create failed'
	},
	OBJECT_UPDATE_FAILED					: {
		en	: 'Item update failed'
	},
	OBJECT_DELETE_FAILED					: {
		en	: 'Item delete failed'
	},
	
	// Stripe
	STRIPE_FAILED							: {
		en	: 'Stripe is not available'
	},
	STRIPE_CARD_ADD_FAILED					: {
		en	: 'Stripe card adding failed'
	},
	
	STRIPE_CARD_ERROR_INVALID_NUMBER		: {
		en	: 'Stripe card - invalid number'
	},
	STRIPE_CARD_ERROR_INVALID_EXPIRY_MONTH	: {
		en	: 'Stripe card - invalid expiry month'
	},
	STRIPE_CARD_ERROR_INVALID_EXPIRY_YEAR	: {
		en	: 'Stripe card - invalid expiry year'
	},
	STRIPE_CARD_ERROR_INVALID_CVC			: {
		en	: 'Stripe card - invalid CVC'
	},
	STRIPE_CARD_ERROR_INCORRECT_NUMBER		: {
		en	: 'Stripe card - incorrect number'
	},
	STRIPE_CARD_ERROR_EXPIRED_CARD			: {
		en	: 'Stripe card - expired card'
	},
	STRIPE_CARD_ERROR_INCORRECT_CVC			: {
		en	: 'Stripe card - incorrect CVC'
	},
	STRIPE_CARD_ERROR_INCORRECT_ZIP			: {
		en	: 'Stripe card - incorrect ZIP'
	},
	STRIPE_CARD_ERROR_CARD_DECLINED			: {
		en	: 'Stripe card - declined'
	},
	STRIPE_CARD_ERROR_MISSING				: {
		en	: 'Stripe card - missing'
	},
	STRIPE_CARD_ERROR_PROCESSING_ERROR		: {
		en	: 'Stripe card - processing error'
	},
	
	
	// Alogolia
	ALGOLIA_FAILED							: {
		en	: 'Algolia is not available'
	}
	
};

errors.messages = messages;

module.exports = errors;