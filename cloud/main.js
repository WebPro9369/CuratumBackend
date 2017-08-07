var _ = require('underscore');
var app = require('../api/1.0/app.js');
var algoliasearch = require('algoliasearch');

////////////////////////////////////////////////////////////////////////////////
// Modules initialization


const
	ALGOLIA_APPLIATION_ID	= 'RG6651XH9I',
	ALGOLIA_API_KEY			= 'b3bc82fcb583a8b46958bbb61772d2f8';



////////////////////////////////////////////////////////////////////////////////
// Project defines


var
	ROLE_ADMIN				= 'admin',
	ROLE_PARTNER			= 'partner',
	ROLE					= [ROLE_ADMIN, ROLE_PARTNER];

////////////////////////////////////////////////////////////////////////////////
// Triggers


// Product before save trigger
//	- validate
//	- set ACL
// Exception:
//	Partner role is not available
//	Access denied
/*Parse.Cloud.beforeSave('Product', function(request, response) {

	var
		isNew = request.object.isNew();
	
	if (!request.object.dirty('boutique'))
		return response.success();
		
	var promises = [];
	
	promises.push(request.master ? true : fetchUserRoles(request.user));
	promises.push(fetchBoutiqueRole(request.object.get('boutique')));
		
	Parse.Promise.when(promises).then(
		
		function (result) {
			
			userRoles = result[0];
			boutiqueRole = result[1];
			
			if (!(boutiqueRole instanceof Parse.Role))
				return Parse.Promise.error(new Parse.Error('Partner role is not available'))
			
			if (userRoles === true)
				return Parse.Promise.as(boutiqueRole);
			
			var
				isAdmin = haveAdminRole(userRoles),
				isPartner = havePartnerRole(userRoles);
			
			if (isAdmin)
				return Parse.Promise.as(boutiqueRole);
			
			if (isPartner) {
				
				if (haveBoutiqueRole(userRoles, request.object.get('boutique').id))
					return Parse.Promise.as(boutiqueRole);
				
				else
					return Parse.Promise.error(new Parse.Error('Access denied'))
				
			} else
				return Parse.Promise.error(new Parse.Error('Access denied'))
			
		}
		
	).then(
		
		function (boutiqueRole) {
			
			var acl = defaultAcl(null, true, false, true, true, true, true);
			acl.setRoleReadAccess(boutiqueRole, true);
			acl.setRoleWriteAccess(boutiqueRole, true);
			request.object.setACL(acl);
			
			response.success();
			
		},
		function (error) {
			
			response.error(error.message);
			
		}
		
	);
	
});


// Timeline before save trigger
//	- validate
//	- set ACL
// Exception:
//	Partner role is not available
//	Access denied
Parse.Cloud.beforeSave('Timeline', function(request, response) {

	var
		isNew = request.object.isNew();
	
	if (!request.object.dirty('boutique'))
		return response.success();
		
	var promises = [];
	
	promises.push(request.master ? true : fetchUserRoles(request.user));
	promises.push(fetchBoutiqueRole(request.object.get('boutique')));
	
	Parse.Promise.when(promises).then(
		
		function (result) {
			
			userRoles = result[0];
			boutiqueRole = result[1];
		
			if (!(boutiqueRole instanceof Parse.Role))
				return Parse.Promise.error(new Parse.Error('Partner role is not available'))
			
			if (userRoles === true)
				return Parse.Promise.as(boutiqueRole);
			
			var
				isAdmin = haveAdminRole(userRoles),
				isPartner = havePartnerRole(userRoles);
			
			if (isAdmin)
				return Parse.Promise.as(boutiqueRole);
			
			if (isPartner) {
				
				if (haveBoutiqueRole(userRoles, request.object.get('boutique').id))
					return Parse.Promise.as(boutiqueRole);
				
				else
					return Parse.Promise.error(new Parse.Error('Access denied'))
				
			} else
				return Parse.Promise.error(new Parse.Error('Access denied'))
			
		}
		
	).then(
		
		function (boutiqueRole) {
			
			var acl = defaultAcl(null, true, false, true, true, true, true);
			acl.setRoleReadAccess(partner, true);
			acl.setRoleWriteAccess(partner, true);
			request.object.setACL(acl);
			
			response.success();
			
		},
		function (error) {
			
			response.error(error.message);
			
		}
		
	);
	
});*/



