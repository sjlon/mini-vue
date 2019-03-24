/**
 * Vue的构造函数
 */
class Vue {
    constructor (options = {}) {
        // 挂载属性
        this.$el = options.el
        this.$data = options.data
        this.$methods = options.methods

        new Observe(this.$data)
        //吧data中数据代理到vm上，吧methods代理到vm上

        this.proxy(this.$data)
        this.proxy(this.$methods)
        // 对el解析
        if (this.$el) {
            // compile解析模板内容
            new Compile(this.$el, this)
        }
    }

    proxy (data) {
        Object.keys(data).forEach(key => {
            Object.defineProperty(this, key, {
                enumerable: true,
                configurable: true,
                get () {
                    return data[key]
                },
                set (newValue) {
                    if (data[key] === newValue) return
                    data[key] = newValue
                }
            })
        })
    }
}
