(function(S) {

    if (S.Config.debug) {
        var srcPath = "../../";
        S.config({
            packages:[
                {
                    name:"gallery/t-able",
                    path:srcPath,
                    charset:"utf-8",
                    ignorePackageNameInUri:true
                }
            ]
        });
    }

    var Columns = {
        toggle: {
            template: '<input type="checkbox" value="{{id}}" class="J_Checkbox" />'
        },
        image: {
            template: '<a href="{{detailURL}}" target="_blank"><img src="{{image}}_80x80.jpg?t={{id}}" class="img-thumbnail" alt=""/></a>'
        },
        title: {
            template: '<a href="{{detailURL}}" class="title" target="_blank">' +
                '{{title.prefix}}{{title.content}}{{title.suffix}}' +
                '</a>' +
                '{{@if icons.length>0}}' +
                '<div class="icon-flow">' +
                '<div class="icons">' +
                '{{@each icons}}' +
                '{{@if xindex<2}}' +
                '{{@if link}}' +
                '<a href="{{link}}" target="_blank">' +
                '{{/if}}' +
                '{{@if type==="vi"}}' +
                '<i class="vi J_Icon" data-name="{{name}}" data-id="{{id}}">{{text}}</i>' +
                '{{else}}' +
                '<img class="icon J_Icon" src="{{icon}}" data-name="{{name}}" data-id="{{id}}"/>' +
                '{{/if}}' +
                '{{@if link}}' +
                '</a>' +
                '{{/if}}' +
                '{{/if}}' +
                '{{/each}}' +
                '{{@if icons.length>2}}' +
                '<i class="caret"></i>' +
                '<div class="layer">' +
                '{{@each icons}}' +
                '{{@if xindex>=2}}' +
                '{{@if link}}' +
                '<a href="{{link}}" target="_blank">' +
                '{{/if}}' +
                '{{@if type==="vi"}}' +
                '<i class="vi J_Icon" data-name="{{name}}" data-id="{{id}}">{{text}}</i>' +
                '{{else}}' +
                '<img class="icon J_Icon" src="{{icon}}" data-name="{{name}}" data-id="{{id}}"/>' +
                '{{/if}}' +
                '{{@if link}}' +
                '</a>' +
                '{{/if}}' +
                '{{/if}}' +
                '{{/each}}' +
                '</div>' +
                '{{/if}}' +
                '</div>' +
                '</div>' +
                '{{@if outId}}' +
                '<div class="outer-id">商家编码：{{outId}}</div>' +
                '{{/if}}' +
                '{{/if}}'
        },
        sku: {
            columns: ['price', 'quantity']
        },
        price: {
            template: '<div class="text-price {{@if price.actual}} text-through{{/if}}">' +
                '{{@if price.min&&price.max}}' +
                '{{price.min}} ~ {{price.max}}' +
                '{{else}}' +
                '{{price.value}}' +
                '{{/if}}' +
                '</div>' +
                '{{@if price.actual}}' +
                '<div class="text-actual">' +
                '{{price.actual}}' +
                '</div>' +
                '{{/if}}'
        },
        quantity: {
            template: '{{quantity.value}}'
        },
        saleQuantity: {
            template: '{{saleQuantity}}'
        },
        status: {
            template: '<span class="text-{{status.type}}">{{status.text}}</span>'
        },
        publishTime: {
            template: '{{publishTime}}'
        },
        lastModify: {
            template: '{{lastModify}}'
        },
        actions: {
            template: '{{@each actions}}' +
                '{{@if disabled}}' +
                '<button type="button" disabled class="btn btn-default disabled">{{text}}</button>' +
                '{{else}}' +
                '{{@if action==="link"}}' +
                '<a href="{{url}}" target="_blank" class="btn btn-default">{{text}}</a>' +
                '{{/if}}' +
                '{{@if action==="copy"}}' +
                '<button type="button" class="btn btn-default J_ClipBoard" data-text="{{content}}">{{text}}</button>' +
                '{{/if}}' +
                '{{@if action==="confirmURL"}}' +
                '<button type="button" class="btn btn-default J_Confirm" data-url="{{url}}" data-msg="{{msg}}">{{text}}</button>' +
                '{{/if}}' +
                '{{@if action==="alert"}}' +
                '<button type="button" class="btn btn-default J_Alert" data-msg="{{msg}}">{{text}}</button>' +
                '{{/if}}' +
                '{{/if}}' +
                '{{/each}}'
        }
    };


    S.use('node', function(_, Node) {
        var $ = Node.all;


        S.ready(function() {
            var templates = [
                {
                    name: 'toggle',
                    width: 18
                },
                {
                    name: 'image',
                    width: 102
                },
                {
                    name: 'title',
                    width: 226
                },
                {
                    name: 'sku',
                    columns: [
                        {
                            name: 'price',
                            width: 110
                        },
                        {
                            name: 'quantity',
                            width: 94
                        }
                    ]
                },
                {
                    name: 'saleQuantity',
                    width: 90
                },
                {
                    name: 'status',
                    width: 90
                },
                {
                    name: 'publishTime',
                    width: 93
                },
                {
                    name: 'lastModify',
                    width: 99
                },
                {
                    name: 'actions',
                    width: 123
                }
            ];

            S.use('gallery/t-able/0.1/index', function (S, TAble) {

                var columns = [];

                S.each(templates, function(it) {
                    var items = it.columns || [it];

                    it.columns = S.map(items, function(d) {
                        var templ = Columns[d.name];
                        d.template = templ && templ.template;

                        return d;
                    });

                    var column;
                    if(it.columns.length === 1) {

                        column = new TAble.Column(it.columns[0]);
                    }else {
                        it.nested = true;
                        column = new TAble.Column(it);
                    }

                    columns.push(column);

                });

                var pagination = new TAble.Pagination();

                pagination.on('jump', function(ev) {
                    var page = ev.to;

                    console.log('jump to page ' + page);
                });

                var footer = new TAble.Footer({
                    events: {
                        "click .pn": function(ev) {
                            var $target = $(ev.currentTarget);
                            var page = $target.attr('data-value');
                            pagination.jumpTo(page)
                        }
                    },
                    template: '<tr>' +
                        '<td colspan="{{colspan}}">{{{pagination}}}</td>' +
                        '</tr>'
                });

                footer.on('beforeRender', function(ev) {
                    var data = ev.data;

                    data.colspan = columns.length;
                    data.pagination = pagination.getHTML(lists.pagination);
                });

                var header = new TAble.Header({
                    events: {
                        "change select": function(ev) {
                            console.log(ev.target);
                        },
                        "click .sortable": function(ev) {
                            console.log(ev.target)
                        },
                        "click .J_Action": function(ev) {
                            var target = ev.currentTarget;

                            console.log(target);
                        },
                        "click .pn": function(ev) {
                            var $target = $(ev.currentTarget);
                            var page = $target.attr('data-value');
                            pagination.jumpTo(page)
                        }
                    },
                    template: '<tr>' +
                        '{{@each columns}}' +
                        '<th colspan="{{colspan&&colspan.length}}">' +
                        '{{@if caption.length===1}}' +
                        '<span class="sortable">{{caption.0.text}}</span>' +
                        '{{else}}' +
                        '<select>' +
                        '{{@each caption}}' +
                        '<option value="value">{{text}}</option>' +
                        '{{/each}}' +
                        '</select>' +
                        '{{/if}}' +
                        '</th>' +
                        '{{/each}}' +
                        '</tr>' +
                        '<tr>' +
                        '<td colspan="2">' +
                        '<input type="checkbox" class="J_CheckAll" id="list-checkbox-all"> ' +
                        '<label class="control-label" for="list-checkbox-all">当前页全选</label>' +
                        '</td>' +
                        '<td colspan="6">' +
                        '{{@each buttons}}' +
                        '<button ' +
                        '{{@if !permission}}disabled{{/if}} ' +
                        'data-action="{{action}}" ' +
                        'class="btn btn-link J_Action ' +
                        '{{@if !permission}}disabled{{/if}}" ' +
                        '>' +
                        '{{text}}' +
                        '</button>' +
                        '{{/each}}' +
                        '</td>' +
                        '<td colspan="2">' +
                        '{{{pagination}}}' +
                        '</td>' +
                        '</tr>'
                });

                header.on('beforeRender', function(ev) {
                    var data = ev.data;

                    data.columns = S.map(data.group, function(it) {
                        it.colspan = it.cells;
                        return it;
                    });
                    delete data.group;

                    data.pagination = pagination.getLiteHTML(lists.pagination);
                });

                var table = new TAble({
                    parent: "#grid",
                    data: {
                        rows: lists.items,
                        head: lists.header
                    },
                    columns: columns,
                    foot: footer,
                    head: header
                });

                table.on('afterRender', function(ev) {
                    var $wrap = table.$wrap;

                    S.use('gallery/limitfixed/1.0/', function(_, LimitFixed) {
                        var thead = $wrap.one('thead'),
                            $fake = thead.clone(true);
                        $fake.insertBefore(thead);
                        var wrap = $('<table></table>').append(thead);

                        $wrap.parent().append(wrap);
                        LimitFixed(wrap, $wrap);
                    });
                });

                table.render();

            });

        });
    })

})(KISSY);