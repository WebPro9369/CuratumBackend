+ function($) {
	'use strict';

	// PUBLIC CLASS DEFINITION
	// ======================

	var BootstrapCurrency = function(element, options) {

		this.$element	= null;
		this.options	= null;

		this.init(element, options)

	}


	BootstrapCurrency.VERSION = '0.0.2';


	BootstrapCurrency.DEFAULTS = {
		currencies					: [{code: 'usd', title: 'United States Dollar'}],
		currency					: 'usd',
		currListTagName				: 'ul',
		currItemTagName				: 'li',
		containerClassName			: 'ui-currency-selector'
	}


	BootstrapCurrency.prototype.init = function(element, options) {
		
		this.$element		= $(element);
		this.options		= this.getOptions(options);
		this.$items			= {};
		
		this._currency		= null;
		this._value			= {};
		
		this.build();

		if ($.validator) {
			
			$.validator.addMethod(
				'currencyDefaultRequired',
				function (value, element, params) {
					return $(element).bootstrapCurrency('validator', 'defaultRequired');
				},
				'Value for default currency is required.'
			);
			
			$.validator.addMethod(
				'currencyAllRequired',
				function (value, element, params) {
					return $(element).bootstrapCurrency('validator', 'allRequired');
				},
				'Value for all currencies is required.'
			);
			
			$.validator.addMethod(
				'currencyNumber',
				function (value, element, params) {
					return $(element).bootstrapCurrency('validator', 'number');
				},
				'Please enter a valid number.'
			);
			
		}
	}
	
	
	BootstrapCurrency.prototype.build = function() {
		
		var
			options = this.options,
			$element = this.$element,
			controlId = $element.attr('id'),
			$container;
		
		if (controlId && ($container = $element.siblings('label[for="' + controlId + '"]')) && $container.size() === 1) {
			
			$container.addClass(options.containerClassName);
			
			var $list = $('<' + options.currListTagName + '>');
			
			var self = this;
			
			$.each(options.currencies, function (index, curr) {
				
				self.$items[curr.code] = $('<' + options.currItemTagName + '>')
					.data('curr', curr.code)
					.attr('title', curr.title)
					.html('<span>' + curr.code + '</span>')
					.on('click', $.proxy(self._select, self));
	
				$list.append(self.$items[curr.code]);

			});
			
			$container.append($list);
			
		}
		
		$element.on('change', $.proxy(this._update, this));
		
	}
	
	
	BootstrapCurrency.prototype._select = function(ev) {
		
		if (!ev)
			return;

		var
			$target = $(ev.currentTarget),
			data = $target.data();
		
		if (data && data.curr)
			this.select(data.curr);
		
	}
	
	
	BootstrapCurrency.prototype._update = function(ev) {
		
		if (!ev)
			return;
		
		var
			$target = $(ev.currentTarget),
			value;
		
		if (value = $target.val()) {
			
			this.$items[this._currency].addClass('active');
			this._value[this._currency] = value;
		
		} else {
			
			this.$items[this._currency].removeClass('active');
			delete this._value[this._currency];
		
		}
		
	}
	
	
	BootstrapCurrency.prototype.select = function(currency) {
		
		var
			options = this.options,
			$element = this.$element;
		
		if (this._currency !== currency) {
			
			this._currency = currency;
			
			$element.val(this._value[currency] || '');
			
			var self = this;
			
			$.each(options.currencies, function (index, curr) {
				
				if (curr.code === currency)
					self.$items[curr.code].addClass('selected');
				
				else
					self.$items[curr.code].removeClass('selected');
				
			});
			
		}
		
	}
	
	
	BootstrapCurrency.prototype.set = function(value) {
		
		this._value = value || {};
		
		this.reset();
		
		return this;

	}
	
	
	BootstrapCurrency.prototype.get = function() {
		
		if ($.isEmptyObject(this._value))
			return null;
		
		var result = {};
		
		$.each(this._value, function(key, value) {
			var val = Number(value);
			if (isFinite(val) && !isNaN(val))
				result[key] = val;
		});
		
		if ($.isEmptyObject(result))
			return null;
		
		return result;

	}
	
	
	BootstrapCurrency.prototype.validator = function(name) {
		
		var
			options = this.options,
			$items = this.$items,
			result = true;
			
		if (name === 'defaultRequired') {
			
			result = this._value[options.currency] ? true : false;
			
			if (result)
				$items[options.currency].removeClass('invalid');
			else
				$items[options.currency].addClass('invalid');
		
		} else if (name === 'allRequired') {
			
			var
				values = this._value;
			
			$.each(options.currencies, function(key, curr) {
				
				if (!values[curr.code]) {
					
					$items[curr.code].addClass('invalid');
					result = false;
					
				} else
					$items[curr.code].removeClass('invalid');
				
			});
			
		} else if (name === 'number') {
			
			var
				values = this._value;
			
			$.each(this._value, function(key, value) {
				
				var val = Number(value);
				
				if (!(isFinite(val) && !isNaN(val))) {
					
					$items[key].addClass('invalid');
					result = false;
					
				} else
					$items[key].removeClass('invalid');
					
			});
			
			$.each(options.currencies, function(key, curr) {
				
				if (!values[curr.code])
					$items[curr.code].removeClass('invalid');
				
			});
			
		}
		
		return result;

	}
	
	
	BootstrapCurrency.prototype.reset = function() {
		
		var
			options = this.options;
		
		this.select(options.currency);
		
		this.$element.val(this._value[options.currency] || '');
		
		var self = this;
		
		$.each(options.currencies, function (index, curr) {
			
			if (self._value[curr.code])
				self.$items[curr.code].addClass('active');
			
			else
				self.$items[curr.code].removeClass('active');
			
		});

	}
	
	
	BootstrapCurrency.prototype.getDefaults = function() {
		
		return BootstrapCurrency.DEFAULTS;
		
	}
	

	BootstrapCurrency.prototype.getOptions = function(options) {
		
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
			var data = $this.data('bs.bootstrapCurrency');
			var options = typeof option == 'object' && option;

			if (!data)
				$this.data('bs.bootstrapCurrency', ( data = new BootstrapCurrency(this, options)));
				
			if ( typeof option == 'string')
				result = data[option].apply(data, args);
				
		})
		
		return (typeof result !== 'undefined' ? (result === null ? undefined : result) : this);
		
	}

	var old = $.fn.bootstrapCurrency;

	$.fn.bootstrapCurrency = Plugin;
	$.fn.bootstrapCurrency.Constructor = BootstrapCurrency;

	// NO CONFLICT
	// =================

	$.fn.bootstrapCurrency.noConflict = function() {
		$.fn.bootstrapCurrency = old;
		return this;
	}
	
}(jQuery);
