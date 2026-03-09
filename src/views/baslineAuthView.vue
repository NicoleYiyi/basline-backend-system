<template>
    <div class="auth-page">
      <img class="login-logo" src="/images/Basline-LOGO-01.svg" alt="Basline logo">
      <form @submit.prevent="handleLogin" class="logform">
        <div>
          <label for="account"><h5>帳號：</h5></label>
          <input v-model="form.account" id="account" type="account" required />
        </div>
        <div>
          <label for="password"><h5>密碼：</h5></label>
          <input v-model="form.password" id="password" type="password" required />
        </div>
        <button type="submit">登入</button>
      </form>
      <!-- <div class="tabs">
        <button @click="activeTab = 'login'" :class="{ active: activeTab === 'login' }">登入</button>
        <button @click="activeTab = 'register'" :class="{ active: activeTab === 'register' }">註冊</button>
      </div>
      <div class="form-container">
        <LoginForm v-if="activeTab === 'login'" />
        <RegisterForm v-else />
      </div> -->
    </div>
  </template>
  
  <script setup>
  // import { ref } from 'vue'
  import { onMounted, onUnmounted, reactive } from 'vue'
  // import LoginForm from '@/components/baslineLoginForm.vue'
  // import RegisterForm from '@/components/baslineRegisterForm.vue'
  const form = reactive({
    account: '',
    password: ''
  })
  
  function handleLogin() {
    console.log('登入資料：', form)
    // 可以加上 API 呼叫
  }

  const previousBodyBackground = document.body.style.backgroundColor

  onMounted(() => {
    document.body.style.backgroundColor = '#414141'
  })

  onUnmounted(() => {
    document.body.style.backgroundColor = previousBodyBackground
  })

  // const activeTab = ref('login')
  
  </script>
  <script>
  export default {
      name: 'baslineAuthView',
  };
  </script>
  
  <style scoped>
  .login-logo{
    width:173px;
    margin: 100px auto;
    display:block;
  }
  .auth-page {
    margin: 0 auto;
    padding: 2rem;
  }
  .logform{
    display:block;
    width:fit-content;
    margin:0 auto;
  }
  h5{
    font-size:22px;
    color:#fff;
    display: inline-block;
  }
  input#account, input#password {
    background: none;
    border: none;
    border-bottom: 2px solid #ffffff;
    width: 200px;
    height: 35px;
    color: #fff;
    font-size: 22px;
  }
  button {
    display: block;
    margin: 50px auto;
    font-size: 18px;
    border: 2px solid #fff;
    background: none;
    border-radius: 6px;
    color: #fff;
    padding: 5px 20px;
  }
  </style>
  
