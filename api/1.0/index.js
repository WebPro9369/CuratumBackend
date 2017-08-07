var express = require('express');
var _ = require('underscore');
var moment = require('moment');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var Serializer = require('./libs/serializer');

require('./libs/underscore.parse.js');

var stripe = require('stripe')('sk_test_4QoZYowtnUmPAF3tAvK0bLjQ');

var app = require('./app.js');

var algoliasearch = require('algoliasearch');

const
	ALGOLIA_APPLIATION_ID	= 'RG6651XH9I',
	ALGOLIA_API_KEY			= 'c49b9a60f9285c9271a902695550e3eb';

var algolia = algoliasearch(ALGOLIA_APPLIATION_ID, ALGOLIA_API_KEY);

var router = express.Router();

var serializer = new Serializer(
	app.scheme.classes,
	app.scheme.translators
);

const
	TAG_TYPE_SOCIAL		= 1,
	TAG_TYPE_ARCHETYPE	= 2,
	TAG_TYPE_PRODUCT	= 3,
	TAG_TYPE_WEATHER	= 4,
	TAG_TYPE_OCCASION	= 5,
	TAG_TYPE			= [TAG_TYPE_SOCIAL, TAG_TYPE_ARCHETYPE, TAG_TYPE_PRODUCT, TAG_TYPE_WEATHER, TAG_TYPE_OCCASION];
	
// Route OPTIONS

router.all('*', function (req, res, next) {
	
	res.set('Access-Control-Allow-Methods','GET,POST,PUT,DELETE,OPTIONS');
	res.set('Access-Control-Allow-Headers', 'Content-Type,If-None-Match,X-Curatum-Country-Code,X-Curatum-Language-Code,X-Curatum-Currency-Code,X-Curatum-Device-Type,X-Curatum-Session,X-Curatum-Include,X-Curatum-Page-Number,X-Curatum-Page-Size');
	res.set('Access-Control-Allow-Origin', req.get('Origin'));
	res.set('Accept', 'application/json');
	
	//console.log(req.get('Content-Type'));
	
	if (req.method === 'OPTIONS')
		res.status(200).send('OK')
	
	else
		next();
	
});

router.all('*', bodyParser.json({type: 'application/json'}));
router.all('*', expressValidator({
	customValidators: {
		isParseId			: function(value) {
			return _.isString(value) && value.search(/^[A-Za-z0-9]{10}$/) === 0;
		},
		isArrayOfStrings	: function (value, options) {
			
			/*if (!_.isArray(value))
				return false;
				
			var len = _.reduce(value, function (memo, val) {return memo + _.isString(val) ? 1 : 0;}, 0);
			
			if (_.size(value) !== length)
				return false;
				
			return _.size(value) === length && _.isArray(value) && */
		}
	},
	errorFormatter: function(param, msg, value) {
		return {
			param: param,
			msg: msg
		}
	}
}));

// Route headers and user session

router.all('*', function (req, res, next) {
	
	req.runtime = {};
	
	req.runtime.country = app.matchCountry(req.get('X-Curatum-Country-Code'));
	req.runtime.language = app.matchLanguage(req.get('X-Curatum-Language-Code'));
	req.runtime.currency = app.matchCurrency(req.get('X-Curatum-Currency-Code'));
	
	if (device = req.get('X-Curatum-Device-Type'))
		req.runtime.device = device;
	
	if (session = req.get('X-Curatum-Session'))
		req.runtime.session = session;
	
	req.runtime.include = ((include = req.get('X-Curatum-Include')) && (includes = String(include).match(/[A-Za-z\.]+/g))) ? includes : [];
		 
	if ((pageNumber = Number(req.get('X-Curatum-Page-Number'))) && pageNumber >= 0)
		req.runtime.pageNumber = pageNumber;
	
	if ((pageSize = Number(req.get('X-Curatum-Page-Size'))) && pageSize > 0)
		req.runtime.pageSize = pageSize;
	
	if (_.isEmpty(req.runtime.session))
		return next();
		
	Parse.User.enableUnsafeCurrentUser();
	
	Parse.User.become(req.runtime.session).then(
		
		function(user) {
			
			req.user = user;
			next();
			
		}, function(error) {
			
			console.log(error);
			res.sendStatus(200);
			
		}
		
	); 
	
});


var _paginate = function (query, pageNumber, pageSize) {
	
	if (!_.isUndefined(pageSize)) {
		
		query.skip(!_.isUndefined(pageNumber) ? pageNumber * pageSize : 0);
		query.limit(pageSize);
		
	}
	
}


var userLogin = function(req, res, next) {
	
	Parse.Promise.as().then(
		
		function () {
			
			req.check({
				'username'		: {
					in			: 'body',
					notEmpty	: true/*,
					isEmail		: true*/
				},
				'password'		: {
					in			: 'body',
					notEmpty	: true,
					isLength	: {
						options	: [{min: 6, max: 20}]
					}
				}
			});
	
			if (errors = req.validationErrors(true))
				return Parse.Promise.error(new app.Exception(app.Exception.PARAM_IS_NOT_VALID, req.runtime.language, null, errors));
	
			return Parse.User.logIn(req.body.username, req.body.password);
		
		}
	
	).then(
		
		function(user) {
			
			if (result = serializer.serialize(user, 'User', {language: app.chainLanguage(req.runtime.language), forceObject: true})) {
				
				req.result = {user: result, session: user.getSessionToken()};
				next();
			
			} else
				next(new app.Exception(app.Exception.INTERNAL_SERVER_ERROR, req.runtime.language));

		},
		function(error) {
			
			next(error);
			
		}
		
	);
	
};


var userSignup = function(req, res, next) {
	
	Parse.Promise.as().then(
		
		function () {
			
			var params = {};
			
			req.check({
				'username'		: {
					in			: 'body',
					notEmpty	: true,
					isEmail		: true
				},
				'password'		: {
					in			: 'body',
					notEmpty	: true,
					isLength	: {
						options	: [{min: 6, max: 20}]
					}
				}/*,
				'fullName'		: {
					in			: 'body',
					optional	: true,
					isLength	: {
						options	: [{min: 1}]
					}
				}*/
			});
			
			if (errors = req.validationErrors(true))
				return Parse.Promise.error(new app.Exception(app.Exception.PARAM_IS_NOT_VALID, req.runtime.language, null, errors));
			
			params = _.pick(req.body, 'fullName');
			params.email = req.body.username;
	
			return Parse.User.signUp(req.body.username, req.body.password, params);
		
		}
	
	).then(
		
		function(user) {
			
			if (result = serializer.serialize(user, 'User', {language: app.chainLanguage(req.runtime.language), forceObject: true})) {
				
				req.result = {user: result, session: user.getSessionToken()};
				next();
			
			} else
				next(new app.Exception(app.Exception.INTERNAL_SERVER_ERROR, req.runtime.language));

		},
		function(error) {
			console.log(error);
			res.status(400).json(error);
		}
		
	);
	
};


