## 综述

TAble是。

* 版本：0.1
* 作者：阿克
* demo：[http://gallery.kissyui.com/t-able/0.1/demo/index.html](http://gallery.kissyui.com/t-able/0.1/demo/index.html)

## 初始化组件
		
    S.use('gallery/t-able/0.1/index', function (S, TAble) {
        
        // 具体调用参考 demo 中的“基本调用”源码。
        var table = new TAble({
            parent: "#grid",
            data: {
                rows: items,
                head: header
            },
            columns: columns,
            foot: footer,
            head: header
        });
        
        table.render();
        
    });
	

## API说明

TAble包含几个组件。

### TAble.Column

```
    var cfg = {
        // 列标识，也是默认的数据字段名。
        name: "fullName",
        // xtemplate模板。默认是 "{{name}}"。 这里的name就是列标识。
        template: '{{@if score >= 60}}Pass{{else}}Fail{{/if}}',
        // 调用render时传入的数据，会调用adapter做一次数据处理。
        adapter: function(data) {return data;},
        events: {
            // "event selector"形式的key，事件处理函数为value。类似backbone的事件定义方式。 
            // 在column实例对象执行render渲染的时候处理事件绑定。
            "click button.submit": function() {}
        }
    }
    var column = new TAble.Column(cfg);
    // 一般不会单独去调用render方法。
    // 因为column对象是配合table来使用的。而table在渲染时会自动调用render方法。
    // 这里主要是介绍一下方法。
    column.render({
        score: 59
    });
    // 返回当前列实际在表格中占的列数。默认是 1
    column.getColspan();
```

### TAble.Header

```
    var cfg = {
        // xtemplate模板。示例是默认的值。
        template: '<tr>{{@each columns}}<th width="{{width}}" colspan="{{colspan&&colspan.length}}">{{caption}}</th>{{/each}}</tr>',
        // 调用render时传入的数据，会调用adapter做一次数据处理。
        adapter: function(data) {return data;},
        events: {
            // "event selector"形式的key，事件处理函数为value。类似backbone的事件定义方式。 
            // 在column实例对象执行render渲染的时候处理事件绑定。
            "click button.submit": function() {}
        }
    }
    var header = new TAble.Header(cfg);
    // 一般不会单独去调用render方法。
    // 因为Header对象是配合table来使用的。而table在渲染时会自动调用render方法。
    // 这里主要是介绍一下方法。
    header.render({
        columns: [
            {
                caption: "A"
            }
        ]
    });
```

### TAble.Footer

API同TAble.Header组件。

### TAble.DataStore

```
var cfg = {
    // 默认的数据索引。如下示例表示，传入的数据源中，每一项的id作为该项数据的索引。
    dataIndex: "id"
};
// data是TAble渲染所需要的所有数据。
var data = {
    // 渲染表格主体部分所需要的数据
    rows: [],
    // 渲染表格头所需要的数据
    head: {},
    // 渲染表格尾所需要的数据
    foot: {}
};
var ds = TAble.DataStore(data, cfg);
// 根据dataIndex字段来查询数据。
ds.getDataByIndex(id);
// 根据uid查询数据，uid是传入数据以后，程序自动添加的数据索引。
ds.getDataByUID(uid);
```

### TAble.Pagination

```
var cfg = {
    // 当前页码
    current: 2,
    // 记录总条数
    totalRecord: 123,
    // 每页记录条数
    pageSize: 20,
    // 当前页码的左右可点击的页码数量
    padding: 4,
    // 分页模板。建议直接用默认的即可。 
    template: ''
};
var pagination = new TAble.Pagination(cfg);
// 返回渲染完成的html代码
pagination.getHTML({
    current: 1,
    totalRecord: 123,
    pageSize: 30
});
// 触发jump事件。
pagination.jumpTo(3);
// 根据totalRecord和pageSize计算总页数
pagination.getTotalPage();
// 调用jumpTo方法时触发。
pagination.on('jump', function() {})
```

### TAble

```
var cfg = {
    // 把表格渲染到指定的容器里
    parent: "selector",
    // 数据用于实例化DataStore组件对象
    data: {
        rows: [],
        head: {},
        foot: {}
    },
    // 用于构造column实例。每一项都column实例或构建实例的参数
    columns: [],
    // TAble.Header组件的一个实例
    header: header
    // TAble.Footer组件的一个实例
    footer: footer
};
var table = new TAble(cfg);
// 渲染table到页面中
// 同时会调用column/header/footer的render以及绑定注册的事件
table.render();
// 更新指定索引的行显示。index就是dataStore组件配置的dataIndex key对应的值。
// data是用于更新表格行显示需要的数据。在渲染之前会与之前的数据进行一次深度合并。deepMix
// 用新的数据渲染出新的行结构以后，会替换掉老的行结构。
table.updateRowView(index, data);
// 通过行数据来查找 行节点（tr元素）
// 这里的data数据必须是带有uid的数据。
table.getRowByData(data);
// 根据列标识获取column对象
table.getColumnByName(name);
```