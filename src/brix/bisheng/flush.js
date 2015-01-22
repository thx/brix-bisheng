/* global define, console, document, location, setTimeout */
/*
    # Flush
    
    更新 DOM 元素

    * Flush.handle(event, change, defined)
        * Flush.handle.text(path, event, change, defined)
        * Flush.handle.attribute(path, event, change, defined)
        * Flush.handle.block(path, event, change, defined)
    * Flush.scrollIntoView(event, change)
    * Flush.highlight(event, change)

*/
define(
    [
        'jquery', 'underscore', 'handlebars',
        './loop', './scan', './html', './locator'
    ],
    function(
        $, _, Handlebars,
        Loop, Scanner, HTML, Locator
    ) {

        var DEBUG = ~location.search.indexOf('bisheng.debug') && {
            fix: function(arg, len) {
                len = len || 32
                var fix = parseInt(len, 10) - ('' + arg).length
                for (var i = 0; i < fix; i++) arg += ' '
                return arg
            }
        }

        /*
            ## Flush.handle(event, change, defined)

            更新 DOM 元素。其中含有 3 个方法：

            * Flush.handle.text(path, event, change, defined)
                更新文本节点的值。
            * Flush.handle.attribute(path, event, change, defined)
                更新属性的值。
            * Flush.handle.block(path, event, change, defined)
                更新逻辑块的内容。

            **参数的含义和默认值**如下所示：

            * 参数 event：必选。事件对象，初始值如下，其中的数组 target 用于收集需要（被）更新的 DOM 元素：
                    { 
                        target: [] 
                    }
            * 参数 change：必选。事件对象，格式为：
                    {
                        type: 'add/delete/update',
                        path: [guid, , ],
                        value: newValue,
                        oldValue: oldValue
                    }
            * 参数 defined：必选。数据副本，其中的基本类型已被自动装包。
            * 参数 path：script 元素，用作起始定位符，结构为：
                    <script guid="guid", slot="start" type="text|attribute|block" path="guid.property...", ishelper="true|false"></script>
                    
                    > 结束定位符的结构为：

                    <script guid="guid", slot="start" 


        */
        function handle(event, change, defined, context, options) {
            var paths = Locator.find({
                slot: 'start',
                path: change.path.join('.')
            }, context || document.body)

            if ((change.type === 'delete' || change.type === 'add') && change.context instanceof Array) { /*paths.length === 0 && */
                change.path.pop()
                change.type = 'update'
                change.context = change.getContext(change.root, change.path)()
                handle(event, change, defined, context, options)
                return
            }

            // 如果未找到对应的定位符，则试着向上查找
            if (paths.length === 0) {
                return
                /*
                    暂停支持的原因
                    1. 有潜在的性能问题。根属性可能是个大数据，导致需要更新整个模板。
                    2. 覆盖不全面，例如模板中同时出现了：
                        1. {{#hrate rate}}{{/hrate}}
                        2. {{#with rate}} <input value="{{value}}"> min: {{min}}, max: {{max}} {{/with}}
                        此时，只能覆盖到第 2 段，第 1 段依然覆盖不到。
                        如果只出现第 1 段，才会覆盖到第 1 段。
                    3. 向上查找导致的更新可能不符合预期。例如内嵌了 View 或组件。
                 */
                var oldContext = change.getContext(change.shadow, change.path)()
                var oldValue = ('oldValue' in change) ? change.oldValue :
                    (oldContext !== undefined && oldContext !== null) ? oldContext[change.path[change.path.length - 1]] :
                    undefined

                // 向上查找的过程中，如果遇到的属性已经被监听，则停止查找；
                // 如果遇到的属性没有被监听（可能是新增，也可能是 Handlebars helper 中才会用到），则继续。
                if (oldValue !== undefined && oldValue !== null && oldValue.$path) return

                change.path.pop()

                if (change.path <= 1) return

                change.type = 'update'
                change.value = change.context
                change.context = change.getContext(change.root, change.path)()
                change.oldValue = oldContext
                handle(event, change, defined, context, options)
                return
            }

            var type, guid
            _.each(paths, function(path /*, index*/ ) {
                type = Locator.parse(path, 'type')
                guid = Locator.parse(path, 'guid')
                var label
                if (DEBUG) label = DEBUG.fix(guid, 4) + DEBUG.fix(type, 16) + DEBUG.fix(change.path.join('.'), 32)
                if (DEBUG) console.group(label)
                if (DEBUG) console.time(DEBUG.fix(''))
                if (handle[type]) handle[type](path, event, change, defined, options)
                if (DEBUG) console.timeEnd(DEBUG.fix(''))
                if (DEBUG) console.groupEnd(label)
            })
        }

        /*
           更新属性对应的 Expression 
           更新文本节点的值。
        */
        handle.text = function text(locator, event, change, defined, options) {
            var guid = Locator.parse(locator, 'guid')
            var helper = Locator.parse(locator, 'ishelper')
            var target = Locator.parseTarget(locator)
            var content

            if (helper === 'true' || helper === true) {
                content = Handlebars.compile(defined.$helpers[guid])(change.context)
            } else {
                content = change.value
            }

            // TextNode
            if (target.length === 1 && target[0].nodeType === 3) {
                event.target.push(target[0])

                before(options, ['update', 'text'], [target[0]])

                target[0].nodeValue = content

                after(options, ['update', 'text'], [target[0]])

            } else {
                // Element
                if (helper === 'true' || helper === true) {
                    content = Handlebars.compile(defined.$helpers[guid])(change.context)
                } else {
                    content = change.value
                }

                before(options, ['delete', 'block'], target)

                $(target).remove()

                after(options, ['delete', 'block'], target)

                before(options, ['add', 'block'], content)

                /* jshint unused: false */
                content = HTML.convert(content).contents()
                    .insertAfter(locator)
                    .each(function(index, elem) {
                        event.target.push(elem)
                    })

                after(options, ['add', 'block'], content)

            }
        }

        // 更新属性对应的 Expression
        handle.attribute = function attribute(path, event, change, defined, options) {
            var guid = Locator.parse(path, 'guid')
            var helper = Locator.parse(path, 'ishelper')

            var currentTarget, name, $target;
            event.target.push(currentTarget = Locator.parseTarget(path)[0])
            $target = $(currentTarget)

            before(options, ['update', 'attribute'], $target)

            var value, oldValue
            if (helper === 'true' || helper === true) {
                value = Handlebars.compile(defined.$helpers[guid])(change.context)
                oldValue = function() {
                    var oldValue
                    var context = Loop.clone(change.context, true, change.path.slice(0, -1)) // TODO
                    context[change.path[change.path.length - 1]] = (change.oldValue !== undefined && change.oldValue !== null) ? change.oldValue.valueOf() : change.oldValue
                    oldValue = Handlebars.compile(defined.$helpers[guid])(context)
                    return oldValue
                }()

            } else {
                var ast = defined.$blocks[Locator.parse(path, 'guid')]
                value = ast ? Handlebars.compile(ast)(change.context) : change.value
                oldValue = function() {
                    var oldValue
                    var context = Loop.clone(change.context, true, change.path.slice(0, -1)) // TODO
                    context[change.path[change.path.length - 1]] = (change.oldValue !== undefined && change.oldValue !== null) ? change.oldValue.valueOf() : change.oldValue
                    oldValue = ast ? Handlebars.compile(ast)(context) : change.oldValue
                    return oldValue
                }()
            }

            name = Locator.parse(path, 'name')
            switch (name) {
                case 'class':
                    $target.removeClass('' + oldValue).addClass('' + value)
                    break
                case 'bs-style':
                case 'style':
                    $target.css(Locator.parse(path, 'css'), value)
                    break
                case 'value':
                    if ($target.val() !== value && !$target.data('user is editing')) {
                        $target.val(value)
                    }
                    $target.data('user is editing', false)
                    break
                case 'checked':
                    $target.prop(name, value)

                    name = $target.attr('name')
                    if (name && $target.prop('checked') && name in change.context) {
                        // setTimeout(function() {
                        change.context[name] = $target.val()
                            // }, 0)
                    }
                    break
                default:
                    // 只更新变化的部分（其实不准确 TODO）
                    /* jshint unused: false */
                    $target.attr(name, function(index, attr) {
                        return oldValue === undefined ? value :
                            attr !== oldValue.valueOf() ? attr.replace(oldValue, value) :
                            value
                    })
            }

            after(options, ['update', 'attribute'], $target)

        }

        // 更新数组对应的 Block，路径 > guid > Block
        handle.block = function block(locator, event, change, defined, options) {
            var guid = Locator.parse(locator, 'guid')
            var ast = defined.$blocks[guid]

            if (DEBUG) console.time(DEBUG.fix('Loop.clone'))
            var context = Loop.clone(change.context, true, change.path.slice(0, -1)) // TODO
            if (DEBUG) console.timeEnd(DEBUG.fix('Loop.clone'))

            var content = Handlebars.compile(ast)(context)

            if (DEBUG) console.time(DEBUG.fix('HTML.convert'))
            content = HTML.convert(content)
            if (DEBUG) console.timeEnd(DEBUG.fix('HTML.convert'))

            if (DEBUG) console.time(DEBUG.fix('Scanner.scan'))
            Scanner.scan(content[0], change.root)
            if (DEBUG) console.timeEnd(DEBUG.fix('Scanner.scan'))

            content = content.contents()

            var target = Locator.between(locator) // https://github.com/thx/bisheng/issues/14 
                // Locator.parseTarget(locator)
            var endLocator = Locator.find({
                guid: guid,
                slot: 'end'
            }, locator.parentNode)[0]

            // var endLocator = target.length ? target[target.length - 1].nextSibling : locator.nextSibling

            /*
                优化渲染过程：
                1. 移除多余的旧节点
                2. 逐个比较节点类型、节点值、节点内容。
            */

            // 如果新内容是空，则移除所有旧节点
            if (content.length === 0) {

                before(options, ['delete', 'block'], target)
                $(target).remove()

                // 清空开始定位符和结束定位符之间的所有内容
                // Locator.between(locator).remove()

                after(options, ['delete', 'block'], target)

                return
            }
            // 移除旧节点中多余的
            /*
                Fixes Bug
                在 IE8 中调用 array.splice(index , howMany[, element1[, ...[, elementN]]]) 必须传入参数 howMany。
                https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
            */
            if (content.length < target.length) {
                var toRemove = $(target.splice(content.length, target.length - content.length))

                before(options, ['delete', 'block'], toRemove)
                toRemove.remove()
                after(options, ['delete', 'block'], toRemove)
            }

            content.each(function(index, element) {
                // 新增节点
                if (!target[index]) {

                    before(options, ['add', 'block'], [element])
                    endLocator.parentNode.insertBefore(element, endLocator)
                    after(options, ['add', 'block'], [element])

                    event.target.push(element)
                    return
                }
                // 节点类型有变化，替换之
                if (element.nodeType !== target[index].nodeType) {

                    before(options, ['add', 'block'], [element])
                    target[index].parentNode.insertBefore(element, target[index])
                    after(options, ['add', 'block'], [element])

                    before(options, ['delete', 'block'], [target[index]])
                    target[index].parentNode.removeChild(target[index])
                    after(options, ['delete', 'block'], [target[index]])

                    event.target.push(element)
                    return
                }
                // 同是文本节点，则更新节点值
                if (element.nodeType === 3 && element.nodeValue !== target[index].nodeValue) {

                    before(options, ['update', 'text'], [target[index]])
                    target[index].nodeValue = element.nodeValue
                    after(options, ['update', 'text'], [target[index]])

                    return
                }
                // 同是注释节点，则更新节点值
                if (element.nodeType === 8 && element.nodeValue !== target[index].nodeValue) {

                    before(options, ['update', 'text'], [target[index]])
                    target[index].nodeValue = element.nodeValue
                    after(options, ['update', 'text'], [target[index]])

                    return
                }
                // 同是 DOM 元素，则检测属性 outerHTML 是否相等，不相等则替换之
                if (element.nodeType === 1) {
                    // $(target[index]).removeClass('transition highlight')
                    if (element.outerHTML !== target[index].outerHTML) {

                        before(options, ['add', 'block'], [element])
                        target[index].parentNode.insertBefore(element, target[index])
                        after(options, ['add', 'block'], [element])

                        before(options, ['delete', 'block'], [target[index]])
                        target[index].parentNode.removeChild(target[index])
                        after(options, ['delete', 'block'], [target[index]])

                        event.target.push(element)
                        return
                    }
                }
            })
        }

        /*
            如果 URL 中含有参数 scrollIntoView，则自动滚动至发生变化的元素。
            用于调试、演示，或者在项目中提醒用户。
        */
        function scrollIntoView(event /*, change*/ ) {
            if (event.target.nodeType) event.target = [event.target]
            if (!event.target.forEach) return
            event.target.forEach(function(item /*, index*/ ) {
                switch (item.nodeType) {
                    case 3:
                        item.parentNode.scrollIntoView()
                        break
                    case 1:
                        item.scrollIntoView()
                        break
                }
            })
        }

        function highlight(event /*, change*/ ) {
            if (event.target.nodeType) event.target = [event.target]
            if (!event.target.forEach) return
            event.target.forEach(function(item /*, index*/ ) {
                switch (item.nodeType) {
                    /*
                        如果只高亮当前文本节点，需要将当前文本节点用 <span> 包裹
                    */
                    case 3:
                        $(item).wrap('<span>').parent().addClass('transition highlight')
                        setTimeout(function() {
                            $(item).unwrap('<span>').removeClass('transition highlight')
                        }, 500)
                        break
                    case 1:
                        $(item).addClass('transition highlight')
                        setTimeout(function() {
                            $(item).removeClass('transition highlight')
                        }, 500)
                        break
                }
            })
        }

        function before(options, types, targets) {
            notify('before', options, types, targets)
        }

        function after(options, types, targets) {
            notify('after', options, types, targets)
        }

        function notify(dir, options, types, targets) {
            if (options && options[dir]) {
                options[dir](
                    _.map(targets, function(item /*, index*/ ) {
                        return {
                            type: types.join('_'),
                            target: item
                        }
                    })
                )
            }
        }

        return {
            handle: handle,
            scrollIntoView: scrollIntoView,
            highlight: highlight
        }

    }
)