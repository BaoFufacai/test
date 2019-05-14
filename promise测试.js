// Promise自定义模块
(function (window) {
  //创建promise构造函数
  function Promise(excutor) {
    const self=this //缓存this
    self.status='pending'//初始状态
    self.data='undefined'//用来定义初始数据
    self.callbacks=[]//用来存储所有成功和失败的回调函数

    //定义成功调用函数
    function resolve(value){
      //判断是否为pending状态数据，是就操作
      if(self.status==='pending'){
        self.status='resolved'//成功状态值
        self.data=value//成功数据
        //执行所有回调函数中的成功回调让他立即异步执行,
        setTimeout(()=>{
          self.callbacks.forEach(cbObj=>cbObj.onResolved(value))
        })
      }
    }
    function reject(reason){
      //判断
      if(self.status==='pending'){
        self.status='rejected'//失败状态
        self.data=reason//失败数据
        //执行失败状态
        setTimeout(()=>{
          self.callbacks.forEach(cbObj=>cbObj.onRejected(reason))
        })
      }
      //立即执行同步执行excutor函数
      try {
        excutor(resolve,reject)
      }catch (error) {//捕获异常
        reject(error)
      }
    }
    //立即同步执行函数
    excutor()
  }

  //创建原型then方法
  Promise.prototype.then=function (onResolved,onRejected) {
    const self=this//保持this
    const {status}=self//得到当前数据
    let Promise2
    // 如果onResolved/onRejected不是函数, 专门指定一个函数
    onResolved =typeof onResolved==='function'?onResolved:value=>value
    onRejected =typeof onRejected==='function'?onRejected:reason=>{throw reason}

    //通用处理函数
    function handle(callbacks,resolve,reject) {
      try {
        const result=callbacks(self.data)
        if(result instanceof Promise){
          result.then(resolve ,reject)
        }else {
          resolve(result)
        }
      }catch (error) {
        reject(error)
      }
    }
    //判断是否成功回调
    if(status==='resolved'){
      Promise2 =new Promise((resolve,reject)=>{
        //立即异步调用成功回调
        setTimeout(()=>{
          handle(callbacks,resolve,reject)
        })
      })
    }else if(status==='rejected'){
      Promise2=new Promise((resolve,reject)=>{
        setTimeout(()=>{
          handle(callbacks,resolve,reject)
        })
      })

    }else {
     Promise2=new Promise((resolve,reject)=>{
       //将回调函数保存起来
       self.callbacks.push({
         onResolved(value){
           handle(onResolved,resolve,reject)

         },
         onRejected(reason){
           handle(onRejected,resolve,reject)
         }
       })
     })
    }
    return Promise
  }
  //失败的回调函数
  Promise.prototype.catch=function (onRejected) {
    return this.then(null, onRejected)

  }

 //给函数对象添加成功方法
  Promise.resolve=function (value) {
    //返回一个指定了成功结果原因的promise对象
    return new Promise((resolve,reject)=>{
      // 如果接收的value是一个promise, 将这个promise结果作为返回promise的结果
      if(value instanceof Promise){
        value.then(resolve,reject)
      }else {
        resolve(value)
      }

    })

    
  }
  Promise.reject=function (reason) {
    //返回一个指定了失败结果原因的promise对象
    return new Promise((resolve,reject)=>{
      reject(reason)
    })

  }
  //给所有的promise调用返回
  Promise.prototype.all=function (promises) {
    const length=promises.length
    let resolvedCount = 0 // 保存已成功promise的个数
    const value=new Array(length) // 保存所有promise成功数据的数组
    return new Promise((resolve,reject)=>{
      //遍历所有Promise对象
      promises.forEach((p,index)=>{
        // promises数组中的元素可能不是promise
        Promise.resolve(p).then(
          value=>{
            // 保存成功的数据
            values[index] = value
            resolvedCount++
            //// 当所有promise都成功了
            if (resolvedCount===length) {
              resolve(values)
            }
          }
        reason => {
          reject(reason)
        }
        )
      })
    })
  }
window.Promise=Promise
})(window)