////////////////////////////////////////////////////////////////////////////////
// BACKEND TODO


Parse.Cloud.define('adminConfig', function(request, response) {
	
	var config = {
		settings	: _.pick(app, 'config', 'enums'),
		user		: {},
		boutiques	: []
	};
	
	fetchUserRoles(request.user).then(
		
		function (userRoles) {
			
			config.user.roles = getBaseRole(userRoles);
			config.user.hasAdminRole = haveAdminRole(userRoles);
			config.user.hasPartnerRole = havePartnerRole(userRoles);
			
			var query = new Parse.Query('Boutique');
			query.exists('title');
			
			if (config.user.hasPartnerRole) {
				
				var boutiqueId = getBoutiqueFromRole(userRoles);
				
				if (_.isEmpty(boutiqueId))
					return Parse.Promise.as([]);
					
				query.containedIn('objectId', boutiqueId);
			
			} else if (!config.user.hasAdminRole)
				return Parse.Promise.as([]);
			
			query.ascending('title');
			query.limit(1000);
			return query.find();
			
		}
		
	).then(
		
		function (boutique) {
			
			config.boutiques = _.map(boutique, function (item) {return {id: item.id, text: (item.get('title') || {}).en};});
			
			response.success(config);
			
		},
		function (error) {
			response.error(error.message);
		}
		
	)
	
});


// adminBoutiqueSecurity - check if security enabled for boutique or enable/disable security
//Input:
//	id					: Id (required)			- Boutique Id
//	enabled				: Boolean (optional)	- Specify in order to enable/disable security
//Output:
//	enabled				: Boolean - is security enabled
//Exceptions:
//	Access denied
//	Boutique is not specified
//	Boutique is not available
//	Operation failed
Parse.Cloud.define('adminBoutiqueSecurity', function(request, response) {
	
	if (!(request.user instanceof Parse.User))
		return response.error('Access denied');
	
	if (!isParseId(request.params.id))
		return response.error('Boutique is not specified');
	
	var promises = [];
	
	promises.push(fetchUserRoles(request.user));
	promises.push(getBoutique(request.params.id));
	
	Parse.Promise.when(promises).then(
		
		function (result) {
			
			userRoles = result[0];
			boutique = result[1];
	
			if (haveAdminRole(userRoles))
				return fetchBoutiqueRole(boutique).then(
					
					function (role) {
						
						if (role instanceof Parse.Role) {
							
							if (request.params.enabled === false)
								return role.destroy({useMasterKey: true}).then(
									
									function () {
										return Parse.Promise.as(false);
									},
									function (error) {
										return Parse.Promise.error(new Parse.Error(null, 'Operation failed'));
									}
									
								);
							
							else
								return Parse.Promise.as(true);
							
						} else {
							
							if (request.params.enabled === true) {
							
								var role = new Parse.Role('partner_' + boutique.id, defaultAcl(null, true, false, true, true));
								role.set('boutique', boutique);
								return role.save(null, {useMasterKey: true}).then(
									
									function () {
										return Parse.Promise.as(true);
									},
									function (error) {
										return Parse.Promise.error(new Parse.Error(null, 'Operation failed'));
									}
									
								);
								
							} else
								return Parse.Promise.as(false);
							
						}
						
					}
				);
			
			else if (havePartnerRole(userRoles) && haveBoutiqueRole(userRoles, boutique))
				return fetchBoutiqueRole(boutique).then(
					
					function (role) {
						return Parse.Promise.as(role instanceof Parse.Role ? true : false);
					}
					
				);
			
			else
				return Parse.Promise.error(new Parse.Error(null, 'Access denied'));
			
		}
	
	).then(
		
		function (result) {
			response.success(result);
		},
		function (error) {
			response.error(error.message);
		}
		
	);
	
});


