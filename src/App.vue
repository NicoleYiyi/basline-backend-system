<template>
  <div
    id="baslineapp"
    :class="{ 'auth-layout': !showLayout }"
  >
    <Header v-if="showLayout" />
    <SideMenu v-if="showLayout" />
    <main class="content">
      <router-view />
    </main>
    <Footer v-if="showLayout" />
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
  computed: {
    showLayout() {
      return this.$route.name !== 'baslineAuthView';
    },
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
#baslineapp.auth-layout {
  display: block;
}
</style>
