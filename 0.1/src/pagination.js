/**
 * @module 分页
 * @description 对列表进行分页操作
 */
KISSY.add(function(S, Node, XTemplate) {

    var $ = Node.all,
        tpl = '<ul class="pagination">' +
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
        lite = '<ul class="pagination">' +
            '{{@if isFirst}}' +
            '<li class="disabled"><span>&laquo;</span></li>' +
            '{{else}}' +
            '<li><a href="javascript:;" class="pn" data-value="{{current-1}}">&laquo;</a></li>' +
            '{{/if}}' +
            '{{@if isLast}}' +
            '<li class="disabled"><span>&raquo;</span></li>' +
            '{{else}}' +
            '<li><a href="javascript:;" class="pn" data-value="{{current+1}}">&raquo;</a></li>' +
            '{{/if}}' +
            '</ul>';

    var def = {
        pageSize: 20,
        padding: 4
    };

    function Pagination(cfg) {

        this.cfg = S.merge(def, cfg);

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
            return new XTemplate(tpl).render(dt);
        },
        getLiteHTML: function(data) {
            var dt = this.calPageData(data);
            return new XTemplate(lite).render(dt);
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
            var cfg = this.cfg,
                current = config.current * 1,
                totalRecord = config.totalRecord * 1,
                pageSize = config.pageSize * 1 || cfg.pageSize,
                padding = config.padding * 1 || cfg.padding,
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