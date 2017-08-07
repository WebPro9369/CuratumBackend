define([
    'underscore',
    'parse',
    
    'controls/form/image-builder',
    
    'text!./image/control.html',
    
    'filedrop-iterate',
    'jquery-ui'
], function (
	_, Parse,
	ImageBuilderControl,
	controlTemplate
) {
	
	var view = Parse.View.extend({
	
		events : {
			'click [data-action="remove"]'			: 'doRemove'
		},
		
		
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ImageControl.initialize');
	
			_.bindAll(this, 'assign', 'render', 'fetch', 'apply', 'doRemove', 'onImageStart', 'onImageProgress', 'onImageRead', 'onImageFinish');
			
			this._image = undefined;
			this._prop = undefined;
			
			this.template = _.template(controlTemplate);
			
			this.name = options.name;
			
			this.parentView = options.parentView
			
			this.variants = {};
			
			if (_.contains(['image/jpeg', 'image/png', 'image/gif'], options.type)) {
				
				var variant = {
					type	: options.type
				};
				
				if (options.size)
					variant.size = options.size;
				
				if (options.quality)
					variant.quality = options.quality;
				
				this.variants.image = variant;
				
			} else if (options.type === true) {
				
				this.variants.image = true;
				
			} else
				throw 'Unsupported type';
			
			this.resetEventName = 'form.image.reset:' + this.name;
			
		},
		
		
		assign : function (model) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ImageControl.assign ' + this.name);
			
			if ((this.model instanceof Parse.Object) || (this.model instanceof Parse.User))
				this.model.unbind(this.resetEventName, this.render);
			
			if (!((model instanceof Parse.Object) || (model instanceof Parse.User)))
				throw 'model must be instance of Parse.Object';
			
			this.model = model;
			
			this.model.bind(this.resetEventName, this.render);
			
			this._image = this.model.get(this.name);
			
			this.model.trigger(this.resetEventName);
			
		},
		
		
		render : function() {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ImageControl.render');
			
			this.$el.html(this.template({image: this._image}));
			
			if (_.isUndefined(this._image)) {
			
				var self = this;
				
				this.dropzone = this.$('[role="dropzone"]').fileDropIterate({
					clickable: true,
					onFileList: function (iterator) {
						
						iterator.onStart = self.onImageStart;
						iterator.onProgress = self.onImageProgress;
						iterator.onRead = self.onImageRead;
						iterator.onFinish = self.onImageFinish;
						
						iterator.start();
						
					}
				});
			
			}
			
		},
		
		
		fetch : function () {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ImageControl.fetch');
			
			return Parse.Promise.as();
			
		},
		
		
		apply : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ImageControl.apply ' + this.name);
			
			var before = this.model.has(this.name) ? this.model.get(this.name).url() : null;
			var after = this._image instanceof Parse.File ? this._image.url() : null;
			
			if (after && after !== before) {
				
				this.model.set(this.name, this._image);
				
				if (this.options.nameProp && !_.isUndefined(this._prop) && _.isObject(this._prop) && !_.isEmpty(this._prop))
					this.model.set(this.options.nameProp, this._prop);
			
			} else if (!after && before) {
				
				this.model.unset(this.name);
				
				if (this.options.nameProp)
					this.model.unset(this.options.nameProp);
				
			}
			
			return Parse.Promise.as();
					
		},
		
		
		doRemove : function(ev) {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ImageControl.doRemove');
			
			if (this._image) {
				this._image = undefined;
				this._prop = undefined;
				this.model.trigger(this.resetEventName);
			}
			
			return false;
			
		},
		
		
		onImageStart : function (iterator) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ImageControl.onImageStart');
			
		},
		
		
		onImageProgress : function (iterator, file, progress) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ImageControl.onImageProgress');
			
		},
		
		
		onImageRead : function (iterator, file, content) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ImageControl.onImageRead');
			
			if (!_.isEmpty(this._image))
				iterator.finish();
			
			if (_.contains(['image/jpeg', 'image/png', 'image/gif'], file.type)) {
				
				var self = this;
				
				var builder = new ImageBuilderControl(file, content);
			
				builder.make(this.variants).then(
					
					function (variants) {
						
						if (variant = _.findWhere(variants, {name: 'image'})) {
							
							self._image = variant.file;
							self._prop = _.pick(variant, 'width', 'height', 'ratio', 'size');
							self.model.trigger(self.resetEventName);
							
						}
						
						iterator.next();
						
					},
					function (error) {
						
						app.view.alert(
							(_.has(self.options, 'parentView') ? self.options.parentView.$alertContainer : null) || self.$el,
							'danger',
							'Failed to upload image',
							error.message,
							false
						);
						
						iterator.next();
						
					}
					
				);

				builder.run();
				
			} else {
				
				app.view.alert(
					(_.has(this.options, 'parentView') ? this.options.parentView.$alertContainer : null) || this.$el,
					'danger',
					'Failed to add image',
					'Unsupported image type',
					false
				);
				
				iterator.next();
				
			}
			
		},
		
		
		onImageFinish : function (iterator) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ImageControl.onImageFinish');
			
		}
		
		
	});
	
	return view;

});