// adminBoutiqueSecurityUser - return user's related to boutique role or add/remove user's to boutique role
//Input:
//	id					: Id (required)			- Boutique Id
//	userToAdd			: String (optional)		- Specify user email in order to add user to boutique role
//	- or -
//	userToRemove		: String (optional)		- Specify user email in order to remove user from boutique role
//Output:
//	enabled				: Boolean - result
//Exceptions:
//	Access denied
//	Boutique is not specified
//	Boutique is not available
//	Boutique security is not enabled
//	User is not available
//	Operation failed
Parse.Cloud.define('adminBoutiqueSecurityUser', function(request, response) {
	
	if (!(request.user instanceof Parse.User))
		return response.error('Access denied');
	
	if (!isParseId(request.params.id))
		return response.error('Boutique is not specified');
	
	if (_.has(request.params, 'userToAdd') && _.has(request.params, 'userToRemove'))
		return response.error('Parameter is not valid');
	
	var username, op;
	
	if (_.has(request.params, 'userToAdd')) {
		
		op = 'add';
		
		if (_.isString(request.params.userToAdd))
			username = request.params.userToAdd;
		else
			return response.error('Parameter is not valid');	
		
	}
	
	if (_.has(request.params, 'userToRemove')) {
		
		op = 'remove';
		
		if (_.isString(request.params.userToRemove))
			username = request.params.userToRemove;
		else
			return response.error('Parameter is not valid');	
		
	}
		
	var promises = [];
	
	promises.push(fetchUserRoles(request.user));
	promises.push(getBoutique(request.params.id));
	
	Parse.Promise.when(promises).then(
		
		function (result) {
			
			userRoles = result[0];
			boutique = result[1];

			if (haveAdminRole(userRoles) || (havePartnerRole(userRoles) && haveBoutiqueRole(userRoles, boutique))) {
				
				var promises = [];
				
				promises.push(fetchPartnerRole(), fetchBoutiqueRole(boutique));
				
				return Parse.Promise.when(promises);
			
			} else
				return Parse.Promise.error(new Parse.Error(null, 'Access denied'));
		
		}
	
	).then(
		
		function (result) {
			
			partnerRole = result[0];
			boutiqueRole = result[1];

			if (!(boutiqueRole instanceof Parse.Role))
				return Parse.Promise.as(false);
			
			var partnerRelation = partnerRole.getUsers();
			var boutiqueRelation = boutiqueRole.getUsers();
			
			if (op && username) {
				
				return getUserByUsername(username).then(
					
					function (user) {
						
						return countBoutiqueRoleForUser(user).then(
							
							function (boutiqueRoleCount) {
								
								partnerRoleChanged = false;
								boutiqueRoleChanged = true;
								
								if (op === 'add') {
									
									if (boutiqueRoleCount <= 0) {
										
										partnerRelation.add(user);
										partnerRoleChanged = true;
										
									}
									
									boutiqueRelation.add(user);
									
								} else if (op === 'remove') {
									
									if (boutiqueRoleCount === 1) {
										
										partnerRelation.remove(user);
										partnerRoleChanged = true;
										
									}
									
									boutiqueRelation.remove(user);
									
								} else
									boutiqueRoleChanged = false;
								
								var promises = [];
								
								if (partnerRoleChanged === true)
									promises.push(partnerRole.save(null, {useMasterKey: true}));
								
								if (boutiqueRoleChanged === true)
									promises.push(boutiqueRole.save(null, {useMasterKey: true}));
								
								return Parse.Promise.when(promises).then(
									
									function () {
										return Parse.Promise.as(op === 'add' ? user : true);
									},
									function () {
										return Parse.Promise.error(new Parse.Error(null, 'Operation failed'));
									}
									
								);
								
							}
							
						);
						
					}
				
				);
				
			} else {
				
				var query = boutiqueRelation.query();
				query.limit(1000);
				return query.find();
				
			}
			
		}
	
	).then(
		
		function (result) {
			response.success(result);
		},
		function (error) {
			response.error(error.message);
		}
		
	);
	
});
	


////////////////////////////////////////////////////////////////////////////////
// Jobs


