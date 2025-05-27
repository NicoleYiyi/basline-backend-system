<template>
    <form @submit.prevent="handleLogin">
      <div>
        <label for="email">電子郵件：</label>
        <input v-model="form.email" id="email" type="email" required />
      </div>
      <div>
        <label for="password">密碼：</label>
        <input v-model="form.password" id="password" type="password" required />
      </div>
      <button type="submit">登入</button>
    </form>
  </template>
  
  <script setup>
  import { reactive } from 'vue'

  const form = reactive({
    email: '',
    password: ''
  })
  
  function handleLogin() {
    console.log('登入資料：', form)
    // 可以加上 API 呼叫
  }
  </script>
  