var userMatch = function(req, res, next) {
	
	Parse.Promise.as().then(
		
		function () {
			
			req.check({
				'username'		: {
					in			: 'body',
					notEmpty	: true,
					isEmail		: true
				}
			});
			
			if (errors = req.validationErrors(true))
				return Parse.Promise.error(new app.Exception(app.Exception.PARAM_IS_NOT_VALID, req.runtime.language, null, errors));
			
			var query = new Parse.Query('User');
			query.equalTo('username', req.body.username);
			return query.first();
			
		}
	
	).then(
	
		function(user) {
			
			req.result = {result: user instanceof Parse.User ? true : false};
			
			next();

		},
		function(error) {
			
			next(error);
			
		}
	);
	
};


var userReset = function(req, res, next) {
	
	Parse.Promise.as().then(
		
		function () {
			
			req.check({
				'username'		: {
					in			: 'body',
					notEmpty	: true,
					isEmail		: true
				}
			});
			
			if (errors = req.validationErrors(true))
				return Parse.Promise.error(new app.Exception(app.Exception.PARAM_IS_NOT_VALID, req.runtime.language, null, errors));
			
			return Parse.User.requestPasswordReset(req.body.email);
			
		}
	
	).then(
	
		function(user) {
			
			req.result = {result: true};
			
			next();
			
		},
		function(error) {
			
			next(error);
			
		}
		
	);
	
}


var userGet = function(req, res, next) {
	
	var defaultIncludes = ['defaultShippingAddress', 'defaultPaymentCard'];
	
	Parse.Promise.as().then(
		
		function () {
			
			if (!(req.user instanceof Parse.User))
				return Parse.Promise.error(new app.Exception(app.Exception.AUTHORIZATION_IS_REQUIRED, req.runtime.language));
			
			var query = new Parse.Query('User');
			query.include(serializer.includes('User', req.runtime.include, defaultIncludes));
			return query.get(req.user.id).then(
				
				null,
				function (error) {
					return Parse.Promise.error(new app.Exception(app.Exception.USER_IS_NOT_AVAILABLE, req.runtime.language))
				}
				
			);
			
		}
	
	).then(
		
		function(user) {
			
			if (result = serializer.serialize(user, 'User', {language: app.chainLanguage(req.runtime.language), forceObject: true})) {
				
				req.result = result;
				next();
			
			} else
				next(new app.Exception(app.Exception.INTERNAL_SERVER_ERROR, req.runtime.language));
			
		},
		function(error) {
			
			next(error);
			
		}
		
	);
	
};


var userPost = function(req, res, next) {
	
	Parse.Promise.as().then(
		
		function () {
			
			if (!(req.user instanceof Parse.User))
				return Parse.Promise.error(new app.Exception(app.Exception.AUTHORIZATION_IS_REQUIRED, req.runtime.language));
				
			req.check({
				'email'		: {
					in			: 'body',
					notEmpty	: true,
					isEmail		: true
				},
				'fullName'		: {
					in			: 'body',
					optional	: true,
					isLength	: {
						options	: [{min: 1}]
					}
				},
				'phoneNumber'	: {
					in			: 'body',
					optional	: true,
					isLength	: {
						options	: [{min: 1}]
					}
				},
				'country'	: {
					in			: 'body',
					optional	: true,
					isLength	: {
						options	: [{min: 2, max: 2}]
					}
				}
			});
			
			if (errors = req.validationErrors(true))
				return Parse.Promise.error(new app.Exception(app.Exception.PARAM_IS_NOT_VALID, req.runtime.language, null, errors));
			
			req.user.set('email', req.sanitize('email').trim());
			
			if (value = req.sanitize('fullName').trim())
				req.user.set('fullName', value);
			else
				req.user.unset('fullName');
			
			if (value = req.sanitize('phoneNumber').trim())
				req.user.set('phoneNumber', value);
			else
				req.user.unset('phoneNumber');
			
			if (value = req.sanitize('country').trim())
				req.user.set('country', value);
			else
				req.user.unset('country');
				
			return req.user.save().then(
				
				null,
				function (error) {
					return Parse.Promise.error(new app.Exception(app.Exception.USER_UPDATE_FAILED, req.runtime.language))
				}
				
			);
			
		}
	
	).then(
		
		function(user) {
			
			if (result = serializer.serialize(user, 'User', {language: app.chainLanguage(req.runtime.language), forceObject: true})) {
				
				req.result = result;
				next();
			
			} else
				next(new app.Exception(app.Exception.INTERNAL_SERVER_ERROR, req.runtime.language));
			
		},
		function(error) {
			
			next(error);
			
		}
		
	);
	
};


var userLikedProduct = function(req, res, next) {
	
	Parse.Promise.as().then(
		
		function () {
			
			if (!(req.user instanceof Parse.User))
				return Parse.Promise.error(new app.Exception(app.Exception.AUTHORIZATION_IS_REQUIRED, req.runtime.language));
			
			return Parse.Promise.as();
		
		}
	
	).then(
		
		function(user) {
			
			req.filters = {
				id: req.user.get('productLiked') || []
			};
			
			next();
			
		},
		function (error) {
			next(error);
		}
		
	);
	
	
}


var shippingAddressList = function(req, res, next) {
	
	Parse.Promise.as().then(
		
		function () {
			
			if (!(req.user instanceof Parse.User))
				return Parse.Promise.error(new app.Exception(app.Exception.AUTHORIZATION_IS_REQUIRED, req.runtime.language))
	
			var query = new Parse.Query('ShippingAddress');
			query.notEqualTo('removed', true);
			_paginate(query, req.runtime.pageNumber, req.runtime.pageSize);
			return query.find();
		
		}
	
	).then(
		
		function (items) {
			
			if (result = serializer.serialize(items, 'ShippingAddress', {language: app.chainLanguage(req.runtime.language), forceArray: true})) {
				
				req.result = result;
				next();
			
			} else
				next(new app.Exception(app.Exception.INTERNAL_SERVER_ERROR, req.runtime.language));
			
		},
		function(error) {
			
			next(error);
			
		}
		
	);
	
};


