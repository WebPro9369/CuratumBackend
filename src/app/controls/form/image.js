define([
    'underscore',
    'parse',
    
    'classes/image/collection',
    'classes/image/model',
    
    './image/form',
    './image/view',
    
    'controls/form/image-builder',
    
    'text!./image/list.html',
    
    'filedrop-iterate',
    'jquery-ui'
], function (
	_, Parse,
	ImageCollection, ImageModel,
	ImageForm, ImageView,
	ImageBuilderControl,
	listTemplate
) {
	
	const
		VIEW_ENTITY_TITLE	 	= 'Image',
		VIEW_DEBUG_BASE			= VIEW_ENTITY_TITLE.replace(/\s+/g, '') + 'List',
		VIEW_ELEMENT_BASE_ID	= VIEW_ENTITY_TITLE.replace(/\s+/g, '-').toLowerCase(),
		VIEW_LIST_EMPTY			= _.unpairs([
			[THEME_TYPE_TABLE	, '<tr><td colspan="4">No matching records found</td></tr>'],
			[THEME_TYPE_GALLERY	, '<div class="col-md-12"><div class="thumbnail"><div class="caption">No matching records found</div></div></div>'] 
		]);
	
	var view = Parse.View.extend({
	
		events : {},
		
		_disabled : null,
		
		
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW_DEBUG_BASE + '.initialize');
	
			_.bindAll(this, 'disable', 'enable', 'assign', 'sync', 'render', 'fetch', 'addImageModel', 'removeImageModel', 'resetImageCollection', 'updateImageCollection', 'apply', 'onImageStart', 'onImageProgress', 'onImageRead', 'onImageFinish');
			
			this._disabled = false;
			
			this.template = _.template(listTemplate);
			
			if (options.name)
				this.name = options.name;
			
			this.limit = options.limit > 0 ? options.limit : 1;

			this.variants = _.defaults(options.variants || {}, {
				thumb			: {type: 'image/png', size: {width: 250, height: 250, fill: true, crop: 0.5, bg: true}, quality: 0.7},
				original		: true
			});
			
			this.type = options.type === VIEW_TYPE_FORM ? VIEW_TYPE_FORM : VIEW_TYPE_FORM;
			
			this.multiple = options.multiple === true;
			this.nullable = options.nullable === true;
			this.sortable = options.sortable === true;
			
			this.collection = new ImageCollection;
			this.collection.bind('add', this.addImageModel);
			this.collection.bind('remove', this.removeImageModel);
			this.collection.bind('reset', this.resetImageCollection);
			
		},
		
		
		disable : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW_DEBUG_BASE + '.disable ' + this.name);
	
			this._disabled = true;
			
		},
		
		
		enable : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW_DEBUG_BASE + '.enable ' + this.name);
			
			this._disabled = false;
			
		},
		
		
		assign : function (model, options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW_DEBUG_BASE + '.assign ' + this.name);
			
			if (_.isObject(options)) {
				
				if (_.has(options, 'limit'))
					this.limit = options.limit;
				
				if (_.has(options, 'multiple'))
					this.multiple = options.multiple;
				
				if (_.has(options, 'nullable'))
					this.nullable = options.nullable;
				
				if (_.has(options, 'sortable'))
					this.sortable = options.sortable;
				
			}
			
			this.model = model;
			
			this.sync();
			
		},
		
		
		sync : function () {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW_DEBUG_BASE + '.sync ' + this.name);
			
			if (this.name && this.model.has(this.name)) {
				
				var value = this.model.get(this.name);
				
				this.collection.reset(_.isArray(value) ? value : [value]);
				
				
			} else
				this.collection.reset();
			
		},
		
		
		render : function() {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW_DEBUG_BASE + '.render');
	
			this.$el.html(this.template());
			
			if (this._disabled)
				return;
			
			this.$items = this.$('[role="items"]');
			
			this.$imageDropzone = this.$('[role="dropzone"]');
			
			if (this.type === VIEW_TYPE_FORM) {
				
				var self = this;
				
				this.imageDropzone = this.$imageDropzone.fileDropIterate({
					clickable: true,
					onFileList: function (iterator) {
						
						iterator.onStart = self.onImageStart;
						iterator.onProgress = self.onImageProgress;
						iterator.onRead = self.onImageRead;
						iterator.onFinish = self.onImageFinish;
						
						iterator.start();
						
					}
				});
				
				if (this.sortable) {
					
					this.$items.sortable({
						items: "> [data-id]"
					});
		    		//this.$items.disableSelection();
		    		
		    	}
			
			}
			
		},
		
		
		fetch : function () {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW_DEBUG_BASE + '.fetch');
			
			return Parse.Promise.as();
			
		},
		
		
		addImageModel : function(model) {
			
			var view;
			
			if (this.type === VIEW_TYPE_FORM)
				view = new ImageForm({});
			else
				view = new ImageView({});
			
			if (this.type === VIEW_TYPE_FORM)
				this.$imageDropzone.before(view.render().el);
			else
				this.$items.append(view.render().el);
			
			view.assign(model);
			
			if (this.type === VIEW_TYPE_FORM)
				this.updateImageCollection();
				
			
		},
		
		
		removeImageModel : function(model) {
			
			if (this.type === VIEW_TYPE_FORM)
				this.updateImageCollection();
				
		},
	
	
		resetImageCollection : function(collection, filter) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW_DEBUG_BASE + '.resetImageCollection');

			this.$items.find('> :not([role="dropzone"])').remove();
			this.collection.each(this.addImageModel);
			
			this.updateImageCollection();
			
		},
		
		
		updateImageCollection : function() {
			
			if ((this.type === VIEW_TYPE_FORM && this.collection.length < this.limit) || (this.type !== VIEW_TYPE_FORM && this.collection.length <= 0))
				this.$imageDropzone.show();
				
			else
				this.$imageDropzone.hide();
				
		},
		
		
		apply : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW_DEBUG_BASE + '.apply ' + this.name);
			
			if (this._disabled)
				return Parse.Promise.as();
			
			if (this.name) {
				
				//this.collection.apply();
				
				if (this.multiple) {
					
					var items = this.sortable ? this.collection.ordered(this.$items.sortable('toArray', {attribute: 'data-id'})) : this.collection.unordered();
					
					var before = _.map(this.model.get(this.name), function (item) {return item.id;});
					var after = _.map(items, function (item) {return item.id;});
					
					if (!_.isEmpty(after)) {
						
						if ((this.sortable === true && !_.isEqual(before, after)) || (this.sortable !== true && !_.isEqual(_.sortBy(before), _.sortBy(after))))
							this.model.set(this.name, items);
					
					} else if (this.model.has(this.name))
						this.model.unset(this.name);
					
				} else {
					
					if ((model = this.collection.first()) && (model instanceof Parse.Object)) {

						if (!this.model.has(this.name) || this.model.get(this.name).id !== model.id)
							this.model.set(this.name, model);
					
					} else if (this.model.has(this.name))
						this.model.unset(this.name);
					
				}
				
			}
			
			return Parse.Promise.as();
					
		},
		
		
		onImageStart : function (iterator) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW_DEBUG_BASE + '.onImageStart');
			
		},
		
		
		onImageProgress : function (iterator, file, progress) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW_DEBUG_BASE + '.onImageProgress');
			
		},
		
		
		onImageRead : function (iterator, file, content) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW_DEBUG_BASE + '.onImageRead');
			
			if (this.collection.length >= this.limit)
				return iterator.finish();
			
			if (_.contains(['image/jpeg', 'image/png', 'image/gif'], file.type)) {
				
				var self = this;
				
				var builder = new ImageBuilderControl(file, content);
			
				builder.make(this.variants).then(
					
					function (variants) {
						
						var model = new ImageModel();
						
						_.each(variants, function (variant) {
							
							this.set(model.getUrlAttrName(variant.name), variant.file);
							this.set(model.getPropAttrName(variant.name), _.pick(variant, 'width', 'height', 'ratio', 'size'));
							
						}, model);
						
						self.collection.add(model);
						
						iterator.next();
						
					},
					function (error) {
						
						app.view.alert(
							self.$el,
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
					this.$el,
					'danger',
					'Failed to add image',
					'Unsupported image type',
					false
				);
				
				iterator.next();
				
			}
			
		},
		
		
		onImageFinish : function (iterator) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW_DEBUG_BASE + '.onImageFinish');
			
		}
		
		
	});
	
	return view;

});