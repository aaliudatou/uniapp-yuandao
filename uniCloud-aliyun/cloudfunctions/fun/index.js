let jwt = require('jsonwebtoken')
let db = uniCloud.database({
  throwOnNotFound: false,
})
let appId = 'wx8f22fe8ab2418c6c'
let appSecret = '163171bf5198098964b0eed44c0efa24'
let jwtSecret = 'sbbd123456789876'
exports.main = async (event, context) => {
  //event为客户端上传的参数
  // console.log(event)

  // 获取token（根据code获取token）
  if (event.api === "loginWithMp") {
    // return event.code
    let WxRes = await uniCloud.httpclient.request(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${event.code}&grant_type=authorization_code`, {
        dataType: "json"
      })
    // console log("WxRes:" + WxRes)
    let userId = WxRes.data.openid
    console.log(WxRes)
    let token = 'Bearer' + jwt.sign({
      userId
    }, jwtSecret)
    if (!userId) {
      throw Error(WxRes.data.errmsg)
    }
    let user = await db.collection('user').doc(userId).get()

    if (user.data[0]) {
      return {
        user: user.data[0],
        token
      }
    } else {
      let data = {
        _id: userId,
        createdAt: Date.now()
      }
      await db.collection('uesr').add(data)
      return {
        user: data,
        token
      }
    }
  }

  // if (!event.token) {
  //   throw Error('未登录')
  // }
  let auth = jwt.verify(event.token.replace('Bearer', ''), jwtSecret)
  let userId = auth.userId

  // 发布留言接口
  if (event.api === "publish") {
    return await db.collection("message").add({
      content: event.content,
      public: false,
      userId
    })
  }

  // 获取留言接口
  if (event.api === "getMessage") {
    return await db.collection("message").where({
      public: true
    }).get()
  }


  // 获取自己的留言列表
  if (event.api === "getMyMessage") {
    return await db.collection("message").where({
      userId
    }).get()
  }


};