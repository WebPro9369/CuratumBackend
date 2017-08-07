/*
AssignmentFormControl

name			: String (required) 			- Assigned attribute
CollectionLeft	: Parse.Collection (required)	- Datasource left collection prototype
ModelLeft		: Parse.Object (required)		- Datasource left model prototype
CollectionRight	: Parse.Collection (required)	- Datasource right collection prototype
ModelRight		: Parse.Object (required)		- Datasource right model prototype
datasourceLeft	: String						- Datasource left attribute name
datasourceRight	: String						- Datasource right attribute name
multiple		: Boolean (default = false)		- True if you allow multiple selection
beforeFetchLeft	: Function						- Before fetch callback with left datasource query parameter
beforeFetchRight: Function						- Before fetch callback with right datasource query parameter

*/

define([
	'underscore',
	'parse',
	
	'text!./assignment/control.html',
	'text!./assignment/item-left.html',
	'text!./assignment/item-right.html',
	
    'jquery-ui',
	'mCustomScrollbar'
], function(
	_, Parse,
	controlTemplate, leftTemplate, rightTemplate
) {
	
	var view = Parse.View.extend({

		events : {
			'click [data-action="clean"][data-id]'	: 'doClean'
		},
		

		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AssignmentFormControl.initialize');
			
			_.bindAll(this, 'fetch', 'render', 'assign', 'sync', 'get', 'set', 'unset', 'build', 'apply', 'buildLeft', 'buildRight', 'doClean');
			
			this.dictionaryLeft = null;
			this.dictionaryRight = null;
			
			this.templateControl = _.template(controlTemplate);
			this.templateLeft = _.template(leftTemplate);
			this.templateRight = _.template(rightTemplate);
			
			if (options.name)
				this.name = options.name;
				
			if (options.CollectionLeft && (options.CollectionLeft.prototype instanceof Parse.Collection))
				this.CollectionLeft = options.CollectionLeft
			else
				throw 'CollectionLeft must be instance of Parse.Collection';
				
			if (options.ModelLeft && (options.ModelLeft.prototype instanceof Parse.Object))
				this.ModelLeft = options.ModelLeft;
			else
				throw 'ModelLeft must be instance of Parse.Object';
			
			if (options.CollectionRight && (options.CollectionRight.prototype instanceof Parse.Collection))
				this.CollectionRight = options.CollectionRight
			else
				throw 'CollectionRight must be instance of Parse.Collection';
				
			if (options.ModelRight && (options.ModelRight.prototype instanceof Parse.Object))
				this.ModelRight = options.ModelRight;
			else
				throw 'ModelRight must be instance of Parse.Object';
				
			this.dictionaryLeft = new (this.CollectionLeft);
			this.dictionaryLeft.query = new Parse.Query(this.ModelLeft);
			
			this.dictionaryRight = new (this.CollectionRight);
			this.dictionaryRight.query = new Parse.Query(this.ModelRight);
			
			this.multiple = options.multiple === true;
			
			this._value = {};
			
			this.datasourceLeft = options.datasourceLeft || '';
			this.datasourceRight = options.datasourceRight || '';
			
			this.dictionaryLeft.bind('reset', this.buildLeft);
			
			this.dictionaryRight.bind('reset', this.buildRight);
			
			if ((this.model instanceof Parse.Object) || (this.model instanceof Parse.User))
				this.model.bind('sync', this.sync);
	
		},
		
		
		fetch : function(datasourceLeft, datasourceRight) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AssignmentFormControl.fetch ' + this.name);
			
			var promises = [];
			
			if (datasourceLeft)
				this.dictionaryLeft.reset(datasourceRight);
				
			else {
			
				if (this.options.beforeFetchLeft && _.isFunction(this.options.beforeFetchLeft))
					this.options.beforeFetchLeft(this.dictionaryLeft.query);
				
				promises.push(this.dictionaryLeft.fetch());
			
			}
			
			if (datasourceRight)
				this.dictionaryRight.reset(datasourceRight);
				
			else {
			
				if (this.options.beforeFetchRight && _.isFunction(this.options.beforeFetchRight))
					this.options.beforeFetchRight(this.dictionaryRight.query);
				
				promises.push(this.dictionaryRight.fetch());
				
			}
			
			if (_.size(promises) > 0)
				return Parse.Promise.when(promises);
			
		},
		
		
		render : function () {
			
			this.$el.html(this.templateControl());
			
			this.$itemsLeft = this.$('[role="items"][rel="left"]');
			this.$itemsRight = this.$('[role="items"][rel="right"]');
			
			this.$('.mCustomScrollbar').mCustomScrollbar({
				autoHideScrollbar: true,
				theme: 'dark',
				set_height: 400,
				mouseWheelPixels: 400,
				advanced: {
					updateOnContentResize: true
				}
			});
			
		},
		
		
		assign : function (model) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AssignmentFormControl.assign ' + this.name);
			
			if ((this.model instanceof Parse.Object) || (this.model instanceof Parse.User))
				this.model.unbind('sync', this.sync);
			
			if (!((model instanceof Parse.Object) || (model instanceof Parse.User)))
				throw 'model must be instance of Parse.Object';
			
			this.model = model;
			
			this.model.bind('sync', this.sync);
			
			this.sync();
			
		},
		
		
		sync : function () {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AssignmentFormControl.sync ' + this.name);
			
			if (this.name && this.model.has(this.name))
				this.set(this.model.get(this.name));
				
			else
				this.unset();
			
			this.build();
			
		},
		
		
		get : function (code) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AssignmentFormControl.get ' + this.name);
			
			if (code === true)
				return _.mapObject(this._value, function (items) {return this.multiple ? items: _.fisrt(items);}, this);
				
			else
				return code ? this._value[code] : this._value;
			
		},
		
		
		set : function (value, code) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AssignmentFormControl.set ' + this.name);
			
			var before = _.clone(this._value);
			
			if (code) {
				before[code] = value;
			} else
				before = value || {};
			
			var after = {};
			
			_.each(before, function (items, id) {
				
				if (_.isArray(items))
					items = _.compact(items);
					
				else if (!_.isEmpty(items))
					items = [items];
				
				if (!_.isEmpty(items))
					after[id] = items;
				
			}, this);
			
			var changed = !_.isEqual(this._value, after);
			
			this._value = after;
				
			if (changed)
				this.trigger('change', this);
				
		},
		
		
		unset : function (code) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AssignmentFormControl.unset ' + this.name);
			
			var changed = code ? _.has(this._value, code): !_.isEmpty(this._value);
			
			if (code)
				delete this._value[code];
			
			else
				this._value = {};

			if (changed)
				this.trigger('change', this);
			
		},
		
		
		build : function () {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AssignmentFormControl.build ' + this.name);
			
			_.each(
				this.dictionaryLeft.toDatasource(this.datasourceLeft),
				function (item) {
					
					var $container = this.$('[role="items"][rel="left"] [role="container"][data-id="' + item.id + '"]');
					$container.html('');
					
					if (_.has(this._value, item.id) && !_.isEmpty(this._value[item.id]))
						$container.parent().removeClass('empty');
						
					else
						$container.parent().addClass('empty');
						
				},
				this
			);
			
			var
				items = this.dictionaryRight.toDatasource(this.datasourceRight);
			
			_.each(this._value, function (assignments, id) {
				
				var $container = this.$('[role="items"][rel="left"] [role="container"][data-id="' + id + '"]');
				
				_
				.chain(items)
				.filter(function (item) {
					return _.contains(assignments, item.id);
				})
				.each(function (item) {
					$container.append(this.templateRight(item));
				}, this)
				.value();

			}, this);
			
		},
		
		
		apply : function(refresh) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AssignmentFormControl.apply ' + this.name);
			
			var self = this;
			
			if (this.name) {
				
				if (!_.isEmpty(this._value)) {
					
					var
						before = this.model.get(this.name),
						after = this.get(true);
					
					if (!_.isEqual(after, before))
						this.model.set(this.name, after);
				
				} else if (this.model.has(this.name))
					this.model.unset(this.name);
			
			}
				
			return Parse.Promise.as();
					
		},
		
		
		buildLeft : function () {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AssignmentFormControl.buildLeft ' + this.name);
			
			this.$itemsLeft.html('');
			
			_.each(
				this.dictionaryLeft.toDatasource(this.datasourceLeft),
				function (item) {
					this.$itemsLeft.append(this.templateLeft(item));
				},
				this
			);
			
			var self = this;

			this.$('[role="items"][rel="left"] [role="container"]').droppable({
				accept : '.tag-item.ui-draggable',
				drop : function (event, ui) {
					
					var
						$target = $(ui.draggable),
						targetData = $target.data(),
						$container = $(this),
						containerData = $container.data(),
						success = false;
					
					if (targetData && targetData.id && containerData && containerData.id) {
						
						if ($container.find('[data-id="' + targetData.id + '"]').length === 0) {
							$target.clone().off().removeClass('ui-draggable').appendTo($container);
							$container.parent().removeClass('empty');
							self.set($container.sortable('toArray', {attribute: 'data-id'}), containerData.id);
							success = true;
						}
					}
					
					$container.parent().addClass(success ? 'success' : 'danger').one(
						'transitionend',
						function () {
							$(this).removeClass(success ? 'success' : 'danger');
						}
					);
						
					return false;
				}
			}).disableSelection();
			
			this.$('[role="items"][rel="left"] [role="container"]').sortable({
				items	: '[data-id]',
				cursor	: 'move',
				revert	: true,
				change	: function (event, ui) {

					var
						$container = $(this),
						containerData = $container.data();
					
					if (containerData && containerData.id)
						self.set($container.sortable('toArray', {attribute: 'data-id'}), containerData.id);
						
				}
			}).disableSelection();
			
		},
		
		
		buildRight : function (collection) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AssignmentFormControl.buildRight ' + this.name);
			
			this.$itemsRight.html('');
			
			_.each(
				this.dictionaryRight.toDatasource(this.datasourceRight),
				function (item) {
					this.$itemsRight.append(this.templateRight(item));
				},
				this
			);
			
			this.$('[role="items"][rel="right"] [data-id]').draggable({
				helper : 'clone',
				revert : true
			}).disableSelection();
			
		},
		
		
		doClean : function(ev) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log('AssignmentFormControl.doClean ' + this.name);
			
			var
				$target = $(ev.currentTarget),
				data = $target.data();
				
			if (data && data.id) {
				
				this.$('[role="items"][rel="left"] [role="container"]').find('[data-id="' + data.id + '"]').html('').parent().addClass('empty');
				this.unset(data-id);
				
			}
			
			return false;
		
			
		}
		
		
	});
	
	return view;
	
});