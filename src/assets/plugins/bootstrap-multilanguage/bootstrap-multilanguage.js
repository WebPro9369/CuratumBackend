+ function($) {
	'use strict';

	// PUBLIC CLASS DEFINITION
	// ======================

	var BootstrapMultilanguage = function(element, options) {

		this.$element	= null;
		this.options	= null;

		this.init(element, options)

	}


	BootstrapMultilanguage.VERSION = '0.0.2';


	BootstrapMultilanguage.DEFAULTS = {
		languages					: [{code: 'en', title: 'English'}],
		language					: 'en',
		langListTagName				: 'ul',
		langItemTagName				: 'li',
		containerClassName			: 'ui-multilanguage-selector'
	}


	BootstrapMultilanguage.prototype.init = function(element, options) {
		
		this.$element		= $(element);
		this.options		= this.getOptions(options);
		this.$items			= {};
		
		this._language		= null;
		this._value			= {};
		
		this.build();

		if ($.validator) {
			
			$.validator.addMethod(
				'multilanguageDefaultRequired',
				function (value, element, params) {
					return $(element).bootstrapMultilanguage('validator', 'defaultRequired');
				},
				'Text for default language is required.'
			);
			
			$.validator.addMethod(
				'multilanguageAllRequired',
				function (value, element, params) {
					return $(element).bootstrapMultilanguage('validator', 'allRequired');
				},
				'Text for all languages is required.'
			);
			
		}
		
	}
	
	
	BootstrapMultilanguage.prototype.build = function() {
		
		var
			options = this.options,
			$element = this.$element,
			controlId = $element.attr('id'),
			$container;
		
		if (controlId && ($container = $element.siblings('label[for="' + controlId + '"]')) && $container.size() === 1) {
			
			$container.addClass(options.containerClassName);
			
			var $list = $('<' + options.langListTagName + '>');
			
			var self = this;
			
			$.each(options.languages, function (index, lang) {
				
				self.$items[lang.code] = $('<' + options.langItemTagName + '>')
					.data('lang', lang.code)
					.attr('title', lang.title)
					.html('<span>' + lang.code + '</span>')
					.on('click', $.proxy(self._select, self));
	
				$list.append(self.$items[lang.code]);

			});
			
			$container.append($list);
			
		}
		
		$element.on('change', $.proxy(this._update, this));
		
	}
	
	
	BootstrapMultilanguage.prototype._select = function(ev) {
		
		if (!ev)
			return;

		var
			$target = $(ev.currentTarget),
			data = $target.data();
		
		if (data && data.lang)
			this.select(data.lang);
		
	}
	
	
	BootstrapMultilanguage.prototype._update = function(ev) {
		
		if (!ev)
			return;
		
		var
			$target = $(ev.currentTarget),
			value;
		
		if (value = $target.val()) {
			
			this.$items[this._language].addClass('active');
			this._value[this._language] = value;
		
		} else {
			
			this.$items[this._language].removeClass('active');
			delete this._value[this._language];
		
		}
		
	}
	
	
	BootstrapMultilanguage.prototype.select = function(language) {
		
		var
			options = this.options,
			$element = this.$element;
		
		if (this._language !== language) {
			
			this._language = language;
			
			$element.val(this._value[language] || '');
			
			var self = this;
			
			$.each(options.languages, function (index, lang) {
				
				if (lang.code === language)
					self.$items[lang.code].addClass('selected');
				
				else
					self.$items[lang.code].removeClass('selected');
				
			});
		
		}
		
	}
	
	
	BootstrapMultilanguage.prototype.set = function(value) {
		
		this._value = value || {};
		
		this.reset();
		
		return this;

	}
	
	
	BootstrapMultilanguage.prototype.get = function() {
		
		return !$.isEmptyObject(this._value) ? this._value : null;

	}
	
	
	BootstrapMultilanguage.prototype.validator = function(name) {
		
		var
			options = this.options,
			$items = this.$items,
			result = true;
			
		if (name === 'defaultRequired') {
			
			result = this._value[options.language] ? true : false;
			
			if (result)
				$items[options.language].removeClass('invalid');
			else
				$items[options.language].addClass('invalid');
			
		} else if (name === 'allRequired') {
			
			var
				values = this._value;
			
			$.each(options.languages, function(key, lang) {
				
				if (!values[lang.code]) {
					
					$items[lang.code].addClass('invalid');
					result = false;
					
				} else
					$items[lang.code].removeClass('invalid');
				
			});
			
		}
		
		return result;

	}
	
	
	BootstrapMultilanguage.prototype.reset = function() {
		
		var
			options = this.options;
		
		this.select(options.language);
		
		this.$element.val(this._value[options.language] || '');
		
		var self = this;
		
		$.each(options.languages, function (index, lang) {
			
			if (self._value[lang.code])
				self.$items[lang.code].addClass('active');
			
			else
				self.$items[lang.code].removeClass('active');
			
		});

	}
	
	
	BootstrapMultilanguage.prototype.getDefaults = function() {
		
		return BootstrapMultilanguage.DEFAULTS;
		
	}
	

	BootstrapMultilanguage.prototype.getOptions = function(options) {
		
		return $.extend({}, this.getDefaults(), this.$element.data(), options);
		
	}


	// PLUGIN DEFINITION
	// ==========================

	function Plugin(option) {
		
		var
			args	= [].slice.call(arguments, 1),
        	result;
        
		this.each(function() {
			
			var $this = $(this);
			var data = $this.data('bs.bootstrapMultilanguage');
			var options = typeof option == 'object' && option;

			if (!data)
				$this.data('bs.bootstrapMultilanguage', ( data = new BootstrapMultilanguage(this, options)));
				
			if ( typeof option == 'string')
				result = data[option].apply(data, args);
				
		})
		
		return (typeof result !== 'undefined' ? (result === null ? undefined : result) : this);
		
	}

	var old = $.fn.bootstrapMultilanguage;

	$.fn.bootstrapMultilanguage = Plugin;
	$.fn.bootstrapMultilanguage.Constructor = BootstrapMultilanguage;

	// NO CONFLICT
	// =================

	$.fn.bootstrapMultilanguage.noConflict = function() {
		$.fn.bootstrapMultilanguage = old;
		return this;
	}
	
}(jQuery);