var shippingAddressCreate = function(req, res, next) {
	
	var shippingAddress;
	
	Parse.Promise.as().then(
		
		function () {
			
			if (!(req.user instanceof Parse.User))
				return Parse.Promise.error(new app.Exception(app.Exception.AUTHORIZATION_IS_REQUIRED, req.runtime.language))
				
			var params = {};
			
			req.check({
				'title'			: {
					in			: 'body',
					optional	: true
				},
				'personName'	: {
					in			: 'body',
					optional	: true
				},
				'phoneNumber'	: {
					in			: 'body',
					optional	: true
				},
				'emailAddress'	: {
					in			: 'body',
					optional	: true,
					isEmail		: true
				},
				'streetLines'	: {
					in			: 'body',
					notEmpty	: true,
					isLength	: {
						options	: [{min: 1, max: 2}]
					}
				},
				'city'	: {
					in			: 'body',
					notEmpty	: true
				},
				'stateOrProvinceCode'	: {
					in			: 'body',
					notEmpty	: true
				},
				'postalCode'	: {
					in			: 'body',
					notEmpty	: true
				},
				'countryCode'	: {
					in			: 'body',
					notEmpty	: true
				},
				'default'	: {
					in			: 'body',
					optional	: true,
					isBoolean	: true
				}
			});
			
			if (errors = req.validationErrors(true))
				return Parse.Promise.error(new app.Exception(app.Exception.PARAM_IS_NOT_VALID, req.runtime.language, null, errors));
			
			
			/*_.requestMatch(req.body, 'title', 'String', params);
			_.requestMatch(req.body, 'personName', 'String', params);
			_.requestMatch(req.body, 'phoneNumber', 'String', params);
			_.requestMatch(req.body, 'emailAddress', 'String', params);
			_.requestMatch(req.body, 'streetLines', 'Array', params);
			_.requestMatch(req.body, 'city', 'String', params);
			_.requestMatch(req.body, 'stateOrProvinceCode', 'String', params);
			_.requestMatch(req.body, 'postalCode', 'String', params);
			_.requestMatch(req.body, 'countryCode', 'String', params);*/
			
			var obj = new Parse.Object('ShippingAddress');
			
			obj.set('user', req.user);
			
			_.each(
				['title', 'personName', 'phoneNumber', 'emailAddress', 'streetLines', 'city', 'stateOrProvinceCode', 'postalCode', 'countryCode'],
				function (key) {
					obj.set(key, req.body[key]);
				}
			);
			
			return obj.save();
			
		}
		
	).then(
		
		function (result) {
					
			shippingAddress = result;
			
			if (req.sanitize('default').toBoolean(true) === true) {
				
				req.user.set('defaultShippingAddress', shippingAddress);
				
				return req.user.save().then(
					
					null,
					function (error) {
						return Parse.Promise.error(new app.Exception(app.Exception.USER_UPDATE_FAILED, req.runtime.language))
					}
					
				);
				
			}
			
			return Parse.Promise.as();
			
		}
		
	).then(
		
		function () {
			
			if (result = serializer.serialize(shippingAddress, 'ShippingAddress', {language: app.chainLanguage(req.runtime.language), forceObject: true})) {
				
				req.result = result;
				next();
			
			} else
				next(new app.Exception(app.Exception.INTERNAL_SERVER_ERROR, req.runtime.language));
			
		},
		function(error) {
			
			next(error);
			
		}
		
	);
	
};


var shippingAddressSetDefault = function(req, res, next) {
	
	var shippingAddress;
	
	Parse.Promise.as().then(
		
		function () {
			
			if (!(req.user instanceof Parse.User))
				return Parse.Promise.error(new app.Exception(app.Exception.AUTHORIZATION_IS_REQUIRED, req.runtime.language))
			
			req.check({
				'shippingAddressId' : {
					in			: 'params',
					notEmpty	: true,
					isParseId	: true
				}
			});
			
			if (errors = req.validationErrors(true))
				return Parse.Promise.error(new app.Exception(app.Exception.PARAM_IS_NOT_VALID, req.runtime.language, null, errors));
			
			var query = new Parse.Query('ShippingAddress');
			query.notEqualTo('removed', true);
			return query.get(req.params.shippingAddressId).then(
				
				null,
				function (error) {
					return Parse.Promise.error(new app.Exception(app.Exception.OBJECT_IS_NOT_AVAIALABLE, req.runtime.language))
				}
				
			);
			
		}
	
	).then(
		
		function (result) {
					
			shippingAddress = result;
			
			req.user.set('defaultShippingAddress', shippingAddress);
				
			return req.user.save().then(
				
				null,
				function (error) {
					return Parse.Promise.error(new app.Exception(app.Exception.USER_UPDATE_FAILED, req.runtime.language))
				}
				
			);
		
		}
	
	).then(
		
		function () {
			
			if (result = serializer.serialize(shippingAddress, 'ShippingAddress', {language: app.chainLanguage(req.runtime.language), forceObject: true})) {
				
				req.result = result;
				next();
			
			} else
				next(new app.Exception(app.Exception.INTERNAL_SERVER_ERROR, req.runtime.language));

		},
		function(error) {
			
			next(error);
			
		}
		
	);
	
};


var shippingAddressDelete = function(req, res, next) {
	
	Parse.Promise.as().then(
		
		function () {
			
			if (!(req.user instanceof Parse.User))
				return Parse.Promise.error(new app.Exception(app.Exception.AUTHORIZATION_IS_REQUIRED, req.runtime.language))
			
			req.check({
				'shippingAddressId' : {
					in			: 'params',
					notEmpty	: true,
					isParseId	: true
				}
			});
			
			if (errors = req.validationErrors(true))
				return Parse.Promise.error(new app.Exception(app.Exception.PARAM_IS_NOT_VALID, req.runtime.language, null, errors));
			
			var query = new Parse.Query('ShippingAddress');
			query.notEqualTo('removed', true);
			return query.get(req.params.shippingAddressId).then(
				
				null,
				function (error) {
					return Parse.Promise.error(new app.Exception(app.Exception.OBJECT_IS_NOT_AVAIALABLE, req.runtime.language))
				}
				
			);
			
		}
	
	).then(
		
		function (shippingAddress) {
			
			shippingAddress.set('removed', true);
			shippingAddress.set('removedAt', moment.utc().toDate());
			
			return shippingAddress.save().then(
				
				null,
				function (error) {
					return Parse.Promise.error(new app.Exception(app.Exception.OBJECT_UPDATE_FAILED, req.runtime.language))
				}
				
			);
		
		}
	
	).then(
		
		function (shippingAddress) {
			
			if (req.user.has('defaultShippingAddress') && req.user.get('defaultShippingAddress').id === shippingAddress.id) {
				
				req.user.unset('defaultShippingAddress');
				
				return req.user.save().then(
					
					null,
					function (error) {
						return Parse.Promise.error(new app.Exception(app.Exception.USER_UPDATE_FAILED, req.runtime.language))
					}
					
				);
				
			} else
				return Parse.Promise.as();
			
		}
	
	).then(
		
		function () {
			
			req.result = {result: true};
			
			next();

		},
		function(error) {
			
			next(error);
			
		}
		
	);
	
};


