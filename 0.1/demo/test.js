KISSY.use('node,gallery/t-able/0.1/index', function(S, Node, TAble) {
    var $ = Node.all;

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

    var pagination = new TAble.Pagination(lists.pagination);

    pagination.on('jump', function(ev) {
        var page = ev.to;

        console.log('jump to page ' + page);
    });

    var footer = new TAble.Footer({
        adapter: function(data) {
            var paginationData = lists.pagination;
            data.colspan = columns.length;
            data.pagination = pagination.getHTML();
            return data;
        },
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
        adapter: function(data) {

            data.columns = S.map(data.group, function(it) {
                it.colspan = it.cells;
                return it;
            });
            delete data.group;

            data.pagination = pagination.getLiteHTML();
            return data;

        },
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

    table.render();

});