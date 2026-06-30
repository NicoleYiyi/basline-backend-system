<template>
  <form @submit.prevent="handleLogin">
    <div>
      <label for="account">帳號：</label>
      <input
        id="account"
        v-model="form.account"
        type="account"
        required
      >
    </div>
    <div>
      <label for="password">密碼：</label>
      <input
        id="password"
        v-model="form.password"
        type="password"
        required
      >
    </div>
    <button type="submit">
      登入
    </button>
  </form>
</template>
  
  <script setup>
  import { reactive } from 'vue'

  const form = reactive({
    account: '',
    password: ''
  })
  
  function handleLogin() {
    console.log('登入資料：', form)
    // 可以加上 API 呼叫
  }
  </script>
  