Parse.Cloud.job('uploadToAlgolia', function (request, status) {
	
	var
		items = [],
		objCount = 0,
		settings = {};
	
	var promise = Parse.Promise.as(false);
	
	if (request.params.className === 'Brand') {
		
		promise = promise.then(
			
			function () {
				
				// TODO Only brand which related to products
				
				settings = {
					attributesToIndex		: ['title', 'desc', 'detailDesc'],
					attributesForFaceting	: ['language'],
					attributeForDistinct	: 'objectId'
				};
				
				var query = new Parse.Query('Brand');
				query.equalTo('published', true);
				return query.each(
					
					function (obj) {
						
						var base = {
							objectId: obj.id
						};
						
						_.each(
							_.pluck(app.enums.language, 'code'),
							function (language) {
								
								var item = _.clone(base);
								
								item.objectID = obj.id + '/' + language;
								item.language = language;
								item.subject = app.getLocaleString(obj.get('subject'), app.config.DEFAULT_LANGUAGE)
								
								_.each(settings.attributesToIndex, function (attrName) {
									
									if (obj.has(attrName))
										item[attrName] = app.getLocaleString(obj.get(attrName), language);
									
								});
								
								items.push(item);
							
							}
						);
						
						objCount++;
						
						return Parse.Promise.as();
						
					}
					
				);
				
			}
			
		);
		
	} else if (request.params.className === 'Product') {
		
		promise = promise.then(
			
			function () {
				
				settings = {
					attributesToIndex		: ['title', 'desc', 'detailDesc'],
					attributesForFaceting	: ['language', 'availableCountry'],
					attributeForDistinct	: 'objectId'
				};
				
				var query = new Parse.Query('Product');
				query.equalTo('published', true);
				return query.each(
					
					function (obj) {
						
						var base = {
							objectId: obj.id
						};
						
						if (obj.has('availableCountry'))
							base.availableCountry = obj.get('availableCountry');
							
						_.each(
							_.pluck(app.enums.language, 'code'),
							function (language) {
								
								var item = _.clone(base);
								
								item.objectID = obj.id + '/' + language;
								item.language = language;
								item.subject = app.getLocaleString(obj.get('subject'), app.config.DEFAULT_LANGUAGE)
								
								_.each(settings.attributesToIndex, function (attrName) {
									
									if (obj.has(attrName))
										item[attrName] = app.getLocaleString(obj.get(attrName), language);
									
								});
								
								items.push(item);
							
							}
						);
						
						objCount++;
						
						return Parse.Promise.as();
						
					}
					
				);
				
			}
			
		);
		
	} else if (request.params.className === 'Boutique') {
		
		promise = promise.then(
			
			function () {
				
				settings = {
					attributesToIndex		: ['title', 'desc', 'detailDesc'],
					attributesForFaceting	: ['language'],
					attributeForDistinct	: 'objectId'
				};
				
				var query = new Parse.Query('Boutique');
				query.equalTo('published', true);
				return query.each(
					
					function (obj) {
						
						var base = {
							objectId: obj.id
						};
						
						_.each(
							_.pluck(app.enums.language, 'code'),
							function (language) {
								
								var item = _.clone(base);
								
								item.objectID = obj.id + '/' + language;
								item.language = language;
								item.subject = app.getLocaleString(obj.get('subject'), app.config.DEFAULT_LANGUAGE)
								
								_.each(settings.attributesToIndex, function (attrName) {
									
									if (obj.has(attrName))
										item[attrName] = app.getLocaleString(obj.get(attrName), language);
									
								});
								
								items.push(item);
							
							}
						);
						
						objCount++;
						
						return Parse.Promise.as();
						
					}
					
				);
				
			}
			
		);
		
	} else if (request.params.className === 'Interview') {
		
		promise = promise.then(
			
			function () {
				
				settings = {
					attributesToIndex		: ['header', 'subheader', 'desc', 'detailTitle', 'detailDesc'],
					attributesForFaceting	: ['language'],
					attributeForDistinct	: 'objectId'
				};
				
				var query = new Parse.Query('Interview');
				query.equalTo('published', true);
				return query.each(
					
					function (obj) {
						
						var base = {
							objectId: obj.id
						};
						
						_.each(
							_.pluck(app.enums.language, 'code'),
							function (language) {
								
								var item = _.clone(base);
								
								item.objectID = obj.id + '/' + language;
								item.language = language;
								item.subject = app.getLocaleString(obj.get('header'), app.config.DEFAULT_LANGUAGE)
								
								_.each(settings.attributesToIndex, function (attrName) {
									
									if (obj.has(attrName))
										item[attrName] = app.getLocaleString(obj.get(attrName), language);
									
								});
								
								items.push(item);
							
							}
						);
						
						objCount++;
						
						return Parse.Promise.as();
						
					}
					
				);
				
			}
			
		);
		
	} else if (request.params.className === 'Timeline') {
		
		promise = promise.then(
			
			function () {
				
				settings = {
					attributesToIndex		: ['desc'],
					attributesForFaceting	: ['language', 'availableCountry'],
					attributeForDistinct	: 'objectId'
				};
				
				var query = new Parse.Query('Interview');
				query.equalTo('published', true);
				return query.each(
					
					function (obj) {
						
						var base = {
							objectId: obj.id
						};
						
						if (obj.has('availableCountry'))
							base.availableCountry = obj.get('availableCountry');
						
						_.each(
							_.pluck(app.enums.language, 'code'),
							function (language) {
								
								var item = _.clone(base);
								
								item.objectID = obj.id + '/' + language;
								item.language = language;
								item.subject = app.getLocaleString(obj.get('header'), app.config.DEFAULT_LANGUAGE)
								
								_.each(settings.attributesToIndex, function (attrName) {
									
									if (obj.has(attrName))
										item[attrName] = app.getLocaleString(obj.get(attrName), language);
									
								});
								
								items.push(item);
							
							}
						);
						
						objCount++;
						
						return Parse.Promise.as();
						
					}
					
				);
				
			}
			
		);
		
	}
	
	promise.then(
		
		function (needUpload) {
			
			console.log('needUpload')
			console.log(needUpload)
			
			if (needUpload === false)
				return Parse.Promise.as();
			
			else
				return uploadToAlgolia(request.params.className, items, settings);
			
		}
		
	).then(
		
		function () {
			status.success(request.params.className + ' = ' + objCount + ' / ' + _.size(items));
		},
		function (error) {
			console.log(error);
			status.error(error.message);
		}
		
	);

});



