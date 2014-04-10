/**
 * Column
 */
KISSY.add(function(S, Node, Event, XTemplate, DProxy) {
    var $ = Node.all,
        def = {},
        tpl = '<div class="inner-wrap">{html}</div>';

    var tplNest = '<table><tr></tr></table>',
        cellTemplate = '<td class="inner-cell cell-{name}" width="{width}"></td>';

    function Column(config) {
        var cfg = S.merge(def, config);

        this.cfg = cfg;

        this._parseTemplate();

        this.registerEvent(cfg.events);
    }

    S.augment(Column, Event.Target, DProxy, {
        getColspan: function() {
            var columns = this.columns;

            return (columns && columns.length) || 1;
        },
        render: function(data, parent) {
            var cfg = this.cfg;

            if(cfg.nested) {
                this._nestRender(data, parent);
            }else {
                this._render(data, parent);
            }
        },
        _nestRender: function(data, parent) {
            var self = this,
                $wrap = $(tplNest),
                $tr = $wrap.one('tr');

            S.each(this.columns, function(column) {

                $tr.append(self._createCell(column, data));

            });

            $(parent).append($wrap);
        },
        _render: function(data, parent) {
            var template = this.template;

            if(!template || !data) return "";

            var html = new XTemplate(template).render(data);

            $(parent).html(html);
        },
        _createCell: function(column, rowData) {
            var $wrap = $(S.substitute(cellTemplate, {
                    name: column.name,
                    width: column.width
                }));

            column.render(rowData, $wrap)

            column.bindEvent($wrap);

            return $wrap;
        },
        _parseTemplate: function() {
            var cfg = this.cfg,
                template = cfg.template,
                width = cfg.width,
                caption = cfg.caption,
                name = cfg.name;

            if(cfg.templateId) {
                var $template = Node.one(cfg.templateId);

                if($template) {
                    template = $template.html();

                    width || (width = $template.attr('data-width'));

                    name || (name = $template.attr('data-name'));

                    caption || (caption = $template.attr('data-caption'));
                }
            }

            if(!template && name) {
                template = "{{"+name+"}}";
            }

            if(cfg.nested) {

                var wid = 0;
                this.columns = S.map(cfg.columns, function(column) {
                    if(!(column instanceof Column)) {
                        column = new Column(column);
                    }

                    wid += column.width;

                    return column;
                });
                wid && (width = wid);

            }else {
                this.template = S.substitute(tpl, {
                    html: template
                });
            }

            this.caption = caption;

            this.name = name;

            this.width = width;
        }
    });

    return Column;

}, {
    requires: [
        "node", "event", 'xtemplate',
        './dproxy'
    ]
});