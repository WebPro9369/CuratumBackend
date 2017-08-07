define([
	'jquery',
	'underscore',
	'parse',
	'noty',
	
	'classes/tag/model',
	'classes/timeline/model',
	
	'text!templates/app.html',
	'text!templates/app/menu.html',
	'text!templates/app/header.html',
	'text!templates/app/footer.html',
	'text!templates/app/403.html',
	'text!templates/app/500.html',
	'text!templates/app/noty.html',
	
	'bootstrap',
	'select2',
	'jquery.cookies',
	'mCustomScrollbar'
], function (
	$, _, Parse, noty,
	TagModel, TimelineModel,
	appTemplate, appMenuTemplate, appHeaderTemplate, appFooterTemplate, app403Template, app500Template, appNotyTemplate
) {
	
	var view = Parse.View.extend({
		
		el : 'body',
		
	
		initialize : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AppView.initialize');
			
			_.bindAll(this, 'render', 'renderMenu', 'renderHeader', 'renderFooter', 'render403', 'alert', 'prompt', 'updateMenu');
			
			this.template = _.template(appTemplate);
			this.templateMenu = _.template(appMenuTemplate);
			this.templateHeader = _.template(appHeaderTemplate);
			this.templateFooter = _.template(appFooterTemplate);
			this.templateNoty = _.template(appNotyTemplate);
			this.template403 = _.template(app403Template);
			this.template500 = _.template(app500Template);
			
		},
	
	
		render : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AppView.render');
			
			var self = this;
			
			this.$el.removeClass('account boxed separate-inputs').addClass('fixed-sidebar fixed-topbar theme-sdtl color-default').attr('data-page', '').html(this.template());
			
			this.$mainmenu = this.$('[role="mainmenu"]');
			this.$header = this.$('[role="header"]');
			this.$footer = this.$('[role="footer"]');
			this.$title = this.$('[role="page-title"]');
			this.$noty = this.$('[role="notification"]').children('.noty-container');
			
			this.$view = this.$('#body');
			
			this.$body = $('body');
			this.$logopanel = this.$('.logopanel');
			this.$topbar = this.$('.topbar');
			this.$sidebar = this.$('.sidebar');
			this.$sidebarInner = this.$('.sidebar-inner');
			this.$sidebarFooter = this.$('.sidebar-footer');
			
			this.renderMenu();
			this.renderHeader();
			this.renderFooter();
			
			this.$el.on('dragover', function (ev) {
				ev.stopPropagation();
				ev.preventDefault();
				return false;
			});
			
			this.$el.on('drop', function (ev) {
				ev.stopPropagation();
				ev.preventDefault();
				return false;
			});
			
			this.handleboxedLayout();
		
		    $('[data-toggle]').on('click', function(event) {
		        event.preventDefault();
		        var toggleLayout = $(this).data('toggle');
		        if (toggleLayout == 'sidebar-collapsed') self.collapsedSidebar();
		    });
		    
		    $(window).resize(function() {
			    setTimeout(function() {
			        self.handleboxedLayout();
			    }, 100);
			});
			
		},
		
		
		renderMenu : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AppView.renderMenu');
			
			this.destroySideScroll();
			
			var data = {
				TagType			: TagModel.prototype.enums('type'),
				TimelineType	: TimelineModel.prototype.enums('type')
			};
			
			this.$mainmenu.html(this.templateMenu(data));
			
			this.createSideScroll();
			
		},
		
		
		renderHeader : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AppView.renderHeader');
			
			this.$header.html(this.templateHeader());
			
			this.$boutique = this.$('[name="globalBoutique"]');
			this.$boutique.select2({data: app.boutiques, allowClear: app.user.hasAdminRole});//.attr('title', '');
			
		},
		
		
		renderFooter : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AppView.renderFooter');
			
			this.$footer.html(this.templateFooter());
			
		},

		
		setTitle : function (title) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AppView.setTitle');
			
			this.$title.html('<strong>' + (title || '') + '</strong>');
			
		},
		
		
		render403 : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AppView.render403');
			
			this.$view.html(this.template403());
			
		},
		
		
		render500 : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AppView.render403');
			
			this.$view.html(this.template500());
			
		},
		
		
		alert : function ($element, type, title, text, timeout) {
			
			var $container = ($element instanceof $) && ($noty = $element.closest('[role="notification"]').children('.noty-container')) && $noty.size() === 1 ? $noty : this.$noty;
			
			var n = $container.noty({
				text : this.templateNoty({type: type, title: title, text: text, prompt: false}),
				layout : 'top',
				theme : 'made',
				maxVisible : 10,
				animation : {
					open : 'animated fadeIn',
					close : 'animated fadeOut'
				},
				timeout: timeout
			});
			
			return n;
			
		},
		
		
		prompt : function ($element, type, title, text, buttons, callback, data) {
	
			var $container = ($element instanceof $) && ($noty = $element.closest('[role="notification"]').children('.noty-container')) && $noty.size() === 1 ? $noty : this.$noty;
			
			var n = $container.noty({
				text : this.templateNoty({type: type, title: title, text: text, prompt: true}),
				layout : 'top',
				theme : 'made',
				maxVisible : 10,
				animation : {
					open : 'animated fadeIn',
					close : 'animated fadeOut'
				},
				timeout: false,
				closeWith: ['button'],
				buttons: _.mapObject(
					buttons,
					function (button, result) {
						return {
							addClass: 'btn btn-' + button[0],
							text: button[1],
							onClick: function ($noty) {
								$noty.close();
								(button[2] ? button[2] : callback)(result, data);
							}
						};
					}
				)
			});
			
			return n;
			
		},
		
		
		updateMenu : function (route) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AppView.updateMenu');
			
			this.renderMenu();
			
			if (route) {
				this.$mainmenu.find('li[rel="' + route + '"]').addClass('active');
				this.$mainmenu.find('li[rel="' + route + '"]').parents('li').addClass('active opened');
			}
			
		},
		
		
		/* ==========================================================*/
		/* LAYOUTS API                                                */
		/* ========================================================= */
		
		handleboxedLayout : function () {
			
		    this.$logopanel.css('left', '').css('right', '');
		    this.$topbar.css('width', '');
		    this.$sidebar.css('margin-left', '').css('margin-right', '');
		    this.$sidebarFooter.css('left', '').css('right', '');

		},
		
		
		collapsedSidebar : function () {
			
		    if (this.$body.css('position') != 'relative') {
		        if (!this.$body.hasClass('sidebar-collapsed')) this.createCollapsedSidebar();
		        else this.removeCollapsedSidebar();
		    } else {
		        if (this.$body.hasClass('sidebar-show')) this.$body.removeClass('sidebar-show');
		        else this.$body.addClass('sidebar-show');
		    }
		    this.handleboxedLayout();
		},
		
		createCollapsedSidebar : function () {
			
		    this.$body.addClass('sidebar-collapsed');
		    $('.sidebar').css('width', '').resizable().resizable('destroy');
		    $('.nav-sidebar ul').attr('style', '');
		    $(this).addClass('menu-collapsed');
		    this.destroySideScroll();
		    $('#switch-sidebar').prop('checked');
		    $.cookie('sidebar-collapsed', 1);
		},
		
		
		removeCollapsedSidebar : function () {
			
		    this.$body.removeClass('sidebar-collapsed');
		    if (!this.$body.hasClass('submenu-hover')) $('.nav-sidebar li.active ul').css({
		        display: 'block'
		    });
		    $(this).removeClass('menu-collapsed');
		    if (this.$body.hasClass('sidebar-light') && !this.$body.hasClass('sidebar-fixed')) {
		        $('.sidebar').height('');
		    }
		    this.createSideScroll();
		    $.removeCookie('sidebar-collapsed');
		},
		

		createSideScroll : function () {
			
			if ($.fn.mCustomScrollbar) {
				
				this.destroySideScroll();
				
				if (!this.$body.hasClass('sidebar-collapsed') && !this.$body.hasClass('sidebar-collapsed') && !this.$body.hasClass('submenu-hover') && this.$body.hasClass('fixed-sidebar')) {
					
					this.$sidebarInner.mCustomScrollbar({
						scrollButtons: {
							enable: false
						},
						autoHideScrollbar: true,
						scrollInertia: 150,
						theme: 'light-thin',
						advanced: {
							updateOnContentResize: true
						}
					});
				
				}
			}
			
		},
		
		destroySideScroll : function () {

			if ($.fn.mCustomScrollbar)
				this.$sidebarInner.mCustomScrollbar('destroy');

		}
		
		/******************** END LAYOUT API  ************************/
		/* ========================================================= */
		
		
	});
	
	return view;

});