var shippingAddressDefaultMark = function (req, res, next) {
	
	if (_.isArray(req.result))
		_.each(req.result, function (shippingAddress) {
			
			if (req.user.has('defaultShippingAddress') && req.user.get('defaultShippingAddress').id === shippingAddress.id)
				shippingAddress.default = true;
				
		});
	
	else if (_.isObject(req.result)) {
		
		if (req.user.has('defaultShippingAddress') && req.user.get('defaultShippingAddress').id === req.result.id)
			req.result.default = true;
		
	}
	
	next();
		
};


var paymentCardList = function(req, res, next) {
	
	Parse.Promise.as().then(
		
		function () {
			
			if (!(req.user instanceof Parse.User))
				return Parse.Promise.error(new app.Exception(app.Exception.AUTHORIZATION_IS_REQUIRED, req.runtime.language))
	
			var query = new Parse.Query('PaymentCard');
			query.notEqualTo('removed', true);
			_paginate(query, req.runtime.pageNumber, req.runtime.pageSize);
			return query.find();
		
		}
	
	).then(
		
		function (items) {
			
			if (result = serializer.serialize(items, 'PaymentCard', {language: app.chainLanguage(req.runtime.language), forceArray: true})) {
				
				req.result = result;
				next();
			
			} else
				next(new app.Exception(app.Exception.INTERNAL_SERVER_ERROR, req.runtime.language));
			
		},
		function(error) {
			
			next(error);
			
		}
		
	);
	
};


var paymentCardCreate = function(req, res, next) {
	
	var paymentCard;
	
	Parse.Promise.as().then(
		
		function () {
			
			if (!(req.user instanceof Parse.User))
				return Parse.Promise.error(new app.Exception(app.Exception.AUTHORIZATION_IS_REQUIRED, req.runtime.language))
			
			var params = {};
				
			req.check({
				'token'			: {
					in			: 'body',
					// TODO RiP
					optional	: true
					// TODO UiP
					//notEmpty	: true
				},
				'default'	: {
					in			: 'body',
					optional	: true,
					isBoolean	: true
				}
			});
			
			if (errors = req.validationErrors(true))
				return Parse.Promise.error(new app.Exception(app.Exception.PARAM_IS_NOT_VALID, req.runtime.language, null, errors));
			
			if (req.user.has('stripeCustomerId') && (stripeCustomerId = req.user.get('stripeCustomerId')))
				return Parse.Promise.as(stripeCustomerId);

			var customerData = {
				account_balance	: 0,
				email			: req.user.get('username'),
				description		: req.user.get('username') + (req.user.has('fullName') ? ' (' + req.user.get('fullName') + ')' : ''),
				metadata		: {
					fullName		: req.user.get('fullName') || '',
					userId			: req.user.id
				}
			};
			
			return stripe.customers.create(customerData).then(
				
				function (stripeCustomer) {
					
					console.log(stripeCustomer)
					
					if (!(stripeCustomer && stripeCustomer.id))
						return Parse.Promise.error(new app.Exception(app.Exception.STRIPE_FAILED, req.runtime.language));
					
					req.user.set('stripeCustomerId', stripeCustomer.id);
					
					return req.user.save().then(
						
						null,
						function (error) {
							console.log(error);
							return Parse.Promise.error(new app.Exception(app.Exception.USER_UPDATE_FAILED, req.runtime.language));
						}
						
					);
					
				},
				function (error) {
					console.log(error);
					return Parse.Promise.error(new app.Exception(app.Exception.STRIPE_FAILED, req.runtime.language));
				}
				
			).then(
				
				function (user) {
					
					return Parse.Promise.as(user.get('stripeCustomerId'));
					
				}
				
			);
		
		}
	
	).then(
		
		function (stripeCustomerId) {
			
			var params = {};
			
			if (_.has(req.body, 'token'))
				params.source = req.body.token;
			
			// TODO RiP
			else {
				
				params.source = {
					object		: 'card',
					exp_month	: req.body.exp_month || '',
					exp_year	: req.body.exp_year || '',
					number		: req.body.number || ''
				};
				
				if (_.has(req.body, 'cvc'))
					params.source.cvc = req.body.cvc;
				
			}
			
			return stripe.customers.createSource(stripeCustomerId, params);
			
		}
		
	).then(
		
		function (stripeCard) {

			if (!(stripeCard && stripeCard.id))
				return Parse.Promise.error(new app.Exception(app.Exception.STRIPE_CARD_ADD_FAILED, req.runtime.language));
			
			var obj = new Parse.Object('PaymentCard');
			
			obj.set('user', req.user);
			obj.set('stripeCardId', stripeCard.id);
			
			if (_.has(stripeCard, 'brand'))
				obj.set('cardType', stripeCard.brand);
			
			if (_.has(stripeCard, 'last4'))
				obj.set('trailingDigits', stripeCard.last4);
			
			return obj.save().then(
				
				null,
				function (error) {
					return Parse.Promise.error(new app.Exception(app.Exception.OBJECT_CREATE_FAILED, req.runtime.language));
				}
				
			);
			
		}
		
	).then(
		
		function (result) {
					
			paymentCard = result;
			
			if (req.body.default === true) {
				
				req.user.set('defaultPaymentCard', paymentCard);
				
				return req.user.save().then(
					
					null,
					function (error) {
						return Parse.Promise.error(new app.Exception(app.Exception.USER_UPDATE_FAILED, req.runtime.language))
					}
					
				);
				
			}
			
			return Parse.Promise.as();
			
		}
		
	).then(
		
		function () {
			
			if (result = serializer.serialize(paymentCard, 'PaymentCard', {language: app.chainLanguage(req.runtime.language), forceObject: true})) {
				
				req.result = result;
				next();
			
			} else
				next(new app.Exception(app.Exception.INTERNAL_SERVER_ERROR, req.runtime.language));
			
		},
		function(error) {
			
			next(error);
			
		}
		
	);
	
};


