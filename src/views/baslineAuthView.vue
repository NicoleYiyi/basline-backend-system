<template>
  <div class="auth-page">
    <img
      class="login-logo"
      src="/images/Basline-LOGO-01.svg"
      alt="Basline logo"
    >
    <form
      class="logform"
      @submit.prevent="handleLogin"
    >
      <div class="role-options">
        <label
          v-for="option in roleOptions"
          :key="option.value"
          class="role-option"
          :class="{ active: form.role === option.value }"
        >
          <input
            v-model="form.role"
            type="radio"
            name="role"
            :value="option.value"
          >
          {{ option.label }}
        </label>
      </div>
      <div>
        <label for="account"><h5>帳號：</h5></label>
        <input
          id="account"
          v-model="form.account"
          type="text"
          autocomplete="username"
          required
        >
      </div>
      <div>
        <label for="password"><h5>密碼：</h5></label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          autocomplete="current-password"
          required
        >
      </div>
      <p
        v-if="errorMessage"
        class="error-message"
      >
        {{ errorMessage }}
      </p>
      <button
        type="submit"
        :disabled="isLoading"
      >
        {{ isLoading ? '登入中...' : '登入' }}
      </button>
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
  import { onMounted, onUnmounted, reactive, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { danceStudioSdk } from '@/api/baslineApi.js';
  const router = useRouter()
  const form = reactive({
    account: '',
    password: '',
  })
  const isLoading = ref(false)
  const errorMessage = ref('')
  
  async function handleLogin() {
    errorMessage.value = ''

    const account = form.account.trim()
    const password = form.password

    if (!account || !password) {
      errorMessage.value = '請輸入帳號與密碼'
      return
    }

    isLoading.value = true

    try {
      const auth = await danceStudioSdk.login(account, password, form.role)
      const user = auth.data || {}

      if (user.accessToken) {
        localStorage.setItem('token', user.accessToken)
      }
      if (user.refreshToken) {
        localStorage.setItem('refreshToken', user.refreshToken)
      }
      if (user.roles) {
        localStorage.setItem('authRole', JSON.stringify(user.roles))
      }

      if (user.id || user.name) {
        localStorage.setItem('user', JSON.stringify(user))
      }

      router.push(router.currentRoute.value.query.redirect || { name: 'baslineHome' })
    } catch (error) {
      errorMessage.value = error?.message || '登入失敗，請稍後再試'
    } finally {
      isLoading.value = false
    }
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
      name: 'BaslineAuthView',
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
  .role-options {
    display: grid;
    grid-template-columns: repeat(2, minmax(120px, 1fr));
    gap: 10px;
    margin: 0 0 24px;
  }
  .role-option {
    border: 1px solid #fff;
    border-radius: 6px;
    color: #fff;
    cursor: pointer;
    font-size: 16px;
    padding: 8px 14px;
    text-align: center;
  }
  .role-option.active {
    background: #fff;
    color: #333;
  }
  .role-option input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
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
    cursor: pointer;
  }
  button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
  .error-message {
    color: #ffb4b4;
    font-size: 16px;
    margin: 20px 0 0;
    text-align: center;
  }
  </style>
  
