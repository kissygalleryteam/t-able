KISSY.add(function(S, Node, Event, XTemplate, DProxy) {
    var $ = Node.all,
        def = {
            template: '<tr>' +
                '{{@each columns}}' +
                '<th colspan="{{colspan&&colspan.length}}">' +
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

            this.fire('beforeRender', {
                data: data,
                template: template
            });

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