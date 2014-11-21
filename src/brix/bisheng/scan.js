/* global define */
/*
    # Scanner

    扫描 DOM 元素，解析定位符

*/
define(
    [
        'jquery', 'underscore',
        './loop', './locator'
    ],
    function(
        $, _,
        Loop, Locator
    ) {

        // 入口方法
        function scan(node, data) {
            // data > dom, expression
            scanNode(node)

            // dom > data
            scanFormElements(node, data)
        }

        // 扫描单个节点，包括：属性，子节点。
        function scanNode(node) {
            switch (node.nodeType) {
                case 1: // Element
                case 9: // Document
                case 11: // DocumentFragment
                    scanAttributes(node)
                    scanChildNode(node)
                    break
                case 3: // Text
                    scanTexNode(node)
                    break
            }
        }

        /*
            扫描文本节点
        */
        function scanTexNode(node) {
            var text = node.textContent || node.innerText || node.nodeValue
            var contents = $('<div>' + text + '</div>').contents()
            _.each(contents, function(elem /*, index*/ ) {
                Locator.update(elem, {
                    type: 'text'
                })
            })
            contents.replaceAll(node)
        }

        /*
            扫描属性
        */

        var AttributeHooks = {
            'bs-style': {
                name: 'style',
                setup: function() {},
                teardown: function(node, value) {
                    $(node).attr('style', value)
                }
            },
            'bs-src': {
                name: 'src',
                setup: function() {},
                teardown: function(node, value) {
                    $(node).attr('src', value)
                }
            },
            'bs-checked': {
                name: 'checked',
                setup: function() {},
                teardown: function(node, value) {
                    if (value === 'true') $(node).attr('checked', 'checked')
                }
            }
        };

        function scanAttributes(node) {
            var reph = Locator.getLocatorRegExp()
            var restyle = /([^;]*?): ([^;]*)/ig

            var attributes = []
            _.each(
                // “Array.prototype.slice: 'this' is not a JavaScript object” error in IE8
                // slice.call(node.attributes || [], 0)
                function() {
                    var re = []
                    var all = node.attributes
                    for (var i = 0; i < all.length; i++) {
                        /*
                            Fixes bug:
                            在 IE6 中，input.attributeNode('value').specified 为 false，导致取不到 value 属性。
                            所以，增加了对 nodeValue 的判断。
                        */
                        if (all[i].specified || all[i].nodeValue) re.push(all[i])
                    }
                    return re
                }(),
                function(attributeNode /*, index*/ ) {

                    var nodeName = attributeNode.nodeName,
                        nodeValue = attributeNode.nodeValue,
                        ma, stylema, hook;

                    nodeName = nodeName.toLowerCase()
                    hook = AttributeHooks[nodeName]
                    nodeName = hook ? hook.name : nodeName

                    if (nodeName === 'style') {
                        restyle.exec('')
                        while ((stylema = restyle.exec(nodeValue))) {
                            reph.exec('')
                            while ((ma = reph.exec(stylema[2]))) {
                                attributes.push(
                                    Locator.update($('<div>' + ma[1] + '</div>').contents()[0], {
                                        type: 'attribute',
                                        name: nodeName,
                                        css: $.trim(stylema[1])
                                    }, true)
                                )
                            }
                        }

                    } else {
                        reph.exec('')
                        while ((ma = reph.exec(nodeValue))) {
                            attributes.push(
                                /*
                                    Fixes bug:
                                    在 IE6 中，占位符中的空格依然是 `%20`，需要手动转义。
                                */
                                Locator.update($('<div>' + decodeURIComponent(ma[1]) + '</div>').contents()[0], {
                                    type: 'attribute',
                                    name: nodeName
                                }, true)
                            )
                        }
                    }

                    if (attributes.length) {
                        nodeValue = nodeValue.replace(reph, '')
                        attributeNode.nodeValue = nodeValue
                        _.each(attributes, function(elem /*, index*/ ) {
                            var slot = Locator.parse(elem, 'slot')
                            if (slot === 'start') $(node).before(elem)
                            if (slot === 'end') $(node).after(elem)
                        })
                    }

                    if (hook) hook.teardown(node, nodeValue)
                }
            )
        }

        // 扫描子节点
        function scanChildNode(node) {
            _.each([].slice.call(node.childNodes), function(childNode /*, index*/ ) {
                scanNode(childNode)
            })
        }

        // 扫描表单元素
        function scanFormElements(node, data) {
            var locators = Locator.find({
                slot: "start",
                type: "attribute",
                name: "value"
            }, node)
            _.each(locators, function(locator /*, index*/ ) {
                var path = Locator.parse(locator, 'path').split('.'),
                    target = Locator.parseTarget(locator)[0];

                // TODO 为什么不触发 change 事件？
                $(target).on('change.bisheng keyup.bisheng', function(event) {
                    updateValue(data, path, event.target)
                    if (!Loop.auto()) Loop.letMeSee()
                })
            })

            _.each(Locator.find({
                    slot: "start",
                    type: "attribute",
                    name: "checked"
                }, node),
                function(locator) {
                    var path = Locator.parse(locator, 'path').split('.'),
                        target = Locator.parseTarget(locator)[0];

                    var value = data
                    for (var index = 1; index < path.length; index++) {
                        value = value[path[index]]
                    }
                    // 如果 checked 的初始值是 false 或 "false"，则初始化为未选中。
                    if (value === undefined || value.valueOf() === false || value.valueOf() === 'false') {
                        $(target).prop('checked', false)
                    }
                    if (value !== undefined &&
                        (value.valueOf() === true || value.valueOf() === 'true' || value.valueOf() === 'checked')) {
                        $(target).prop('checked', true)
                    }

                    // jQuery
                    $(target).on('change.bisheng', function(event, firing) {
                        // radio：点击其中一个后，需要同步更新同名的其他 radio
                        if (!firing && event.target.type === 'radio') {
                            $('input:radio[name="' + event.target.name + '"]')
                                .not(event.target)
                                .trigger('change.bisheng', firing = true)
                        }
                        updateChecked(data, path, event.target)
                        if (!Loop.auto()) Loop.letMeSee()
                    })
                })
        }

        /*
            更新属性 value 对应的数据
            TODO:
                input 
                    radio checkbox
                select
                    multi?
                textarea
         */

        var updateValueHooks = {
            text: function($target) {
                $target.data('user is editing', true)
                return $target.val()
            },
            radio: function( /*$target*/ ) {
                return false
            },
            checkbox: function( /*$target*/ ) {
                return false
            },
            _default: function($target) {
                return $target.val()
            }
        };

        function updateValue(data, path, target) {
            for (var index = 1; index < path.length - 1; index++) {
                data = data[path[index]]
            }

            var hook = updateValueHooks[target.type] ||
                updateValueHooks[target.nodeName.toLowerCase()] ||
                updateValueHooks._default
            var value = hook($(target))

            if (value !== false) data[path[path.length - 1]] = value
        }

        /*
            更新属性 checked 对应的数据
            TODO:
                input
                    radio
                    checkbox
        */

        var updateCheckedHooks = {
            radio: function($target, data) {
                var name = $target.attr('name')
                var value = $target.prop('checked')
                if (name && value && name in data) data[name] = $target.val()
                return value
            },
            checkbox: function($target /*, data*/ ) {
                return $target.prop('checked')
            },
            _default: function( /*$target, data*/ ) {}
        };

        function updateChecked(data, path, target) {
            for (var index = 1; index < path.length - 1; index++) {
                data = data[path[index]]
            }
            var hook = updateCheckedHooks[target.type] || updateCheckedHooks[target.nodeName.toLowerCase()] || updateCheckedHooks._default
            var value = hook($(target), data)
            if (value !== undefined) data[path[path.length - 1]] = value
        }

        return {
            scan: scan
        }

    }
)