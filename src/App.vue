<template>
  <div id="baslineapp">
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
#baslineapp {
  display: grid;
  grid-template-areas: 
  'header header'
  'sidebar content'
  'footer footer';
  grid-template-columns: 1fr 5fr;
}
.content {
  padding: 1rem;
  flex-grow: 1;
  grid-area: content;
}
</style>
