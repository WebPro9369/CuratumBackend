define([
    'parse',
    'views/app',
    'views/dashboard',
    
    /*'views/order/list',*/
    
    'views/boutique/list',
    
    'views/brand/list',
    
    'views/tag/list',
    
    'views/interview/list',
    
    'views/timeline/list',
    
    'views/product/list',
    'views/product-category/list',
    'views/product-unit-type/list',
    'views/product-map/list',
    'views/product-schedule/list',
    
    'views/user/list',
    
    'views/signup',
    'views/login',
    
    'text!templates/app/500.html',
], function(
		Parse, AppView, DashboardView,
		/*OrderList,*/
		BoutiqueList,
		BrandList,
		TagList,
		InterviewList,
		TimelineList,
		ProductList, ProductCategoryList, ProductUnitTypeList, ProductMapList, ProductScheduleList,
		UserList,
		SignupView, LoginView,
		app500Template
	) {

	var router = Parse.Router.extend({
	
		context : '#body',
	
		routes : {
			''								: 'dashboardView',
			
			'order/'						: 'orderList',
			
			'boutique/'						: 'boutiqueList',
			
			'brand/'						: 'brandList',
			
			'interview/'					: 'interviewList',
			
			'timeline/'						: 'timelineList',
			
			'product/'						: 'productList',
			'product-category/'				: 'productCategoryList',
			'product-unit-type/'			: 'productUnitTypeList',
			'product-map/'					: 'productMapList',
			'product-schedule/'				: 'productScheduleList',
			
			'tag/'							: 'tagList',
			
			'user/'							: 'userList',
			
			'signup'						: 'signupForm',
			
			'login'							: 'loginForm',
			'logout'						: 'logoutForm'
		},
		
		view : null,
	
	
		initialize : function() {
			
			_.bindAll(this, 'assign');
			
			this.template500 = _.template(app500Template);
			
		},
		
		
		assign : function(View, options, isAppView, needAuth, restrictRole, callback) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AppRouter.assign');
			
			var self = this;
			
			if (app.view && app.view.body) {
				app.view.body.undelegateEvents();
				app.view.body = null;
			}
			
			if (app.view && !isAppView) {
				app.view.undelegateEvents();
				app.view = null;
			}
			
			$(this.context).html('');
			
			if (needAuth == true && !Parse.User.current()) {
				this.navigate("login", true);
				return null;
			}
			
			var promise = new Parse.Promise.as();
			
			if (_.isNull(app.settings) || _.isNull(app.user) || _.isNull(app.boutiques)) {
				
				promise = promise.then(
					
					function () {
						
						return Parse.Cloud.run('adminConfig');
						
					}
				
				).then(
					
					function (config) {
						
						app.settings = config.settings;
						app.user = config.user;
						app.boutiques = config.boutiques;
						
					}
					
				);
				
			}
			
			if (isAppView && !app.view) {
				
				promise = promise.then(
					
					function () {
						app.view = new AppView();
						app.view.render();
						$('body').removeClass('error-page');
						return Parse.Promise.as();
					}
					
				);
				
			}
			
			promise = promise.then(
				
				function () {
						
					if (restrictRole && _.isEmpty(_.intersection(app.user.roles, restrictRole))) {
						
						app.view.render403();
						app.view.setTitle('Access denied');
						app.view.updateMenu();
						
						return;
						
					}
						
					var view = new View(options);
					
					if (isAppView) {
						app.view.setTitle(view.title);
						app.view.updateMenu(view.route);
					}
					
					if (isAppView)
						app.view.body = view;

					if (callback) {
						callback = _.bind(callback, view);
						callback();
					}
					
				},
				function (error) {
					
					console.error(error);
					console.error(error.message);
					
					if (app.view)
						app.view.render500();
					else
						$('body').html(self.template500()).addClass('error-page');
					
					//app.view.render500();
					
					//self.logoutForm();
					
				}
			
			);
			
		},

	
		dashboardView : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AppRouter.dashboardView');
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(arguments);
			
			this.assign(
				DashboardView,
				{},
				true,
				true,
				null,
				function () {
					this.render();
				}
			);
			
		},
		
		
		orderList : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AppRouter.orderList');
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(arguments);
			
			this.assign(
				OrderList,
				{},
				true,
				true,
				[ROLE_ADMIN, ROLE_PARTNER],
				function () {
					this.render();
					this.fetch();
				}
			);
			
		},
		
		
		boutiqueList : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AppRouter.boutiqueList');
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(arguments);
			
			this.assign(
				BoutiqueList,
				{},
				true,
				true,
				[ROLE_ADMIN],
				function () {
					this.render();
					this.fetch();
				}
			);
			
		},
		
		
		brandList : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AppRouter.brandList');
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(arguments);
			
			this.assign(
				BrandList,
				{},
				true,
				true,
				[ROLE_ADMIN],
				function () {
					this.render();
					this.fetch();
				}
			);
			
		},
		
		
		interviewList : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AppRouter.interviewList');
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(arguments);
			
			this.assign(
				InterviewList,
				{},
				true,
				true,
				[ROLE_ADMIN],
				function () {
					this.render();
					this.fetch();
				}
			);
			
		},
		
		
		timelineList : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AppRouter.timelineList');
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(arguments);
			
			this.assign(
				TimelineList,
				{},
				true,
				true,
				[ROLE_ADMIN],
				function () {
					this.render();
					this.fetch();
				}
			);
			
		},
		
		
		productList : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AppRouter.productList');
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(arguments);
			
			this.assign(
				ProductList,
				{},
				true,
				true,
				[ROLE_ADMIN, ROLE_PARTNER],
				function () {
					this.render();
					this.fetch();
				}
			);
			
		},
		
		
		productCategoryList : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AppRouter.productCategoryList');
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(arguments);
			
			this.assign(
				ProductCategoryList,
				{},
				true,
				true,
				[ROLE_ADMIN, ROLE_PARTNER],
				function () {
					this.render();
					this.fetch();
				}
			);
			
		},
		
		
		productUnitTypeList : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AppRouter.productUnitTypeList');
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(arguments);
			
			this.assign(
				ProductUnitTypeList,
				{},
				true,
				true,
				[ROLE_ADMIN, ROLE_PARTNER],
				function () {
					this.render();
					this.fetch();
				}
			);
			
		},
		
		
		productMapList : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AppRouter.productMapList');
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(arguments);
			
			this.assign(
				ProductMapList,
				{},
				true,
				true,
				[ROLE_ADMIN, ROLE_PARTNER],
				function () {
					this.render();
					this.fetch();
				}
			);
			
		},
		
		
		productScheduleList : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AppRouter.productScheduleList');
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(arguments);
			
			this.assign(
				ProductScheduleList,
				{},
				true,
				true,
				[ROLE_ADMIN, ROLE_PARTNER],
				function () {
					this.render();
					this.fetch();
				}
			);
			
		},
		
		
		tagList : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AppRouter.tagList');
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(arguments);
			
			this.assign(
				TagList,
				{},
				true,
				true,
				[ROLE_ADMIN, ROLE_PARTNER],
				function () {
					this.render();
					this.fetch();
				}
			);
			
		},
		
		
		userList : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AppRouter.userList');
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(arguments);
			
			this.assign(
				UserList,
				{},
				true,
				true,
				[ROLE_ADMIN, ROLE_PARTNER],
				function () {
					this.render();
					this.fetch();
				}
			);
			
		},
		
		
		signupForm : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AppRouter.signupForm');
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(arguments);
			
			this.assign(
				SignupView,
				{},
				false,
				false,
				null,
				function () {
					this.render();
				}
			);
			
		},
		
		
		loginForm : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AppRouter.loginForm');
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(arguments);
			
			this.assign(
				LoginView,
				{},
				false,
				false,
				null,
				function () {
					this.render();
				}
			);
			
		},
	
	
		logoutForm : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AppRouter.logoutForm');
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(arguments);
			
			if (app.view && app.view.body) app.view.body.undelegateEvents();
			
			Parse.User.logOut();
			
			app.settings = null;
			app.user = null;
			app.boutiques = null;
			
			this.navigate('login', true);
			
		}
		
	});
	
	return router;

});