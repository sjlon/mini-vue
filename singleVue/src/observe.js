/**
 * 给所有的data数据添加getter、setter
 *
 * @class Observe
 */
class Observe {
    constructor (data) {
        this.data = data
        this.walk(data)
    }

    /**
     * 遍历data数据，添加getter/setter
     */

    walk (data) {
        if (!data || typeof data !== 'object') return
        Object.keys(data).forEach(key => {
            this.defineReactive(data, key, data[key])
            // 递归
            this.walk(data[key])
        })
    }
    // data中的每一个数据都应该维护一个dep对象， dep保存了所有订阅该数据的订阅者
    defineReactive (obj, key, value) {
        let self = this
        let dep = new Dep()
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get () {
                // dep.target中有watcher对象，将它存储到订阅者数组中
                Dep.target && dep.addSub(Dep.target)
                console.log('获取了' + value)
                return value
            },
            set (newVal) {
                if (value === newVal) return
                console.log('设置了值')
                value = newVal
                // 如果newVal也是一个对象，对齐做数据劫持
                self.walk(newVal)

                // 调用watcher的update的方法   === 的

                // 发布通知订阅者
                dep.notify()

            }
        })
    }

}
