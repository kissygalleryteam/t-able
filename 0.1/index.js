/**
 * @fileoverview
 * @author 阿克<ake.wgk@taobao.com>
 * @module t-able
 **/
KISSY.add(function (S, Table, Store, Column, Header, Footer, Pagination) {

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



