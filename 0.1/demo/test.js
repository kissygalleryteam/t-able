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

    S.use('node', function(_, Node) {
        var $ = Node.all;


        S.ready(function() {
            var $templates = $(".J_XTPL");

            S.use('gallery/t-able/0.1/index', function (S, TAble) {

                var columns = [];

                $templates.each(function($template) {

                    columns.push(new TAble.Column({
                        templateId: $template
                    }));
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

                table.render();

            });

        });
    })

})(KISSY);