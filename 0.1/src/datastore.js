KISSY.add(function(S, Event) {
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