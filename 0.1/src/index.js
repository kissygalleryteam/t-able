/**
 *
 */
KISSY.add(function(S, Node, Event, XTemplate, Store, Column, Header, Footer) {
    var $ = Node.all,
        idAttribute = '_uid',
        def = {
            wrap: '<table class="ta-wrap"><tbody class="ta-body"></tbody></table>',
            rowTemplate: '<tr id="ta-row-{_id}" data-id="{_id}"></tr>',
            cellTemplate: '<td colspan="{colspan}" class="ta-cell cell-{name}" width="{width}"></td>',
            headTemplate: '<thead class="ta-head"></thead>',
            footTemplate: '<tfoot class="ta-foot"></tfoot>'
        };

    function View(columns, data, config) {
        var cfg = this.cfg = S.merge(def, config);

        this.$parent = $(cfg.parent);
        this.$wrap = $(cfg.wrap);

        this._parseColumnsQueueAndMap(columns);

        this._parseData(data);

        this._parseHead(cfg.head);
        this._parseFoot(cfg.foot);
    }

    S.augment(View, Event.Target, {
        render: function() {
            var store = this.dataStore,
                $parent = this.$parent;

            $parent.html("");

            this.renderBody(store.getBody());

            this.renderHead(store.getHead());
            this.renderFoot(store.getFoot());

            $parent.append(this.$wrap);

            this.fire('afterRender');
        },
        renderBody: function(data) {
            var self = this,
                $wrap = this.$wrap,
                $fragment = $(document.createDocumentFragment());

            S.each(data, function(rowData) {
                $fragment.append(self._createRow(rowData));
            });

            $wrap.one('tbody').append($fragment);

            this.fire('bodyRender');
        },
        renderHead: function(data) {
            var cfg = this.cfg,
                $wrap = $(cfg.headTemplate),
                header = this.header,
                html = header.render(data);

            if(html) {
                $wrap.append(html).appendTo(this.$wrap);
                header.bindEvent($wrap);
            }
            this.fire('headerRender');
        },
        renderFoot: function(data) {
            var cfg = this.cfg,
                $wrap = $(cfg.footTemplate),
                footer = this.footer,
                html = footer.render(data);

            if(html) {
                $wrap.append(html).appendTo(this.$wrap);
                footer.bindEvent($wrap);
            }
            this.fire('footerRender');
        },
        /**
         * 根据数据和索引去更新指定的表格行。
         * @param id
         * @param dt
         */
        updateRowView: function(index, dt) {
            if(!index || !dt) return;

            var store = this.dataStore;
            var data = store.getDataByIndex(index);

            if(!data) return;

            var $row = this.getRowByData(data);

            if($row) {
                // 合并数据
                store.deepMix(data, dt);

                // 构建新行，替换老行
                var $tr = this._createRow(data);
                $row.replaceWith($tr);

            }

        },
        getRowByData: function(data) {
            var uid = data[idAttribute],
                $el = Node.one('#ta-row-' + uid);

            if(uid !== undefined && $el) {
                return $el;
            }
            return null;
        },
        getUIDByRow: function(row) {
            var $row = $(row),
                uid = $row.attr('data-id');

            return uid;
        },
        getColumnByName: function(name) {
            return this.columnsMap[name];
        },
        _parseColumnsQueueAndMap: function(columns) {
            var queue = [],
                map = {};

            S.each(columns, function(col) {
                var column = col;
                if(!(column instanceof Column)) {
                    column = new Column(col);
                }

                map[column.name] = column;

                queue.push(column);

            });

            this.columns = queue;
            this.columnsMap = map;

        },
        _parseData: function(data) {
            var dataStore = data;
            if(!(dataStore instanceof Store)) {
                dataStore = new Store(data);
            }

            this.dataStore = dataStore;
        },
        _parseHead: function(data) {
            var header = data;
            if(!(header instanceof Header)) {
                header = new Header(data);
            }

            this.header = header;
        },
        _parseFoot: function(data) {
            var footer = data;
            if(!(footer instanceof Footer)) {
                footer = new Footer(data);
            }

            this.footer = footer;
        },
        _createRow: function(rowData) {
            var self = this,
                cfg = self.cfg,
                html = S.substitute(cfg.rowTemplate, {_id: rowData[idAttribute]}),
                tr = $(html);

            S.each(self.columns, function(column) {

                tr.append(self._createCell(column, rowData));

            });

            return tr;
        },
        _createCell: function(column, rowData) {
            var cfg = this.cfg,
                $wrap = $(S.substitute(cfg.cellTemplate, {
                    colspan: column.getColspan(),
                    name: column.name,
                    width: column.width
                }));

            column.render(rowData, $wrap);

            column.bindEvent($wrap);

            return $wrap;
        }
    });

    return View;
}, {
    requires: [
        'node', 'event', 'xtemplate',
        './datastore', './column',
        "./header", "./footer"
    ]
});