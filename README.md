# Brix BiSheng

纯粹的数据双向绑定库。

### 安装 <small>Install</small>

```sh
$ bower install --save brix-bisheng'
```

### 用法 <small>Usage</small>

```js
// 配置 Brix BiSheng 和依赖库
require.config({
    paths: {
        jquery: 'bower_components/jquery/dist/jquery',
        underscore: 'bower_components/underscore/underscore',
        handlebars: 'bower_components/handlebars/handlebars'
        'brix/bisheng': 'bower_components/brix-bisheng/dist/bisheng'
    }
})
// 加载 Brix BiSheng
require(['jquery', 'brix/bisheng'], function($, BiSheng){
    // HTML 模板
    var tpl = '{{title}}'
    // 数据对象
    var data = {
      title: 'foo'
    }
    // 执行双向绑定
    BiSheng.bind(data, tpl, function(content){
        // 然后在回调函数中将绑定后的 DOM 元素插入文档中
        $('div.container').append(content)
    });
    // 改变数据 data.title，对应的文档区域会更新
    BiSheng.apply(function() {
        data.title = 'bar'
    })
})
```

### 方法 <small>Methods</small>

共计 6 个公开方法：

* BiSheng.bind( data, tpl, callback )
* BiSheng.unbind( data, tpl )
* BiSheng.watch( data, properties, fn( change ) )
* BiSheng.unwatch( data, fn )
* BiSheng.apply( fn )
* BiSheng.auto( bool )


#### BiSheng.bind( data, tpl, callback( content ) )

在 HTML 模板 `tpl` 和数据 `data` 之间执行双向绑定。

* **BiSheng.bind( data, tpl [, callback( content ) ] )**
    * BiSheng.bind( data, tpl, callback( content ) )
    * BiSheng.bind( data, tpl, context )
    * BiSheng.bind( data, tpl )
* **BiSheng.bind( data, tpl, options )**
    * BiSheng.bind( data, tpl, options )

**参数的含义和默认值**如下所示：

* `data` 必选。待绑定的对象或数组。
* `tpl` 必选。待绑定的 HTML 模板。在绑定过程中，会先把 HTML 模板转换为 DOM 元素，然后将数据“绑定”到 DOM 元素。目前只支持 Handlebars.js 语法。
* `callback( content )` 必选。回调函数，当绑定完成后被执行。执行该函数时，会把转换后的 DOM 元素作为参数 `content` 传入。该函数的上下文（即关键字 `this`）是参数 `data`。
    * `content` 数组，其中包含了转换后的 DOM 元素。
* `context` 可选。容器元素，可以是单个 DOM 元素，或 DOM 元素数组，或选择器表达式。转换后的 DOM 元素将被插入该参数中。
* `options` 可选。对象，其中可以包含三种回调函数：`resolve`、`before`、`after`，格式为：

    ```js
    {
        resolve: function(content) {},
        before: function(changes) {},
        after: function(changes) {},
    }
    ```

    * `resolve( content )` 当绑定完成后被执行，同前面的 `callback( content )`。
    * `before( changes )` 每次更新页面元素前被执行。
        * `changes` 数组，其中包含了待更新的页面元素以及更新方式。格式为：

            ```js
            [
                {
                    type: 'update_block',
                    target: element
                },
                ...
            ]
            ```

            其中，属性 `type` 是 `add|delete|update` 之一 和 `text|attribute|block` 之一的组合，中间用下划线 `_` 连接。

    * `after( changes )` 每次更新页面元素后被执行。
        * `changes` 同 `before( changes )`。

**使用示例**如下所示：

```js
// HTML 模板
var tpl = '{{title}}'
// 数据对象
var data = {
  title: 'foo'
}
// 执行双向绑定
BiSheng.bind(data, tpl, function(content){
    // 然后在回调函数中将绑定后的 DOM 元素插入文档中
    $('div.container').append(content)
});
// 改变数据 data.title，对应的文档区域会更新
BiSheng.apply(function(){
    data.title = 'bar'
})
// 解除双向绑定
BiSheng.unbind(data, tpl);
// 再次改变数据 data.title，对应的文档区域不会更新
BiSheng.apply(function(){
    data.title = 'foo'
})
```

