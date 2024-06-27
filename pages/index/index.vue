<template>
  <view class="content">
    <view class="text-area">
      <input v-model="content" placeholder="请输入留言" />
      <button @click="publish()" size="mini" type="primary">发布</button>
      <button @click="getList('getMyMessage')" size="mini" type="primary">我的留言</button>
    </view>
    <view class="listContainer" v-for="item in list" :key="item._id">
      <view class="list">
        <view class="listItem">{{item.content}}</view><br />
        <view class="listItem" v-if="!item.public">未公开</view><br />
      </view>

    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        title: 'ss',
        content: "",
        list: [],
        code: ""
      }
    },
    mounted() {
      // 获取token
      let token = uni.getStorageSync('token')
      console.log('token----' + token)
      if (!token) {
        uni.login({
          success({
            code
          }) {
            console.log("res:---", code)
            if (code) {
              // this.code = res.code
              console.log("code:---", code)
              uniCloud.callFunction({
                name: 'fun',
                data: {
                  api: "loginWithMp",
                  code
                }
              }).then(res => {
                console.log("res:---", res.result.token)
                token = res.result.token;
                console.log("token:---", token)
                uni.setStorageSync('token', token)
                this.getList()
                // this.$nextTick(() => {
                //   this.$refs.popup.getList()
                // })
              }).catch(err => {
                console.log("err:---", err)
              })
            } else {
              console.log('获取code失败' + res.errMsg)
            }
          }
        })
      } else {
        this.getList()
      }
    },
    onUnload() {
      // clearInterval(this.timer)
    },
    methods: {
      // 获取留言列表
      getList(api) {
        uniCloud.callFunction({
          name: "fun",
          data: {
            api: api || "getMessage",
            token: uni.getStorageSync('token')
          }
        }).then(res => {
          console.log(res)
          this.list = res.result.data
        })
      },
      // 获取时间
      changeTime() {
        this.title = new Date().toLocaleString()
      },
      // 发布留言
      publish(api) {
        console.log("点击了")
        uniCloud.callFunction({
          name: "fun",
          data: {
            api: api || "publish",
            content: this.content,
            token: uni.getStorageSync('token')
          }
        }).then(res => {
          console.log(res)
          // this.list.push({
          //   _id: res.result.id,
          //   content: this.content
          // })
          uni.showToast({
            title: "留言成功",
            icon: "success"
          })
          this.content = ""
        })
      }
    }
  }
</script>

<style>
  .content {
    /* display: flex; */
    /* flex-direction: column; */
    align-items: center;
    /* justify-content: center; */
    margin: "40rpx";
  }

  input {
    border-bottom: 1px solid #ccc;
    padding: 6rpx;
    flex: 1;
  }

  .logo {
    height: 200rpx;
    width: 200rpx;
    margin-top: 200rpx;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 50rpx;
  }

  .text-area {
    display: flex;
    justify-content: center;
  }

  .title {
    font-size: 36rpx;
    color: #8f8f94;
  }

  .listItem {
    margin: 15rpx;
    border-bottom: 1px solid #ccc;
  }
</style>