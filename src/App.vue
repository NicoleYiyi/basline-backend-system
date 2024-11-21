<template>
  <div id="app">
    <Header />
    <SideMenu />
    <main class="content">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script>
import Header from './components/baslineHeader.vue';
import Footer from './components/baslineFooter.vue';
import SideMenu from './components/baslineSideMenu.vue';

export default {
  name: 'App',
  components: {
    Header,
    Footer,
    SideMenu,
  },
};
</script>

<style>
#app {
  display: flex;
  flex-direction: column;
}
.content {
  margin-left: 200px; /* Offset by SideMenu width */
  padding: 1rem;
  flex-grow: 1;
}
</style>