var paymentCardSetDefault = function(req, res, next) {
	
	var paymentCard;
	
	Parse.Promise.as().then(
		
		function () {
			
			if (!(req.user instanceof Parse.User))
				return Parse.Promise.error(new app.Exception(app.Exception.AUTHORIZATION_IS_REQUIRED, req.runtime.language))
			
			req.check({
				'paymentCardId' : {
					in			: 'params',
					notEmpty	: true,
					isParseId	: true
				}
			});
			
			if (errors = req.validationErrors(true))
				return Parse.Promise.error(new app.Exception(app.Exception.PARAM_IS_NOT_VALID, req.runtime.language, null, errors));
			
			var query = new Parse.Query('PaymentCard');
			query.notEqualTo('removed', true);
			return query.get(req.params.paymentCardId).then(
				
				null,
				function (error) {
					return Parse.Promise.error(new app.Exception(app.Exception.OBJECT_IS_NOT_AVAIALABLE, req.runtime.language))
				}
				
			);
			
		}
	
	).then(
		
		function (result) {
					
			paymentCard = result;
			
			req.user.set('defaultPaymentCard', paymentCard);
				
			return req.user.save().then(
				
				null,
				function (error) {
					return Parse.Promise.error(new app.Exception(app.Exception.USER_UPDATE_FAILED, req.runtime.language))
				}
				
			);
		
		}
	
	).then(
		
		function () {
			
			if (result = serializer.serialize(paymentCard, 'PaymentCard', {language: app.chainLanguage(req.runtime.language), forceObject: true})) {
				
				req.result = result;
				next();
			
			} else
				next(new app.Exception(app.Exception.INTERNAL_SERVER_ERROR, req.runtime.language));

		},
		function(error) {
			
			next(error);
			
		}
		
	);
	
};


var paymentCardDelete = function(req, res, next) {
	
	Parse.Promise.as().then(
		
		function () {
			
			if (!(req.user instanceof Parse.User))
				return Parse.Promise.error(new app.Exception(app.Exception.AUTHORIZATION_IS_REQUIRED, req.runtime.language))
			
			req.check({
				'paymentCardId' : {
					in			: 'params',
					notEmpty	: true,
					isParseId	: true
				}
			});
			
			if (errors = req.validationErrors(true))
				return Parse.Promise.error(new app.Exception(app.Exception.PARAM_IS_NOT_VALID, req.runtime.language, null, errors));
			
			var query = new Parse.Query('PaymentCard');
			query.notEqualTo('removed', true);
			return query.get(req.params.paymentCardId).then(
				
				null,
				function (error) {
					return Parse.Promise.error(new app.Exception(app.Exception.OBJECT_IS_NOT_AVAIALABLE, req.runtime.language))
				}
				
			);
			
		}
	
	).then(
		
		function (paymentCard) {
			
			paymentCard.set('removed', true);
			paymentCard.set('removedAt', moment.utc().toDate());
			
			return paymentCard.save();
		
		}
	
	).then(
		
		function (paymentCard) {
			
			if (req.user.has('defaultPaymentCard') && req.user.get('defaultPaymentCard').id === paymentCard.id) {
				
				req.user.unset('defaultPaymentCard');
				
				return req.user.save().then(
					
					null,
					function (error) {
						return Parse.Promise.error(new app.Exception(app.Exception.USER_UPDATE_FAILED, req.runtime.language))
					}
					
				);
				
			} else
				return Parse.Promise.as();
			
		}
	
	).then(
		
		function () {
			
			req.result = {result: true};
			
			next();

		},
		function(error) {
			
			next(error);
			
		}
		
	);
	
};


var paymentCardDefaultMark = function (req, res, next) {
	
	if (_.isArray(req.result))
		_.each(req.result, function (paymentCard) {
			
			if (req.user.has('defaultPaymentCard') && req.user.get('defaultPaymentCard').id === paymentCard.id)
				paymentCard.default = true;
				
		});
	
	else if (_.isObject(req.result)) {
		
		if (req.user.has('defaultPaymentCard') && req.user.get('defaultPaymentCard').id === req.result.id)
			req.result.default = true;
		
	}
	
	next();
		
};


var brandList = function(req, res, next) {
	
	var defaultIncludes = ['logo', 'image'];
	
	Parse.Promise.as().then(
		
		function () {
	
			var query = new Parse.Query('Brand');
			query.include(serializer.includes('Brand', req.runtime.include, defaultIncludes));
			//query.equalTo('availableCountry', req.runtime.country);
			//query.equalTo('published', true);
			_paginate(query, req.runtime.pageNumber, req.runtime.pageSize);
			return query.find();
		
		}
	
	).then(
		
		function (items) {
			
			if (result = serializer.serialize(items, 'Brand', {language: app.chainLanguage(req.runtime.language), forceArray: true})) {
				
				req.result = result;
				next();
			
			} else
				next(new app.Exception(app.Exception.INTERNAL_SERVER_ERROR, req.runtime.language));
			
		},
		function(error) {
			
			next(error);
			
		}
		
	);
	
};


var brandItem = function(req, res, next) {
	
	var defaultIncludes = ['logo', 'image'];
	
	Parse.Promise.as().then(
		
		function () {
			
			req.check({
				'brandId' : {
					in			: 'params',
					notEmpty	: true,
					isParseId	: true
				}
			});
	
			if (errors = req.validationErrors(true))
				return Parse.Promise.error(new app.Exception(app.Exception.PARAM_IS_NOT_VALID, req.runtime.language, null, errors));
			
			var query = new Parse.Query('Brand');
			query.include(serializer.includes('Brand', req.runtime.include, defaultIncludes));
			//query.equalTo('availableCountry', req.runtime.country);
			//query.equalTo('published', true);
			return query.get(req.params.brandId).then(
				
				null,
				function (error) {
					return Parse.Promise.error(new app.Exception(app.Exception.OBJECT_IS_NOT_AVAIALABLE, req.runtime.language))
				}
				
			);
			
		}
	
	).then(
		
		function (items) {
			
			if (result = serializer.serialize(items, 'Brand', {language: app.chainLanguage(req.runtime.language), forceObject: true})) {
				
				req.result = result;
				next();
			
			} else
				next(new app.Exception(app.Exception.INTERNAL_SERVER_ERROR, req.runtime.language));

		},
		function(error) {
			
			next(error);
			
		}
		
	);
	
};


