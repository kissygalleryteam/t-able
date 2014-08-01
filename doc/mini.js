/**
 * @fileoverview 
 * @author 阿克<ake.wgk@taobao.com>
 * @module t-able
 **/
KISSY.add(function (S, Node, Lang) {
    var $ = Node.all,
        EventTarget = S.Event.Target;
    /**
     *
     * @class TAble
     * @constructor
     */
    function TAble(config) {

    }

    S.augment(TAble, EventTarget, /** @lends TAble.prototype*/{

    });

    return TAble;

}, {requires:['node', 'lang']});



