/**
 * Column
 */
KISSY.add(function(S, Node, Event, XTemplate, DProxy) {
    var def = {},
        tpl = '<div class="inner-wrap">{html}</div>';

    function Column(config) {
        var cfg = S.merge(def, config);

        this.cfg = cfg;

        this._parseTemplate();

        this.registerEvent(cfg.events);
    }

    S.augment(Column, Event.Target, DProxy, {
        render: function(data, tpl) {
            var template = tpl || this.template;

            if(!template || !data) return "";

            return new XTemplate(template).render(data);
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

            this.template = S.substitute(tpl, {
                html: template
            });

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