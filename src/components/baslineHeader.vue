<template>
    <header class="header">
      <a href="/"><h1>BASlinE 後台系統</h1></a>
      <a href="/auth"><button>Account</button></a>
    </header>
</template>

<script>
export default {
    name: "baslineHeader",
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
h1{
    font-size: 32px;
    line-height: 120%;
}
button{
    width: fit-content;
    height: fit-content;
    font-size: 18px;
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
    width:fit-content;
}
</style>
  