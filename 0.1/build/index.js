/*
combined files : 

gallery/t-able/0.1/src/datastore
gallery/t-able/0.1/src/dproxy
gallery/t-able/0.1/src/column
gallery/t-able/0.1/src/header
gallery/t-able/0.1/src/footer
gallery/t-able/0.1/src/index
gallery/t-able/0.1/src/pagination
gallery/t-able/0.1/index

*/
KISSY.add('gallery/t-able/0.1/src/datastore',function(S, Event) {
    var idAttribute = "_uid",
        def = {
            dataIndex: "id"
        };

    function DataStore(data, config) {

        this.cfg = S.merge(def, config);
        this._originData = data;

        this._parseData(data);
//        this.body = this._parseBodyData();
//        this.foot = this._parseFootData();
    }

    S.augment(DataStore, Event.Target, {
        getBody: function() {
            return this.body;
        },
        getHead: function() {
            return this.head;
        },
        getFoot: function() {
            return this.foot;
        },
        getDataByIndex: function(index) {
            return this._indexMap[index];
        },
        getDataByUID: function(uid) {
            return this._uDataMap[uid];
        },
        // 原始数据进行处理。
        // 构造出便于使用的数据格式。
        // 生成便于外部使用的数据。
        _parseData: function(data) {
            this.head = this._parseHeadData(data.head);

            this._uDataMap = {};
            this._indexMap = {};
            this.body = this._parseBodyData(data.rows);

            this.foot = this._parseFootData(data.foot);
        },
        deepMix: function(target, source) {
            return S.mix(target, source, undefined, undefined, true);
        },
        _parseHeadData: function(origin) {
            return origin;
        },
        _parseBodyData: function(origin) {
            var cfg = this.cfg,
                di = cfg.dataIndex,
                uDataMap = this._uDataMap,
                iDataMap = this._indexMap;

            S.each(origin, function(row) {

                var uid = S.guid();
                // 程序内使用的索引。
                uDataMap[uid] = row;
                row[idAttribute] = uid;

                // 用户定义的索引。便于开发者获取数据。
                iDataMap[row[di]] = row;
            });

            return origin;
        },
        _parseFootData: function(origin) {
            return origin;
        }
    });

    return DataStore;

}, {
    requires: ['event']
});
/**
 * DProxy
 *
 * 为指定的容器内的元素存储注册的事件。
 * 在调用的时候，把事件一一绑定到元素上。
 *
 * // 使用
 * S.augment(Class, dProxy);
 *
 * // 注册事件
 * Class.register({
 *     "click img": function(ev) {
 *         console.log(ev);
 *     }
 * });
 *
 * // 绑定事件。
 * // 效果类似于：
 * //    $imgs = $elem.all('img');
 * //    if($imgs.length > 0) {
 * //        $imgs.on('click', function(ev) {
 * //            console.log(ev);
 * //        });
 * //    }else {
 * //        // 注意，会绑定到 $elem 上，所以要自己控制好不要重复绑定。
 * //        $elem.on('click', function(ev) {
 * //            console.log(ev);
 * //        });
 * //    }
 * Class.bindEvent($elem);
 *
 */
KISSY.add('gallery/t-able/0.1/src/dproxy',function(S, Node) {
    var $ = Node.all;

    var Proxy = {
        bindEvent: function(container) {
            var events = this.__P;

            if(!events) return;

            S.each(events, function(event) {
                var $selector = event.selector ? $(event.selector, container) : container;
                $selector.on(event.type, event.fn);
            });

        },
        registerEvent: function(events) {
            if(!events) return;

            var evts = this.__P;

            if(!evts) {
                evts = this.__P = [];
            }

            S.each(events, function(func, name) {
                var matched = name.match(/^(\w+)\s*(.*)$/);

                evts.push({
                    type: matched[1],
                    selector: matched[2],
                    fn: func
                });
            });

        }
    };

    return Proxy;

}, {
    requires: ['node']
});
/**
 * Column
 */
