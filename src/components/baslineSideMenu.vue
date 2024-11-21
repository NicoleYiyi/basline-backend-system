<template>
    <aside class="side-menu">
      <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Services</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </aside>
</template>

<script>
export default {
    name: "baslineSideMenu",
};
</script>
  
<style scoped>
.side-menu {
    width: 200px;
    background-color: #f4f4f4;
    padding: 1rem;
    position: relative;
    height: 79vh;
}
.side-menu ul {
    list-style: none;
    padding: 0;
}
.side-menu li {
    margin: 1rem 0;
}
.side-menu a {
    color: #333;
    text-decoration: none;
}
</style>
  