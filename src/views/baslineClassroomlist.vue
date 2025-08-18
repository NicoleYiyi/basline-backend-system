<template>
    <div>
      <h2>教室清單</h2>
      <button class="addbtn" @click="showPopup = true">新增教室</button>
      <BaslinePopup v-model="showPopup">
        <h3>新增教室</h3>
        <h5>教室名稱： {{ message }}<input v-model="message" placeholder="教室名稱" /></h5>
        <h5>所屬會館： {{ message }}<input v-model="message" placeholder="會館名稱" /></h5>
        <h5>可容納名額： {{ message }}<input v-model="message" placeholder="可容納名額(5-100)" /></h5>
      </BaslinePopup>
      <table>
        <tr>
            <th><h4>教室名稱</h4></th>
            <th><h4>所屬會館</h4></th>
            <th><h4>可容納名額</h4></th>
        </tr>
        <tr>
            <td>1</td>
            <td>2</td>
            <td>3</td>
        </tr>
      </table>
    </div>
</template>

<script>
export default {
    name: 'baslineClassroomlist',
};
</script>

<script setup>
import { ref } from 'vue'
import BaslinePopup from '@/components/baslinePopup.vue';

const showPopup = ref(false)
</script>

<style scoped>
th,td{
    width:33.3%;
    text-align:left;
    padding:5px;
}
th{
    background-color:#252525;
}
h4{
    margin:0;
    color:#fff;
}
</style>