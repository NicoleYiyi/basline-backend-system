<template>
  <header class="header">
    <a href="/"><img
      class="header-logo"
      src="/images/Basline-LOGO-01.svg"
      alt="Basline logo"
    ><h1>BASlinE 後台系統</h1></a>
    <div class="dropdown">
      <button class="dropbtn">
        帳號 
        <i class="fa fa-caret-down" />
      </button>
      <div class="account-dropdown">
        <a href="/profile">個人資料</a>
        <a
          href="/login"
          @click="logout"
        >登出</a>
      </div>
    </div>
  </header>
</template>

<script>
export default {
    name: "BaslineHeader",
    methods: {
      logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('authRole');
        localStorage.removeItem('user');
      },
    },
};
</script>

<style scoped>
.header {
    background-color: #333;
    color: white;
    padding: 1rem;
    grid-area: header;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
}
.header-logo{
    width: 40px;
    display: inline;
    float: left;
    margin: 0 10px 0 0;
}
h1{
    font-size: 32px;
    line-height: 120%;
    margin:0;
}
.dropdown{
  float: left;
  overflow: hidden;
}
.dropdown .dropbtn {
  font-size: 16px;  
  border: none;
  outline: none;
  color: white;
  padding: 14px 16px;
  background-color: inherit;
  font-family: inherit;
  margin: 0;
}
.account-dropdown {
  display: none;
  position: absolute;
  background-color: #f9f9f9;
  width: max-content;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
}
.account-dropdown a {
  float: none;
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  text-align: left;
}
.account-dropdown a:hover {
  background-color: #ddd;
}
.dropdown:hover .account-dropdown {
  display: block;
  transform: translate(-20px, 0px);
}
button{
    width: fit-content;
    height: fit-content;
    font-size: 16px;
    line-height: 120%;
    padding: 10px 15px;
    border-radius: 35px;
    background: rgba(0,0,0,0);
    color: #fff;
    border: 1px solid #fff;
    cursor: pointer;
}
a{
    color:#fff;
    text-decoration: none;
}
</style>
  
