
/**
 * 解析模板内容
 *
 * @class Compile
 */
class Compile {
    // el 模板  vm vue实例
    constructor (el, vm) {
        this.el = typeof el === 'string' ? document.querySelector(el) : el
        this.vm = vm

        if (this.el) {
            // 将节点放入内存中，fragment，在内存中编译   将fragment添加到页面
            let fragment = this.node2fragment(this.el)
            // console.dir(fragment)
            this.compile(fragment)

            this.el.appendChild(fragment)
        }
    }

    /**
     *
     *
     * @param {*} node
     * @returns
     * @memberof Compile
     */
    node2fragment(node) {
        let fragment = document.createDocumentFragment()
        //将el子节点添加到文档碎片中
        let childNodes = node.childNodes
        this.toArray(childNodes).forEach(node => {
            fragment.appendChild(node)
        })
        return fragment
    }
    /**
     * 内存中编译fragment
     *
     * @param {*} fragment
     * @memberof Compile
     */
    compile (fragment) {
        let childNodes = fragment.childNodes
        this.toArray(childNodes).forEach(node => {
            if (this.isElementNode(node)) {
                // 解析指令
                this.compileElement(node)
            }
            if (this.isTextNode(node)) {
                // 解析插值表达式
                this.compileText(node)
            }
            // 如果当前节点还有子节点, 递归
            if (node.childNodes && node.childNodes.length > 0) {
                this.compile(node)
            }
        })
    }

    // 解析html标签
    compileElement (node) {
        let attributes = node.attributes
        this.toArray(attributes).forEach(attr => {
            // v- 开头指令
            let attrName = attr.name
            if (this.isDirective(attrName)) {
                let attrValue = attr.value
                let type = attrName.slice(2)
                // if (type === 'text') {
                //     // node.innerText = this.vm.$data[attrValue]
                //     compileUtil['text'](node, this.vm, attrValue)
                // }
                // if (type === 'html') {
                //     // node.innerHTML = this.vm.$data[attrValue]
                //     compileUtil['html'](node, this.vm, attrValue)
                // }
                // if (type === 'model') {
                //     // node.value = this.vm.$data[attrValue]
                //     compileUtil['model'](node, this.vm, attrValue)
                // }
                // 解析v-on 指令
                if (this.isEventDirective(type)) {
                    compileUtil['eventHandler'](node, this.vm, type, attrValue)

                } else {
                    // 错误处理
                    compileUtil[type] && compileUtil[type](node, this.vm, attrValue)
                }
            }
        })
    }
    // 解析文本
    compileText (node) {
        compileUtil.mustache(node, this.vm)
    }

    toArray (linkArray) {
        return [].slice.call(linkArray)
    }

    isElementNode (node) {
        // nodeType
        return node.nodeType === 1
    }
    isTextNode (node) {
        return node.nodeType === 3
    }
    isDirective (attrName) {
        return attrName.startsWith('v-')
    }
    isEventDirective (type) {
        return type.split(':')[0] === 'on'
    }
}

let compileUtil = {
    mustache (node, vm) {
        let txt = node.textContent
        let reg = /\{\{(.+)\}\}/
        if (reg.test(txt)) {
            let expr = RegExp.$1
            // debugger
            node.textContent = txt.replace(reg, this.getVmValue(vm, expr))

            new Watcher(vm, expr, (newValue, oldValue) => {
                node.textContent = txt.replace(reg, newValue)
            })
        }
    },
    // 处理v-text文本解析
    text (node, vm, attrValue) {
        node.innerText = this.getVmValue(vm, attrValue)
        // 通过watcher监听attrValue的数据的变化
        new Watcher(vm, attrValue, (newValue, oldValue) => {
            node.innerText = newValue
        })
    },
    html (node ,vm , attrValue) {
        // node.innerHTML = vm.$data[attrValue]
        node.innerHTML = this.getVmValue(vm, attrValue)
        new Watcher(vm, attrValue, (newValue, oldValue) => {
            node.innerHTML = newValue
        })
    },
    model (node, vm, attrValue) {
        // node.value = vm.$data[attrValue]
        node.value = this.getVmValue(vm, attrValue)
        let self = this
        // 实现双向数据绑定 node注册input事件，当前value变，修改对应数据
        node.addEventListener('input', function () {
            // vm.$data[attrValue] = this.value
            self.setVmValue(vm, attrValue, this.value)
        })

        new Watcher(vm, attrValue, (newValue, oldValue) => {
            node.value = newValue
        })
    },
    eventHandler (node, vm, type, attrValue) {
        let eventType = type.split(':')[1]
        let fn = vm.$methods && vm.$methods[attrValue]
        // 注册事件，并将this只想vm
        if (eventType && fn) {
            node.addEventListener(eventType, fn.bind(vm))
        }
    },
    // 获取vm的数据
    getVmValue (vm, expr) {
        let data = vm.$data
        expr.split('.').forEach(item => {
            data = data[item]
        })
        return data
    },
    setVmValue (vm, expr, value) {
        let data = vm.$data
        let arr = expr.split('.')
        arr.forEach((key, index) => {
            if (index < arr.length -  1) {
                data = data[key]
            } else {
                data[key] = value
            }
        })
    }
}
