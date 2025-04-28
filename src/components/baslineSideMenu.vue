<template>
    <aside class="side-menu">
        <ul>
            <li>
                <button @click="toggle('course')">課程管理</button>
                <ul class="side-menu-item" v-show="openItem === 'course'">
                <li><a href="/">團體課表</a></li>
                <li><a href="/">課程清單</a></li>
                </ul>
            </li>
            <li>
                <button @click="toggle('teacher')">教師管理</button>
                <ul class="side-menu-item" v-show="openItem === 'teacher'">
                <li><a href="#">教師清單</a></li>
                </ul>
            </li>
            <li>
                <button @click="toggle('member')">會員管理</button>
                <ul class="side-menu-item" v-show="openItem === 'member'">
                <li><a href="#">會員管理</a></li>
                </ul>
            </li>
            <li>
                <button @click="toggle('activity')">活動管理</button>
                <ul class="side-menu-item" v-show="openItem === 'activity'">
                <li><a href="#">活動管理</a></li>
                </ul>
            </li>
        </ul>
    </aside>
</template>

<script setup>
import { ref } from 'vue'

const openItem = ref(null)

function toggle(item) {
  openItem.value = openItem.value === item ? null : item
}
</script>

<script>
export default {
    name: "baslineSideMenu",
};
</script>
  
<style scoped>
.side-menu {
    background-color: #f4f4f4;
    padding: 1rem;
    height: 79vh;
    grid-area: sidebar;
}
.side-menu ul {
    list-style: none;
    padding: 0;
}
.side-menu li {
    margin: 0;
}
.side-menu-item li{
    margin:10px 0;
}
.side-menu-item a {
    color: #333;
    text-decoration: none;
    font-size:16px;
}
.side-menu button{
    border: none;
    width: -webkit-fill-available;
    padding: 10px 0;
    text-align: left;
    background: rgba(0, 0, 0, 0);
    border-bottom: 1px solid #e1e1e1;
    font-size:18px;
}
</style>
  