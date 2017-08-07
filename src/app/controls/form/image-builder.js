define([
	'jquery',
	'underscore',
	'parse'
], function (
	$, _, Parse
) {

	function ImageBuilder (file, content) {
    	
    	_.bindAll(this, 'make', 'run', 'process', 'processRaw');
    	
    	this.image = null;
    	
    	this.file = file;
    	this.content = content;
    	
    }
    
    
    ImageBuilder.prototype.make = function (variants) {
    	
    	if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ImageBuilder.prototype.make');
    	
    	var promise = new Parse.Promise();
    	
    	var self = this;
    	
    	this.image = new Image();
    	this.image.onload = function (ev) {

	    	promise.resolve(ev.target);
	    	
		};
		
    	return promise.then(
    		
    		function (image) {
    			
    			var promises = [];
    	
		    	_.each(variants, function (variant, key) {
		    		if (variant === true)
		    			promises.push(self.processRaw(image, key));
		    		else
		    			promises.push(self.process(image, key, variant.type, variant.size, variant.quality));
		    	})
    			
    			return Parse.Promise.when(promises);
    			
    		}
    		
		).then(
    				
			function () {
				
				self.image = null;
				
				return Parse.Promise.as(arguments); 
				
			}
			
		);
    	
    }
    
    
    ImageBuilder.prototype.run = function () {
    	
    	if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ImageBuilder.prototype.run');

    	this.image.src = this.content;
    	
    }
    
    
    ImageBuilder.prototype.process = function (image, name, type, resize, quality, options) {
    	
    	if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ImageBuilder.prototype.process');
			
		var canvas = $('<canvas>')[0],
			dataURL = '',
			buffer = null,
			original = {width: image.naturalWidth, height: image.naturalHeight, ratio: image.naturalWidth / image.naturalHeight},
			crop = {x: 0, y: 0, width: original.width, height: original.height};
		
		if (resize && (resize.width || resize.height)) {
  		
      		if (resize.width && resize.height) {
      			
      			var hscale = resize.width / original.width;
				var vscale = resize.height / original.height;
      			
      			if (resize.fill === true) {
      				
					if (_.isNumber(resize.crop) && 0 <= resize.crop && resize.crop <= 1) {
						
						resize.ratio = resize.width / resize.height;
      				
	      				if (resize.ratio <= original.ratio) {
	      					
	      					crop.width = original.height / resize.ratio;
	      					crop.x = (original.width - crop.width) * resize.crop;
	      					
	      				} else {
	      					
	      					crop.height = original.width / resize.ratio;
	      					crop.y = (original.height - crop.height) * resize.crop;
	      					 
	      				}
	      				
	      				canvas.width = resize.width;
		      			canvas.height = resize.height;
						
					} else {
						
						canvas.width = original.width * Math.max(hscale, vscale);
						canvas.height = original.height * Math.max(hscale, vscale);
						
					}
      				
      			} else {
      				
      				canvas.width = original.width * Math.min(hscale, vscale);
					canvas.height = original.height * Math.min(hscale, vscale);
      				
      			}
      			
      		} else if (resize.width) {
      			
      			var scale = resize.width / original.width;
      			canvas.width = resize.width;
      			canvas.height = original.height * scale;
      			
      			
      		} else if (resize.height) {
      			
      			var scale = resize.height / original.height;
      			canvas.width = original.width * scale;
      			canvas.height = resize.height;
      			
      		}
      		
      	} else {
      		
      		canvas.width = original.width;
      		canvas.height = original.height;
      		
      	}
      	
      	/*console.log(name);
      	console.log(original);
      	console.log(crop);
      	console.log({width: canvas.width, height: canvas.height});*/
      	
      	if (resize.bg === true) {
      		
      		var
      			bg = {
	      			lightColor	: '#eeeeee',
	      			darkColor	: '#999999',
	      			size		: 10
      			};
      		
      		var ctx = canvas.getContext('2d');
      		
			for(var x = 0; x <= Math.floor(canvas.width / bg.size); x++) {
				for(var y = 0; y <= Math.floor(canvas.height / bg.size); y++) {
					var
						xodd = x % 2 === 0,
						yodd = y % 2 === 0;
					ctx.fillStyle = (xodd || yodd) && !(xodd && yodd) ? bg.lightColor : bg.darkColor;
					ctx.fillRect(x * bg.size, y * bg.size, bg.size, bg.size);
				}
			}
			
		}
		
		canvas.getContext('2d').drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height);
		dataURL = canvas.toDataURL(type, quality);
		
		var self = this;
		
		return Parse.Promise.as().then(
			
			function () {
				
				if (content = String(dataURL).match(/^data:(image\/[A-Za-z]+);base64,(.+)$/)) {
					
					buffer = window.atob(content[2]);
			
					var file = new Parse.File(String(self.file.name).replace(/[^A-Za-z0-9_\.]+/g, '_'), {base64: content[2]});
					return file.save();
				
				} else
					return Parse.Promise.error();
					
			}
		
		).then(
			
			function (result) {
				return Parse.Promise.as({name: name, file: result, width: canvas.width, height: canvas.height, ratio: canvas.width / canvas.height, size: buffer.length});
			},
			function (error) {
				return Parse.Promise.error(new Parse.Error(null, 'Cannot prepare image "' + self.file.name));
			}
			
		);

	}
	
	
	ImageBuilder.prototype.processRaw = function (image, name) {
    	
    	if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ImageBuilder.prototype.processRaw');
			
		var buffer = null;
		
		var self = this;
		
		return Parse.Promise.as().then(
			
			function () {
				
				if (content = String(self.content).match(/^data:(image\/[A-Za-z]+);base64,(.+)$/)) {
					
					buffer = window.atob(content[2]);
			
					var file = new Parse.File(String(self.file.name).replace(/[^A-Za-z0-9_\.]+/g, '_'), {base64: content[2]});
					return file.save()
				
				} else
					return Parse.Promise.error();
				
			}
			
		).then(
			
			function (result) {
				return Parse.Promise.as({name: name, file: result, width: image.naturalWidth, height: image.naturalHeight, ratio: image.naturalWidth / image.naturalHeight, size: buffer.length});
			},
			function (error) {
				return Parse.Promise.error(new Parse.Error(null, 'Cannot prepare image "' + self.file.name));
			}
			
		);
			
	}
	
	
	return ImageBuilder;
	
});