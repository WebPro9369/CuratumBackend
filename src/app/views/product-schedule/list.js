define([
    'underscore',
    'moment',
    'parse',
    
    'proto/view/nested-form',
	'proto/view/nested-view',
	
	'entities/daterange',
    
    'classes/product-schedule/collection',
    'classes/product-schedule/model',
    
    'views/product-schedule/item',
    'views/product-schedule/form',
    
    'controls/list/manager',
    
    'controls/list/filter/enum',
    
    'text!templates/product-schedule/list.html',
    'text!templates/product-schedule/items.html'
], function (
	_, moment, Parse,
	NestedFormProto, NestedViewProto,
	DaterangeEntity,
	ProductScheduleCollection, ProductScheduleModel,
	ProductScheduleItem, ProductScheduleForm,
	ManagerControl,
	EnumFilterControl,
	listTemplate, itemsTemplate
) {
	
	const VIEW = {
		TITLE	 	: 'Product Schedule',
		NAME		: 'ProductScheduleList',
		ID			: 'product-schedule',
		LIST_EMPTY	: _.unpairs([
			[THEME_TYPE_TABLE	, '<tr><td colspan="3">No matching records found</td></tr>'],
			[THEME_TYPE_GALLERY	, '<div class="col-md-12"><div class="thumbnail"><div class="caption">No matching records found</div></div></div>'] 
		])
	};

	var view = Parse.View.extend({
	
		el : '#body',
		
		events : _.unpairs([
			['click .table-schedule [data-date] div'	, 'doShowForm']
		]),
		
		title : 'Product schedule',
		route : 'product/product-schedule',
		
	
		initialize : function(options) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.initialize');
	
			_.bindAll(this, 'render', 'fetch', 'refresh', 'addOne', 'removeOne', 'addAll', 'doShowForm');
			
			this.form = {};
			this.view = {};
			
			var date = moment.utc().startOf('month');
			
			this.periodEnum = _.map(
				_.range(10),
				function (offset) {
					
					var
						dateFrom = moment.utc(date).add(offset, 'month'),
						dateTill = moment.utc(date).add(offset, 'month').endOf('month');
					
					return {id: offset, text: dateFrom.format(DATE_FORMAT_YEAR), from: dateFrom.toDate(), till: dateTill.toDate()};
					
				}
			);
			
			this.template = _.template(listTemplate);
			this.templateItems = _.template(itemsTemplate);
			
			this.collection = new ProductScheduleCollection;
			this.collection.query = new Parse.Query(ProductScheduleModel);
			//this.collection.query.ascending('value');
			this.collection.bind('add', this.addOne);
			this.collection.bind('reset', this.addAll);
			this.collection.bind('remove', this.removeOne);
			
			this.manager = new ManagerControl(this.collection, app.locationManager, false);
			
			this.manager
			.filter(
				
				'period',
				EnumFilterControl,
				{
					type            : 'Number',
					datasource      : this.periodEnum,
					nullable		: false,
					beforeApply		: function (control, query) {
						
						var value = control.value(true);
						
						query.greaterThanOrEqualTo('date', value.from);
						query.lessThanOrEqualTo('date', value.till);
						
					}
				}
				
			)
			/*.search('q', SearchControl)
			.pagination('p', PaginationControl)*/
			.listener(this.refresh);
			
			this.form['product-schedule'] = new ProductScheduleForm({collection	: this.collection});
	
		},
	
	
		render : function() {
	
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.render');
			
			this.$el.html(this.template(VIEW));
			
			this.$items = this.$('[role="items"]');
			
			this.manager.render(this);
			
			this.renderNestedForm();
			this.prefetchNestedForm();
			this.renderNestedView();
			
		},
		
		
		fetch : function() {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.fetch');
			
			this.manager.invalidate();
			
		},
		
		
		refresh : function (ev) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.refresh');
			
			return this.manager.fetch().then(
				
				null,
				function (error) {
					
					app.view.alert(
						null,
						'danger',
						'Failed to get list items',
						error.message,
						false
					);
					
				}
			
			);
			
		},
		
		
		addOne : function(model) {
			
			var $container = this.$items.find('[data-date="' + moment.utc(model.get('date')).format(DATE_FORMAT_ISO) + '"]');
			
			if ($container.size() === 1) {
				
				var view = new ProductScheduleItem({model : model});
				$container.html(view.render().el).addClass('info');
				
			}
			
		},
		
		
		removeOne : function(model) {
			
			var
				date = moment.utc(model.get('date')),
				$container = this.$items.find('[data-date="' + date.format(DATE_FORMAT_ISO) + '"]');
			
			if ($container.size() === 1)
				$container.html('<div>' + date.format(date.date() === 1 ? DATE_FORMAT_MONTH : DATE_FORMAT_DAY) + '</div>').removeClass('info');
			
		},
	
	
		addAll : function(collection, filter) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.addAll');
			
			if (_.isNull(this.manager.filter('period').value()))
				return;
			
			var
				period = this.manager.filter('period').value(true);
				range = new DaterangeEntity(period.from, period.till),
				momentFrom = range.from(true),
				momentTill = range.till(true),
				tsFrom = momentFrom.valueOf(),
				tsTill = momentTill.valueOf();

			range.extend(momentFrom.isoWeekday() - 1, 7 - momentTill.isoWeekday());

			this.items = {};
			
			_.each(
				range.range(true),
				function (ts) {
					
					var
						date = moment(ts),
						idx = date.format(DATE_FORMAT_ISO),
						title = date.format(date.date() === 1 ? DATE_FORMAT_MONTH : DATE_FORMAT_DAY);
					
					var item = {
						idx: idx,
						title: title,
						inRange: tsFrom <= ts && ts <= tsTill,
						content: '<div>' + title + '</div>'
					};
					
					this.items[idx] = item;
						
				},
				this
			);
			
			var
				rows = [];
			
			_.each(this.items, function (item, idx) {
				
				var row = _.size(rows) - 1;
				
				if (row < 0 || _.size(rows[row]) >= 7)
					rows[++row] = [];
				
				rows[row].push('<td' + (item.inRange ? ' data-date="' + idx + '" class="active"' : '') +'>' + item.content + '</td>');
				
			}, this);
			
			this.$items.html(_.map(rows, function (row) {
				return '<tr>' + row.join('') + '</tr>';
			}).join(''));

			if (this.collection.length > 0)
				this.collection.each(this.addOne);
				
		},
		
		
		doShowForm : function (ev) {
			
			if (app.DEBUG_LEVEL == DEBUG_LEVEL.TRACE) console.log(VIEW.NAME + '.doShowForm');
			
			var
				$target = $(ev.currentTarget),
				$item = $target.parent(),
				data = $target.data(),
				itemData = $item.data();
			
			if (data && data.id && (model = this.collection.get(data.id)))
				this.form['product-schedule'].build(model);
			
			else if (itemData && itemData.date)
				this.form['product-schedule'].build(new ProductScheduleModel({date: moment.utc(itemData.date, DATE_FORMAT_ISO).toDate()}));
			
			return false;
			
		}
		
	})
	.extend(_.clone(NestedFormProto))
	.extend(_.clone(NestedViewProto));
	
	return view;

});