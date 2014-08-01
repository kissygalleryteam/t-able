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
KISSY.add(function(S, Node) {
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