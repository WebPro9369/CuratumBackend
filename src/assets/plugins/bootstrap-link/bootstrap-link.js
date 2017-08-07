+ function($) {
	'use strict';

	// PUBLIC CLASS DEFINITION
	// ======================

	var BootstrapLink = function(element, options) {

		this.$element	= null;
		this.options	= null;

		this.init(element, options)

	}


	BootstrapLink.VERSION = '0.0.2';


	BootstrapLink.DEFAULTS = {
		attributes					: [{code: 'url', title: 'URL'}, {code: 'title', title: 'Title'},],
		attribute					: 'url',
		attrListTagName				: 'ul',
		attrItemTagName				: 'li',
		containerClassName			: 'ui-link-selector'
	}


	BootstrapLink.prototype.init = function(element, options) {
		
		this.$element		= $(element);
		this.options		= this.getOptions(options);
		this.$items			= {};
		
		this._attribute		= null;
		this._value			= {};
		
		this.build();
		
		if ($.validator)
			$.validator.addMethod(
				'linkRequired',
				function (value, element, params) {
					return $(element).bootstrapLink('validator', 'required');
				},
				'This field is required.'
			);
		
	}
	
	
	BootstrapLink.prototype.build = function() {
		
		var
			options = this.options,
			$element = this.$element,
			controlId = $element.attr('id'),
			$container;
		
		if (controlId && ($container = $element.siblings('label[for="' + controlId + '"]')) && $container.size() === 1) {
			
			$container.addClass(options.containerClassName);
			
			var $list = $('<' + options.attrListTagName + '>');
			
			var self = this;
			
			$.each(options.attributes, function (index, attr) {
				
				self.$items[attr.code] = $('<' + options.attrItemTagName + '>')
					.data('attr', attr.code)
					.attr('title', attr.title)
					.html('<span>' + attr.code + '</span>')
					.on('click', $.proxy(self._select, self));
	
				$list.append(self.$items[attr.code]);

			});
			
			$container.append($list);
			
		}
		
		$element.on('change', $.proxy(this._update, this));
		
	}
	
	
	BootstrapLink.prototype._select = function(ev) {
		
		if (!ev)
			return;

		var
			$target = $(ev.currentTarget),
			data = $target.data();
		
		if (data && data.attr)
			this.select(data.attr);
		
	}
	
	
	BootstrapLink.prototype._update = function(ev) {
		
		if (!ev)
			return;
		
		var
			$target = $(ev.currentTarget),
			value;
		
		if (value = $target.val()) {
			
			this.$items[this._attribute].addClass('active');
			this._value[this._attribute] = value;
		
		} else {
			
			this.$items[this._attribute].removeClass('active');
			delete this._value[this._attribute];
		
		}
		
	}
	
	
	BootstrapLink.prototype.select = function(attribute) {
		
		var
			options = this.options,
			$element = this.$element;
		
		if (this._attribute !== attribute) {
			
			this._attribute = attribute;
			
			$element.val(this._value[attribute] || '');
			
			var self = this;
			
			$.each(options.attributes, function (index, attr) {
				
				if (attr.code === attribute)
					self.$items[attr.code].addClass('selected');
				
				else
					self.$items[attr.code].removeClass('selected');
				
			});
		
		}
		
	}
	
	
	BootstrapLink.prototype.set = function(value) {
		
		this._value = value || {};
		
		this.reset();
		
		return this;

	}
	
	
	BootstrapLink.prototype.get = function() {
		
		return !$.isEmptyObject(this._value) ? this._value : null;

	}
	
	
	BootstrapLink.prototype.validator = function(name, params) {
		
		var
			options = this.options,
			$items = this.$items,
			result = true;
		
		if (name === 'required') {
			
			result = this._value[options.attribute] ? true : false;
			
			if (result)
				$items[options.attribute].removeClass('invalid');
			else
				$items[options.attribute].addClass('invalid');
			
		}
		
		return result;

	}
	
	
	BootstrapLink.prototype.reset = function() {
		
		var
			options = this.options;
		
		this.select(options.attribute);
		
		this.$element.val(this._value[options.attribute] || '');
		
		var self = this;
		
		$.each(options.attributes, function (index, attr) {
			
			if (self._value[attr.code])
				self.$items[attr.code].addClass('active');
			
			else
				self.$items[attr.code].removeClass('active');
			
		});

	}
	
	
	BootstrapLink.prototype.getDefaults = function() {
		
		return BootstrapLink.DEFAULTS;
		
	}
	

	BootstrapLink.prototype.getOptions = function(options) {
		
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
			var data = $this.data('bs.bootstrapLink');
			var options = typeof option == 'object' && option;

			if (!data)
				$this.data('bs.bootstrapLink', ( data = new BootstrapLink(this, options)));
				
			if ( typeof option == 'string')
				result = data[option].apply(data, args);
				
		})
		
		return (typeof result !== 'undefined' ? (result === null ? undefined : result) : this);
		
	}

	var old = $.fn.bootstrapLink;

	$.fn.bootstrapLink = Plugin;
	$.fn.bootstrapLink.Constructor = BootstrapLink;

	// NO CONFLICT
	// =================

	$.fn.bootstrapLink.noConflict = function() {
		$.fn.bootstrapLink = old;
		return this;
	}
	
}(jQuery);
