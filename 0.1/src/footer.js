KISSY.add(function(S, Node, Event, XTemplate, DProxy) {
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