KISSY.add('gallery/t-able/0.1/src/column',function(S, Node, Event, XTemplate, DProxy) {
    var $ = Node.all,
        def = {},
        tpl = '<div class="inner-wrap">{html}</div>';

    var tplNest = '<table class="inner-table"><tr></tr></table>',
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
            var cfg = this.cfg,
                $wrap;

            if(S.isFunction(cfg.adapter)) {
                data = cfg.adapter(data);
            }

            if(cfg.nested) {
                $wrap = this._nestRender(data, parent);
            }else {
                $wrap = this._render(data, parent);
            }

            this.fire('afterRender', {
                $wrap: $wrap
            });
        },
        _nestRender: function(data, parent) {
            var self = this,
                $wrap = $(tplNest),
                $tr = $wrap.one('tr');

            S.each(this.columns, function(column) {

                $tr.append(self._createCell(column, data));

            });

            $(parent).append($wrap);

            return $wrap;
        },
        _render: function(data, parent) {
            var template = this.template;

            if(!template || !data) return "";

            var html = new XTemplate(template).render(data),
                $wrap = $(html);

            $(parent).append($wrap);

            return $wrap;
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
KISSY.add('gallery/t-able/0.1/src/header',function(S, Node, Event, XTemplate, DProxy) {
    var $ = Node.all,
        def = {
            template: '<tr>' +
                '{{@each columns}}' +
                '<th width="{{width}}" colspan="{{colspan&&colspan.length}}">' +
                    '{{caption}}' +
                '</th>' +
                '{{/each}}' +
                '</tr>'
        };

    function Header(config) {
        var cfg = this.cfg = S.merge(def, config);

        this.registerEvent(cfg.events);
    }

    S.augment(Header, Event.Target, DProxy, {
        render: function(dt) {
            var cfg = this.cfg,
                template = cfg.template,
                data = S.merge(cfg, dt);

            if(S.isFunction(cfg.adapter)) {
                data = cfg.adapter(data);
            }

            return new XTemplate(template).render(data);
        }
    });

    return Header;

}, {
    requires: [
        'node', 'event', "xtemplate",
        './dproxy'
    ]
});
KISSY.add('gallery/t-able/0.1/src/footer',function(S, Node, Event, XTemplate, DProxy) {
    var $ = Node.all,
        def = {
            template: ""
        };

    function Foot(config) {
        var cfg = this.cfg = S.merge(def, config);

        this.registerEvent(cfg.events);
    }

    S.augment(Foot, Event.Target, DProxy, {
        render: function(dt) {
            var cfg = this.cfg,
                template = cfg.template,
                data = S.merge(cfg, dt);

            if(S.isFunction(cfg.adapter)) {
                data = cfg.adapter(data);
            }

            return new XTemplate(template).render(data);
        }
    });

    return Foot;

}, {
    requires: [
        'node', 'event', "xtemplate",
        './dproxy'
    ]
});
/**
 *
 */
KISSY.add('gallery/t-able/0.1/src/index',function(S, Node, Event, XTemplate, Store, Column, Header, Footer) {
    var $ = Node.all,
        idAttribute = '_uid',
        def = {
            wrap: '<table class="ta-wrap"><tbody class="ta-body"></tbody></table>',
            rowTemplate: '<tr class="ta-row" id="ta-row-{_id}" data-id="{_id}"></tr>',
            cellTemplate: '<td colspan="{colspan}" class="ta-cell cell-{name}" width="{width}"></td>',
            headTemplate: '<thead class="ta-head"></thead>',
            footTemplate: '<tfoot class="ta-foot"></tfoot>',
            emptyTemplate: '<div>没有找到符合条件的结果！</div>'
        };

    function View(columns, data, config) {
        var cfg = this.cfg = S.merge(def, config);

        // 传入父容器。
        this.$parent = $(cfg.parent);
        // 构造容器。
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

            if(data.length == 0) {
                $fragment.append(self._createEmptyRow());
            }else {
                S.each(data, function(rowData) {
                    var $row = self._createRow(rowData)
                    $fragment.append($row);

                    self.fire('afterRowRender', {
                        data: rowData,
                        $row: $row
                    });
                });
            }

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
         * @param index
         * @param dt
         */
        updateRowView: function(index, dt) {
            if(!index || !dt) return;

            var store = this.dataStore;
            var data = store.getDataByIndex(index);

            if(!data) return;

            var $row = this.getRowByData(data),
                $newRow;

            if($row) {
                // 合并数据
                store.deepMix(data, dt);

                // 构建新行，替换老行
                $newRow = this._createRow(data);
                $row.replaceWith($newRow);

            }

            this.fire('afterRowUpdate', {
                data: data,
                $row: $newRow,
                $oldRow: $row
            });

        },
        getRowByData: function(data) {
            var uid = data[idAttribute],
                $el = Node.one('#ta-row-' + uid);

            if(uid !== undefined && $el) {
                return $el;
            }
            return null;
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
        },
        _createEmptyRow: function() {
            var colspan = S.reduce(this.columns, function(rt, column) {
                    return rt + column.getColspan();
                }, 0),
                html = S.substitute('<tr><td colspan="{colspan}">{html}</td></tr>', {
                    colspan: colspan,
                    html: this.cfg.emptyTemplate
                });

            return $(html);
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
/**
 * @module 分页
 * @description 对列表进行分页操作
 */
KISSY.add('gallery/t-able/0.1/src/pagination',function(S, Node, XTemplate) {

    var $ = Node.all;

    var def = {
        pageSize: 20,
        padding: 4,
        template: '<ul class="pagination">' +
            '{{@if isFirst}}' +
            '<li class="disabled"><span>&laquo;</span></li>' +
            '{{else}}' +
            '<li><a href="javascript:;" class="pn" data-value="{{current-1}}">&laquo;</a></li>' +
            '{{/if}}' +
            '{{@each queue}}' +
            '{{@if type==="digital"}}' +
            '{{@if value===current}}' +
            '<li class="active"><span>{{value}}</span></li>' +
            '{{else}}' +
            '<li><a class="pn" href="javascript:;" data-value="{{value}}">{{value}}</a></li>'+
            '{{/if}}'+
            '{{/if}}' +
            '{{@if type==="split"}}' +
            '<li><span>{{value}}</span></li>' +
            '{{/if}}' +
            '{{/each}}' +
            '{{@if isLast}}' +
            '<li class="disabled"><span>&raquo;</span></li>' +
            '{{else}}' +
            '<li><a href="javascript:;" class="pn" data-value="{{current+1}}">&raquo;</a></li>' +
            '{{/if}}' +
            '</ul>',
        liteTemplate: '<ul class="pagination">' +
            '{{@if isFirst}}' +
            '<li class="disabled"><span>&laquo; 上一页</span></li>' +
            '{{else}}' +
            '<li><a href="javascript:;" class="pn" data-value="{{current-1}}">&laquo; 上一页</a></li>' +
            '{{/if}}' +
            '{{@if isLast}}' +
            '<li class="disabled"><span>下一页 &raquo;</span></li>' +
            '{{else}}' +
            '<li><a href="javascript:;" class="pn" data-value="{{current+1}}">下一页 &raquo;</a></li>' +
            '{{/if}}' +
            '</ul>'
    };

    function Pagination(cfg) {

        this.cfg = S.merge(def, cfg);

        this.template = this.cfg.template;

        this.liteTemplate = this.cfg.liteTemplate;

    }

    S.augment(Pagination, S.Event.Target, {
//        render: function(data) {
//            var dt = this.calPageData(data),
//                html = new XTemplate(tpl).render(dt);
//
//            this.fire('afterRender', {
//                data: dt
//            });
//        },
        getHTML: function(data) {
            var dt = this.calPageData(data);
            return new XTemplate(this.template).render(dt);
        },
        getLiteHTML: function(data) {
            debugger;
            var dt = this.calPageData(data);
            return new XTemplate(this.liteTemplate).render(dt);
        },
        jumpTo: function(value) {
            this.fire('jump', {
                to: value
            });
        },
        /**
         * 根据默认配置和现有的数据，计算出渲染模板所需要的数据。
         * @param config
         * {
         *   {queue: [
         *      {type: "digital", value: "page number"},
         *      {type: "split", value: "..."}
         *   ], current: "current number"}
         * }
         */
        calPageData: function(config) {
            var cfg = S.merge(this.cfg, config),
                current = cfg.current * 1,
                totalRecord = cfg.totalRecord * 1,
                pageSize = cfg.pageSize * 1,
                padding = cfg.padding * 1,
                getData = this._getPageData;

            var totalPage = Math.ceil(totalRecord / pageSize);

            (current < 1) && (current = 1);
            (current > totalPage) && (current = totalPage);

            var middle = [];
            for(var i = current - padding; i <= current + padding; i++) {
                if(i >= 1 && i <= totalPage) {
                    middle.push(getData("digital",i));
                }
            }
            if(middle.length === 0) {
                return {
                    queue: [getData("digital",1)],
                    current: 1,
                    isFirst: true,
                    isLast: true
                };
            }

            var min = middle[0].value,
                max = middle[middle.length -1].value;

            var start = [];
            if(min > 1) {
                start.push(getData("digital",1));
            }
            if(min > 2) {
                start.push(getData("split"));
            }

            var end = [];
            if(max < totalPage) {
                end.push(getData("digital",totalPage));
            }
            if(max < totalPage -1) {
                end.unshift(getData("split"));
            }

            return {
                // [ [1, ...], [3,4,5],  ]
                queue: [].concat(start, middle, end),
                current: current,
                isFirst: current == 1,
                isLast: current == totalPage
            };
        },
        _getPageData: function(type, value) {
            return {
                type: type,
                value: value || "..."
            };
        }
    });

    return Pagination;

}, {
    requires: ['node', 'xtemplate']
})
/**
 * @fileoverview
 * @author 阿克<ake.wgk@taobao.com>
 * @module t-able
 **/
KISSY.add('gallery/t-able/0.1/index',function (S, Table, Store, Column, Header, Footer, Pagination) {

    var TAble = function(config) {
        var data = config.data,
            columns = config.columns;

        return new Table(columns, data, config);
    };

    S.mix(TAble, {
        Column: Column,
        Footer: Footer,
        Header: Header,
        DataStore: Store,
        Pagination: Pagination
    });

    return TAble;

}, {
    requires:["./src/", "./src/datastore", "./src/column", "./src/header", "./src/footer", "./src/pagination"]
});




