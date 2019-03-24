/**
 * watch负责将observe和compile关联起来
 */

 class Watcher {
     // vm： vue实例  expr： data中数据名字  cb：数据改变的操作
    constructor (vm, expr ,cb) {
        this.vm = vm
        this.expr = expr
        this.cb = cb
        // this是新创建的watcher对象
        //将this存到target属性上
        Dep.target = this

    // 将expr的旧值存储起来
        this.oldValue = this.getVmValue(vm, expr)

        // 清空dep.target
        Dep.target = null
    }
    // 对外暴露的方法，用于更新页面
    update () {
        let oldValue = this.oldValue
        let newValue = this.getVmValue(this.vm, this.expr)
        if (oldValue !== newValue) {
            this.cb(newValue, oldValue)
        }
    }
    // 获取vm数据
    getVmValue (vm, expr) {
        let data = vm.$data
        expr.split('.').forEach(item => {
            data = data[item]
        })
        return data
    }
 }

 /**
  *  Dep用于管理所有的订阅者
  */
 class Dep {
     constructor () {
         this.subs = [] // 存储订阅者
     }
     // 添加订阅者
     addSub (watcher) {
         this.subs.push(watcher)
     }
     // 通知
     notify () {
        //  遍历所有订阅者，调用watcher的update方法
        this.subs.forEach(sub => {
            sub.update()
        })
     }

 }