var boutiqueList = function(req, res, next) {
	
	var defaultIncludes = ['logo', 'image', 'mapImage'];
	
	Parse.Promise.as().then(
		
		function () {
	
			var query = new Parse.Query('Boutique');
			query.include(serializer.includes('Boutique', req.runtime.include, defaultIncludes));
			//query.equalTo('availableCountry', req.runtime.country);
			//query.equalTo('published', true);
			_paginate(query, req.runtime.pageNumber, req.runtime.pageSize);
			return query.find();
			
		}
	
	).then(
		
		function (items) {
			
			if (result = serializer.serialize(items, 'Boutique', {language: app.chainLanguage(req.runtime.language), forceArray: true})) {
				
				req.result = result;
				next();
			
			} else
				next(new app.Exception(app.Exception.INTERNAL_SERVER_ERROR, req.runtime.language));
			
		},
		function(error) {
			
			next(error);
			
		}
		
	);
	
};


var boutiqueItem = function(req, res, next) {
	
	var defaultIncludes = ['logo', 'image', 'mapImage'];
	
	Parse.Promise.as().then(
		
		function () {
			
			req.check({
				'boutiqueId' : {
					in			: 'params',
					notEmpty	: true,
					isParseId	: true
				}
			});
	
			if (errors = req.validationErrors(true))
				return Parse.Promise.error(new app.Exception(app.Exception.PARAM_IS_NOT_VALID, req.runtime.language, null, errors));
			
			var query = new Parse.Query('Boutique');
			query.include(serializer.includes('Boutique', req.runtime.include, defaultIncludes));
			//query.equalTo('availableCountry', req.runtime.country);
			//query.equalTo('published', true);
			return query.get(req.params.boutiqueId).then(
				
				null,
				function (error) {
					return Parse.Promise.error(new app.Exception(app.Exception.OBJECT_IS_NOT_AVAIALABLE, req.runtime.language))
				}
				
			);
			
		}
	
	).then(
		
		function (items) {
			
			if (result = serializer.serialize(items, 'Boutique', {language: app.chainLanguage(req.runtime.language), forceObject: true})) {
				
				req.result = result;
				next();
			
			} else
				next(new app.Exception(app.Exception.INTERNAL_SERVER_ERROR, req.runtime.language));

		},
		function(error) {
			
			next(error);
			
		}
		
	);
	
};


var interviewList = function(req, res, next) {
	
	var defaultIncludes = ['image'];
	
	Parse.Promise.as().then(
		
		function () {
	
			var query = new Parse.Query('Interview');
			query.include(serializer.includes('Interview', req.runtime.include, defaultIncludes));
			//query.equalTo('availableCountry', req.runtime.country);
			//query.equalTo('published', true);
			_paginate(query, req.runtime.pageNumber, req.runtime.pageSize);
			return query.find();
			
		}
	
	).then(
		
		function (items) {
			
			if (result = serializer.serialize(items, 'Interview', {language: app.chainLanguage(req.runtime.language), forceArray: true})) {
				
				req.result = result;
				next();
			
			} else
				next(new app.Exception(app.Exception.INTERNAL_SERVER_ERROR, req.runtime.language));
			
		},
		function(error) {
			
			next(error);
			
		}
		
	);
	
};


var interviewItem = function(req, res, next) {
	
	var defaultIncludes = ['image'];
	
	Parse.Promise.as().then(
		
		function () {
			
			req.check({
				'interviewId' : {
					in			: 'params',
					notEmpty	: true,
					isParseId	: true
				}
			});
	
			if (errors = req.validationErrors(true))
				return Parse.Promise.error(new app.Exception(app.Exception.PARAM_IS_NOT_VALID, req.runtime.language, null, errors));
	
			var query = new Parse.Query('Interview');
			query.include(serializer.includes('Interview', req.runtime.include, defaultIncludes));
			//query.equalTo('availableCountry', req.runtime.country);
			//query.equalTo('published', true);
			return query.get(req.params.interviewId).then(
				
				null,
				function (error) {
					return Parse.Promise.error(new app.Exception(app.Exception.OBJECT_IS_NOT_AVAIALABLE, req.runtime.language))
				}
				
			);
			
		}
	
	).then(
		
		function (items) {
			
			if (result = serializer.serialize(items, 'Interview', {language: app.chainLanguage(req.runtime.language), forceObject: true})) {
				
				req.result = result;
				next();
			
			} else
				next(new app.Exception(app.Exception.INTERNAL_SERVER_ERROR, req.runtime.language));

		},
		function(error) {
			
			next(error);
			
		}
		
	);
	
};


var productCategoryList = function(req, res, next) {
	
	Parse.Promise.as().then(
		
		function () {
	
			var query = new Parse.Query('ProductCategory');
			query.equalTo('published', true);
			_paginate(query, req.runtime.pageNumber, req.runtime.pageSize);
			return query.find();
		}
	
	).then(
		
		function (items) {
			
			if (result = serializer.serialize(items, 'ProductCategory', {language: app.chainLanguage(req.runtime.language), forceArray: true})) {
				
				req.result = result;
				next();
			
			} else
				next(new app.Exception(app.Exception.INTERNAL_SERVER_ERROR, req.runtime.language));
			
		},
		function(error) {
			
			next(error);
			
		}
		
	);
	
};

var productList = function (req, res, next) {
	
	var defaultIncludes = ['image', 'specImage', 'detailImage'];
	
	console.log(req.filters);
	
	Parse.Promise.as().then(
		
		function () {
	
			var query = new Parse.Query('Product');
			query.include(serializer.includes('Product', req.runtime.include, defaultIncludes));
			
			if (_.has(req.filter, 'id'))
				query.containedIn('objectId', req.filter.id);

			//query.equalTo('availableCountry', req.runtime.country);
			//query.equalTo('published', true);
			_paginate(query, req.runtime.pageNumber, req.runtime.pageSize);
			return query.find();
		}
	
	).then(
		
		function (items) {
			
			if (result = serializer.serialize(items, 'Product', {language: app.chainLanguage(req.runtime.language), currency: app.chainCurrency(req.runtime.currency), forceArray: true})) {

				req.result = result;
				next();
			
			} else
				next(new app.Exception(app.Exception.INTERNAL_SERVER_ERROR, req.runtime.language));
			
		},
		function(error) {
			
			next(error);
			
		}
		
	);
	
}