#### BiSheng.unbind( data, tpl )

解除数据 `data` 和模板 `tpl` 之间的双向绑定。

* **BiSheng.unbind( data, tpl )**

    解除数据 `data` 和模板 `tpl` 之间的双向绑定。

* BiSheng.unbind( data )

    解除数据 `data` 与所有模板之间的双向绑定。

**参数的含义和默认值**如下所示：

* `data` 必选。待解除绑定的对象或数组。
* `tpl` 可选。待解除绑绑定的 HTML 模板。

使用示例见 BiSheng.bind( data, tpl, callback( content ) )。


#### BiSheng.watch( data, properties, handler( change ) )

为一个或一组或所有属性添加监听函数。
<!--Attach default handler function to all properties.-->

* BiSheng.watch( data, handler( changes ) )
* BiSheng.watch( data, property, handler( change ) )
* BiSheng.watch( data, properties, handler( change ) )

**参数的含义和默认值**如下所示：

* `data` 必选。指向待监听的对象或数组。
* `property` 可选。字符串，表示待监听的单个属性。
* `properties` 可选。字符串数组，表示待监听的多个属性。
* `handler( change )` 必选。监听函数，当属性发生变化时被执行。
    
    * `change` 一个对象，格式为：

        ```json
        {
            type: 'add/delete/update',
            path: [,,],
            value: newValue,
            oldValue: oldValue
        }
        ```

    * changes 是一个数组，格式为：
        
        ```json
        [
            {
                type: 'add',
                path: [,,],
                value: newValue
            },{
                type: 'delete',
                path: [,,],
                value: oldValue
            }, {
                type: 'update',
                path: [,,],
                value: newValue,
                oldValue: oldValue
            }
        ]
        ```

**使用示例**如下所示：

```js
var data = { foo: 'foo' }
BiSheng.watch(data, function(changes){
    console.log(JSON.stringify(changes, null, 4))
})
data.foo = 'bar'
// =>
[
    {
        "type": "update",
        "path": [
            3,
            "foo"
        ],
        "value": "bar",
        "oldValue": "foo",
        "root": {
            "foo": "bar"
        },
        "context": {
            "foo": "bar"
        }
    }
]

setTimeout(function(){
    BiSheng.unwatch(data)
    data.foo = 'foo'
    // => 
}, 1000)
```

#### BiSheng.unwatch( data, handler )

移除监听函数。

* **BiSheng.unwatch( data, handler )**
    
    移除对象或数组 `data` 上绑定的监听函数 `handler`。

* **BiSheng.unwatch( data )**

    移除对象或数组 `data` 上绑定的所有监听函数。

* **BiSheng.unwatch( handler )**

    全局移除监听函数 `handler`。


**参数的含义和默认值**如下所示：

* `data` 可选。待移除监听函数的对象或数组。
* `handler` 可选。待移除的监听函数。

使用示例见 BiSheng.watch( data, properties, handler( change ) )。


#### BiSheng.apply( handler )

用于包裹对数据的操作。内部会检查数据的变化，并自动同步到视图。

**使用示例**如下所示：

    var data = { foo: 'foo' }
    // ...
    BiSheng.apply(function(){
        data.foo = 'bar'
    })

#### BiSheng.auto( bool )

设置运行模式为自动检测 `true` 或手动触发检测 `false`。

BiSheng 在初始化时，会默认执行 `BiSheng.auto( false )`，即默认设置为手动触发检测，此时，在更新数据时，需要手动调用 `BiSheng.apply( handler )`。

如果希望自动检测，则可以执行 `BiSheng.auto( true )`。
