<template>
    <div class="auth-page">
      <div class="tabs">
        <button @click="activeTab = 'login'" :class="{ active: activeTab === 'login' }">登入</button>
        <button @click="activeTab = 'register'" :class="{ active: activeTab === 'register' }">註冊</button>
      </div>
  
      <div class="form-container">
        <LoginForm v-if="activeTab === 'login'" />
        <RegisterForm v-else />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import LoginForm from '@/components/baslineLoginForm.vue'
  import RegisterForm from '@/components/baslineRegisterForm.vue'
  
  const activeTab = ref('login')
  </script>
  <script>
  export default {
      name: 'baslineAuthView',
  };
  </script>
  
  <style scoped>
  .auth-page {
    max-width: 400px;
    margin: 0 auto;
    padding: 2rem;
  }
  .tabs {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
  }
  .tabs button {
    flex: 1;
    padding: 0.5rem;
    background: #eee;
    border: none;
    cursor: pointer;
  }
  .tabs button.active {
    background: #333;
    color: white;
  }
  .form-container {
    border: 1px solid #ccc;
    padding: 1rem;
    border-radius: 4px;
  }
  </style>
  