////////////////////////////////////////////////////////////////////////////////
// Common functions


function uploadToAlgolia(indexName, items, settings) {
	
	var algolia = algoliasearch(ALGOLIA_APPLIATION_ID, ALGOLIA_API_KEY);
	
	var indexTmpSuffix = '_tmp';
	
	var index = algolia.initIndex(indexName + indexTmpSuffix);
	
	return Parse.Promise.as().then(
		
		function () {
			
			return index.setSettings(settings).then(
				
				null,
				function (error) {
					console.log(error)
					return Parse.Promise.error(new Parse.Error(null, 'Index setting failed'))
					
				}
				
			);
			
		}
		
	).then(
		
		function () {
			
			return index.addObjects(items).then(
				
				null,
				function (error) {
					console.log(error)
					return Parse.Promise.error(new Parse.Error(null, 'Add objects failed'))
					
				}
				
			);
			
		}
	
	).then(
		
		function (result) {
			
			return index.waitTask(result.taskID).then(
				
				null,
				function (error) {
					console.log(error)
					return Parse.Promise.error(new Parse.Error(null, 'Wait task failed'))
					
				}
				
			);
			
		}
		
	).then(
		
		function () {
			
			return algolia.moveIndex(indexName + indexTmpSuffix, indexName).then(
				
				null,
				function (error) {
					console.log(error)
					return Parse.Promise.error(new Parse.Error(null, 'Move index failed'))
					
				}
				
			)
			
		}
		
	);
	
}


