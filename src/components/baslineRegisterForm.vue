<template>
  <form @submit.prevent="handleRegister">
    <div>
      <label for="username">使用者名稱：</label>
      <input
        id="username"
        v-model="form.username"
        type="text"
        required
      >
    </div>
    <div>
      <label for="email">電子郵件：</label>
      <input
        id="email"
        v-model="form.email"
        type="email"
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
      註冊
    </button>
  </form>
</template>
  
  <script setup>
  import { reactive } from 'vue'
  
  const form = reactive({
    username: '',
    email: '',
    password: ''
  })
  
  function handleRegister() {
    console.log('註冊資料：', form)
    // 可以加上 API 呼叫
  }
  </script>
  