define([
    'jquery',
    'underscore',
    'parse',
    
    'collections/product-image',
    'models/product-image',
    
    'views/product/image/list/item',
    
    'views/image-builder',
    
    'text!templates/product/image/list.html',
    
    'filedrop-iterate',
    'jquery-ui'
], function (
	$, _, Parse,
	ProductImageCollection, ProductImageModel,
	ItemView,
	ImageBuilder,
	listTemplate
) {

	var view = Parse.View.extend({
	
		events : {},
		
		
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductImageListView.initialize');
	
			_.bindAll(this, 'render', 'order', 'addImageModel', 'removeImageModel', 'resetImageCollection', 'updateImageCollection', 'onImageStart', 'onImageProgress', 'onImageRead', 'onImageFinish');
	
			this.template = _.template(listTemplate);
			
			this.parent = options.parent || null;
			
			this.limit = options.limit > 0 ? options.limit : 1;
			
			this.type = options.type === 'form' ? 'form' : 'view';
			
			this.sortable = options.sortable === true;
			
			this.collection = new ProductImageCollection;
			this.collection.bind('add', this.addImageModel);
			this.collection.bind('remove', this.removeImageModel);
			this.collection.bind('reset', this.resetImageCollection);
			
		},
		
		
		render : function() {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductImageListView.render');
	
			this.$el.html(this.template());
			
			this.$items = this.$('[role="items"]');
			
			this.$imageDropzone = this.$('[role="dropzone"]');
			
			if (this.type === 'form') {
				
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
		    		this.$items.disableSelection();
		    		
		    	}
			
			}
			
		},
		
		
		order : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductImageListView.order');
			
			return this.type === 'form' && this.sortable ? this.$items.sortable('toArray', {attribute: 'data-id'}) : [];
			
		},
		
		
		addImageModel : function(model) {
			
			var view = new ItemView({model : model, type : this.type});
			
			if (this.type === 'form')
				this.$imageDropzone.before(view.render().el);
			else
				this.$items.append(view.render().el);
			
			if (this.type === 'form')
				this.updateImageCollection();
			
		},
		
		
		removeImageModel : function(model) {
			
			if (this.type === 'form')
				this.updateImageCollection();
				
		},
	
	
		resetImageCollection : function(collection, filter) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductImageListView.resetImageCollection');
	
			this.$items.find('> :not([role="dropzone"])').remove();
			this.collection.each(this.addImageModel);
			
			this.updateImageCollection();
			
		},
		
		
		updateImageCollection : function() {
			
			if ((this.type === 'form' && this.collection.length < this.limit) || (this.type !== 'form' && this.collection.length <= 0))
				this.$imageDropzone.show();
				
			else
				this.$imageDropzone.hide();
				
		},
		
		
		onImageStart : function (iterator) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductImageListView.onImageStart');
			
		},
		
		
		onImageProgress : function (iterator, file, progress) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductImageListView.onImageProgress');
			
		},
		
		
		onImageRead : function (iterator, file, content) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductImageListView.onImageRead');
			
			if (this.collection.length >= this.limit)
				iterator.finish();
			
			if (_.contains(['image/jpeg', 'image/png', 'image/gif'], file.type)) {
				
				var builder = new ImageBuilder(file, content);
			
				var self = this;
				
				builder.make({
					image	: {type: 'image/jpeg', quality: 0.9},
				}).then(
					
					function (variants) {
						
						var model = new ProductImageModel;
						
						_.each(variants, function (variant) {
							
							this.set(variant.name, variant.file);
							
						}, model);
						
						self.collection.add(model);
						
						iterator.next();
						
					},
					function (error) {
						
						app.view.alert(
							self.parent.$alertContainer || self.$el,
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
					this.parent.$alertContainer || this.$el,
					'danger',
					'Failed to add image',
					'Unsupported image type',
					false
				);
				
				iterator.next();
				
			}
			
		},
		
		
		onImageFinish : function (iterator) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('ProductImageListView.onImageFinish');
			
		}
		
		
	});
	
	return view;

});