function fetchUserRoles(user) {
	
	if (!(user instanceof Parse.User))
		return Parse.Promise.as([]);
	
	var query = new Parse.Query(Parse.Role);
	query.select(['name', 'boutique'])
	query.equalTo('users', user);
	return query.find({useMasterKey: true}).then(
		
		function (results) {
			return Parse.Promise.as(results);
		},
		function (error) {
			return Parse.Promise.as([]);
		}
		
	);
}


function haveAdminRole(roles) {
	return _.reduce(roles || [], function (memo, role) {return role.get('name') === ROLE_ADMIN ? true : memo;}, false);
}


function havePartnerRole(roles) {
	return _.reduce(roles || [], function (memo, role) {return role.get('name') === ROLE_PARTNER ? true : memo;}, false);
}


function haveBoutiqueRole(roles, boutique) {
	
	if (boutique instanceof Parse.Object)
		return _.reduce(roles || [], function (memo, role) {console.log(role.boutique);return role.get('boutique') && role.get('boutique').id === boutique.id ? true : memo;}, false);
	
	else if (isParseId(boutique))
		return _.reduce(roles || [], function (memo, role) {console.log(role.boutique);return role.get('boutique') && role.get('boutique').id === boutique ? true : memo;}, false);
	
	else
		return false;
	
}


function getBoutiqueFromRole(roles) {
	return _.chain(roles || []).filter(function (role) {console.log(role.boutique);return role.get('boutique');}).map(function (role) {return role.get('boutique').id;}).value();
}


function getBaseRole(roles) {
	return _.chain(roles || []).filter(function (role) {console.log(role.boutique);return !role.get('boutique');}).map(function (role) {return role.get('name');}).value();
}


function fetchPartnerRole() {
	
	var query = new Parse.Query(Parse.Role);
	query.equalTo('name', ROLE_PARTNER);
	return query.first({useMasterKey: true});
		
}


function fetchBoutiqueRole(boutique) {
	
	var query = new Parse.Query(Parse.Role);
	query.equalTo('boutique', boutique);
	return query.first({useMasterKey: true});
		
}


function countBoutiqueRoleForUser(user) {
	
	var query = new Parse.Query(Parse.Role);
	query.exists('boutique');
	query.equalTo('users', user);
	query.limit(2);
	return query.find({useMasterKey: true}).then(
		
		function (roles) {
			return _.size(roles);
		}
		
	);
		
}


function getBoutique(boutiqueId) {
	
	var query = new Parse.Query('Boutique');
	return query.get(boutiqueId).then(
		
		null,
		function () {
			return Parse.Promise.error(new Parse.Error(null, 'Boutique is not available'));
		}
	
	);
		
}


function getUserByUsername(username) {
	
	var query = new Parse.Query(Parse.User);
	query.equalTo('username', username);
	return query.first().then(
		
		function (user) {
			
			if (user instanceof Parse.User)
				return Parse.Promise.as(user);
			else
				return Parse.Promise.error(new Parse.Error(null, 'User is not available'));
				
		},
		function () {
			return Parse.Promise.error(new Parse.Error(null, 'User is not available'));
		}
	
	);
		
}


function isParseId(value) {
	return _.isString(value) && value.match(/^[A-Za-z0-9]{10}$/);
}


function defaultAcl(acl, publicRead, publicWrite, adminRead, adminWrite, partnerRead, partnerWrite) {
	
	var acl = acl instanceof Parse.ACL ? acl : new Parse.ACL();
	
	if (_.isBoolean(publicRead))
		acl.setPublicReadAccess(publicRead);
	
	if (_.isBoolean(publicWrite))
		acl.setPublicWriteAccess(publicWrite);
	
	if (_.isBoolean(adminRead))
		acl.setRoleReadAccess(ROLE_ADMIN, adminRead);
	
	if (_.isBoolean(adminWrite))
		acl.setRoleWriteAccess(ROLE_ADMIN, adminWrite);
	
	if (_.isBoolean(partnerRead))
		acl.setRoleReadAccess(ROLE_PARTNER, partnerRead);
	
	if (_.isBoolean(partnerWrite))
		acl.setRoleWriteAccess(ROLE_PARTNER, partnerWrite);
	
	return acl;
	
}