var productItem = function(req, res, next) {
	
	var defaultIncludes = ['image', 'specImage', 'detailImage', 'unit', 'unit.value', 'unit.value.type'];
	
	Parse.Promise.as().then(
		
		function () {
			
			req.check({
				'productId' : {
					in			: 'params',
					notEmpty	: true,
					isParseId	: true
				}
			});
	
			if (errors = req.validationErrors(true))
				return Parse.Promise.error(new app.Exception(app.Exception.PARAM_IS_NOT_VALID, req.runtime.language, null, errors));
			
			var query = new Parse.Query('Product');
			query.include(serializer.includes('Product', req.runtime.include, defaultIncludes));
			//query.equalTo('availableCountry', req.runtime.country);
			//query.equalTo('published', true);
			//query.include(['image', 'detailImage', 'specImage', 'brand', 'boutique', 'interview', 'hashTags', 'archetypeTags', 'productTags', 'weatherTags']);
			return query.get(req.params.productId).then(
				
				null,
				function (error) {
					return Parse.Promise.error(new app.Exception(app.Exception.OBJECT_IS_NOT_AVAIALABLE, req.runtime.language))
				}
				
			);
			
		}
	
	).then(
		
		function (items) {
			
			if (result = serializer.serialize(items, 'Product', {language: app.chainLanguage(req.runtime.language), currency: app.chainCurrency(req.runtime.currency), forceObject: true})) {
				
				req.result = result;
				next();
			
			} else
				next(new app.Exception(app.Exception.INTERNAL_SERVER_ERROR, req.runtime.language));

		},
		function(error) {
			
			next(error);
			
		}
		
	);
	
};


var productLikedMark = function (req, res, next) {
	
	console.log('bef mark')
	
	if (req.user instanceof Parse.User) {
		
		if (_.isArray(req.result))
			_.each(req.result, function (product) {
				
				if (_.contains(req.user.get('productLiked') || [], product.id))
					product.isLiked = true;
					
			});
		
		else if (_.isObject(req.result)) {
			
			if (_.contains(req.user.get('productLiked') || [], req.result.id))
				result.isLiked = true;
			
		}
	
	}
	
	next();
		
};


var timelineList = function(req, res, next) {
	
	var defaultIncludes = ['image'];
	
	Parse.Promise.as().then(
		
		function () {
	
			var query = new Parse.Query('Timeline');
			query.include(serializer.includes('Timeline', req.runtime.include, defaultIncludes));
			//query.equalTo('availableCountry', req.runtime.country);
			//query.equalTo('published', true);
			query.equalTo('private', false);
			query.ascending('sortOrder');
			query.limit(6);
			return query.find();
		}
	
	).then(
		
		function (items) {
			
			if (result = serializer.serialize(items, 'Timeline', {language: app.chainLanguage(req.runtime.language), forceArray: true})) {
				
				req.result = result;
				next();
			
			} else
				next(new app.Exception(app.Exception.INTERNAL_SERVER_ERROR, req.runtime.language));
			
		},
		function(error) {
			
			next(error);
			
		}
		
	);
	
};


var timelineItem = function(req, res, next) {
	
	var defaultIncludes = ['image', 'authRequiredImage', 'discountImage', 'wonImage', 'product.image', 'product.specImage', 'product.detailImage'];
	
	Parse.Promise.as().then(
		
		function () {
			
			req.check({
				'timelineId' : {
					in			: 'params',
					notEmpty	: true,
					isParseId	: true
				}
			});
	
			if (errors = req.validationErrors(true))
				return Parse.Promise.error(new app.Exception(app.Exception.PARAM_IS_NOT_VALID, req.runtime.language, null, errors));
	
			var query = new Parse.Query('Timeline');
			query.include(serializer.includes('Timeline', req.runtime.include, defaultIncludes));
			//query.equalTo('availableCountry', req.runtime.country);
			//query.equalTo('published', true);
			//query.include(['image', 'authRequiredImage', 'discountImage', 'wonImage', 'product', 'product.brand', 'product.boutique', 'product.interview', 'product.image', 'product.category', 'product.specImage', 'product.detailImage']);
			return query.get(req.params.timelineId).then(
				
				null,
				function (error) {
					return Parse.Promise.error(new app.Exception(app.Exception.OBJECT_IS_NOT_AVAIALABLE, req.runtime.language))
				}
				
			);
			
		}
	
	).then(
		
		function (items) {
			
			if (result = serializer.serialize(items, 'Timeline', {language: app.chainLanguage(req.runtime.language), forceObject: true})) {
				
				req.result = result;
				next();
			
			} else
				next(new app.Exception(app.Exception.INTERNAL_SERVER_ERROR, req.runtime.language));

		},
		function(error) {
			
			next(error);
			
		}
		
	);
	
};


var search = function(req, res, next) {
	
	var defaultIncludes = ['image', 'specImage', 'detailImage'];
	
	var query;
	
	Parse.Promise.as().then(
		
		function () {
			
			req.check({
				'query' : {
					in			: 'body',
					notEmpty	: true
				}
			});
	
			if (errors = req.validationErrors(true))
				return Parse.Promise.error(new app.Exception(app.Exception.PARAM_IS_NOT_VALID, req.runtime.language, null, errors));
				
			query = req.sanitize('query').trim();
			
			if (_.has(req.body, 'value')) {
				
				if (!_.isObject(req.body.value))
					return Parse.Promise.error(new app.Exception(app.Exception.PARAM_IS_NOT_VALID, req.runtime.language, null, {value: {param: 'value', msg: 'Invalid param'}}));
				
				var query = new Parse.Query('Product');
				query.include(serializer.includes('Product', req.runtime.include, defaultIncludes));
				//query.equalTo('availableCountry', req.runtime.country);
				//query.equalTo('published', true);
				
				if (req.body.value.type === 'brand' && !_.isEmpty(req.body.value.objectId)) {
					
					var brand = new Parse.Object('Brand');
					brand.id = req.body.value.objectId;
					
					query.equalTo('brand', brand);
							
				} else if (req.body.value.type === 'product' && !_.isEmpty(req.body.value.objectId)) {
					
					query.equalTo('objectId', req.body.value.objectId);
					
				} else
					return Parse.Promise.error(new app.Exception(app.Exception.PARAM_IS_NOT_VALID, req.runtime.language, null, {value: {param: 'value', msg: 'Invalid param'}}));
				
				
				return query.find().then(
					
					function (items) {
						try {
							var result = serializer.serialize(items, 'Product', {language: app.chainLanguage(req.runtime.language)});
							return Parse.Promise.as(result);
						} catch (e) {
							console.log(e)
							return Parse.Promise.error(new app.Exception(app.Exception.INTERNAL_SERVER_ERROR, req.runtime.language));
						};
					}
					
				);
				
			} else {
				
				var queries = [
					{
						indexName	: 'Brand',
						query		: query,
						params		: {
							attributesToRetrieve	: ['subject', 'title', 'objectId'],
							filters					: 'language:"' + req.runtime.language + '"',
							hitsPerPage				: 3
						}
					},
					{
						indexName	: 'Product',
						query		: query,
						params		: {
							attributesToRetrieve	: ['subject', 'title', 'objectId'],
							filters					: 'language:"' + req.runtime.language + '"',// AND availableCountry:"' + req.runtime.language + '"', // TODO
							hitsPerPage				: 3
						}
					}
				];
				
				return algolia.search(queries).then(
					
					function (search) {
						
						var
							brandResult = search.results[0],
							productResult = search.results[1];
							brandItems = _.values(brandResult.hits),
							productItems = _.values(productResult.hits),
							items = [],
							totalCount = 3;
						
						var reduceProduct = function (memo, item) {
							
							memo.push({
								subject		: item.subject,
								text		: item.title,
								value		: {
									type		: 'product',
									objectId	: item.objectId
								},
								highlight	: item._highlightResult
							});
							
							totalCount--;
							
							return memo;
							
						};
						
						var reduceBrand = function (memo, item) {
							
							memo.push({
								subject	: item.subject,
								text	: item.title,
								value	: {
									type		: 'brand',
									objectId	: item.objectId
								},
								highlight	: item._highlightResult
							});
							
							totalCount--;
							
							return memo;
							
						};
						
						_.reduce(
							productItems.splice(0, 2),
							reduceProduct,
							items
						);
						
						_.reduce(
							brandItems.splice(0, totalCount),
							reduceBrand,
							items
						);
						
						_.reduce(
							productItems.splice(0, totalCount),
							reduceProduct,
							items
						);
						
						return Parse.Promise.as(items);
						
					},
					function (error) {
						return Parse.Promise.error(new app.Exception(app.Exception.ALGOLIA_FAILED, req.runtime.language))
					}
					
				);
				
			}
				
		}
	
	).then(
		
		
		
	).then(
		
		function (items) {
			
			req.result = items;
			
			next();

		},
		function(error) {
			
			next(error);
			
		}
		
	);
	
};


var tagList = function(req, res, next) {
	
	Parse.Promise.as().then(
		
		function () {

			req.check({
				'type'			: {
					in			: 'params',
					optional	: true,
					isInt		: true
				}
			});
			
			if (errors = req.validationErrors(true))
				return Parse.Promise.error(new app.Exception(app.Exception.PARAM_IS_NOT_VALID, req.runtime.language, null, errors));
			
			var query = new Parse.Query('Tag');
			
			if ((type = req.sanitize('type').toInt()) && _.contains(TAG_TYPE, type))
				query.equalTo('type', type);
			
			_paginate(query, req.runtime.pageNumber, req.runtime.pageSize);
			
			return query.find();
			
		}
		
	).then(
		
		function (items) {
			
			if (result = serializer.serialize(items, 'Tag', {language: app.chainLanguage(req.runtime.language), forceArray: true})) {
				
				req.result = result;
				next();
			
			} else
				next(new app.Exception(app.Exception.INTERNAL_SERVER_ERROR, req.runtime.language));
			
		},
		function(error) {
			
			next(error);
			
		}
		
	);
	
};


var configList = function(req, res, next) {
	
	var types = {
		Country			: 'country',
		Language		: 'language',
		Currency		: 'currency',
		ShippingType	: 'shippingType',
		DeviceType		: 'device'
	};
	
	Parse.Promise.as().then(
		
		function () {
			
			req.check({
				'type'			: {
					in			: 'params',
					notEmpty	: true,
					isIn		: {
						options	: _.keys(types)
					}
				}
			});
			
			if (errors = req.validationErrors(true))
				return Parse.Promise.error(new app.Exception(app.Exception.PARAM_IS_NOT_VALID, req.runtime.language, null, errors));
	
			return Parse.Promise.as(app.enums[types[req.params.type]]);
		
		}
		
	).then(
		
		function (items) {
			
			req.result = items;
			
			next();
			
		},
		function(error) {
			
			next(error);
			
		}
		
	);
	
};



// Request logger
router.use(function(req, res, next) {
	
	console.log(req.runtime);
	console.log(req.user)
	console.log(req.body);
	
	next();
	
});


router.post('/user/login', userLogin);
router.put('/user', userSignup);
router.post('/user/match', userMatch);
router.post('/user/reset', userReset);
router.get('/user/me', userGet);
router.post('/user/me', userPost);
router.post('/user/liked/product', userLikedProduct, productList, productLikedMark);

router.get('/shipping-address', shippingAddressList, shippingAddressDefaultMark);
router.put('/shipping-address', shippingAddressCreate, shippingAddressDefaultMark);
router.put('/shipping-address/:shippingAddressId', shippingAddressSetDefault, shippingAddressDefaultMark);
router.delete('/shipping-address/:shippingAddressId', shippingAddressDelete);

router.get('/payment-card', paymentCardList, paymentCardDefaultMark);
router.put('/payment-card', paymentCardCreate, paymentCardDefaultMark);
router.put('/payment-card/:paymentCardId', paymentCardSetDefault, paymentCardDefaultMark);
router.delete('/payment-card/:paymentCardId', paymentCardDelete);

router.get('/brand', brandList);
router.get('/brand/:brandId', brandItem);

router.get('/boutique', boutiqueList);
router.get('/boutique/:boutiqueId', boutiqueItem);

router.get('/interview', interviewList);
router.get('/interview/:interviewId', interviewItem);

router.get('/product-category', productCategoryList);

router.get('/product', productList, productLikedMark);
router.get('/product/:productId', productItem, productLikedMark);

router.get('/timeline', timelineList);
router.get('/timeline/:timelineId', timelineItem);

router.post('/search', search);

router.get('/tag/:type?', tagList);

router.get('/config/:type', configList);


// Success-handling middleware
router.use(function(req, res, next) {
	console.log('success');
	res.status(200).json(req.result);
});

// Error-handling middleware
router.use(function(error, req, res, next) {
	console.log('error');
	console.log(error);
	res.status(error instanceof app.Exception ? 400 : 500).json(error);
});

module.exports = router;
