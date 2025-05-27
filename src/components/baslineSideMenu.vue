<template>
    <aside class="side-menu">
        <ul>
            <li>
                <button @click="toggle('course')">課程管理</button>
                <ul class="side-menu-item" v-show="openItem === 'course'">
                <li><a href="/groupclass">團體課表</a></li>
                <li><a href="/classlist">課程清單</a></li>
                </ul>
            </li>
            <li>
                <button @click="toggle('teacher')">教師管理</button>
                <ul class="side-menu-item" v-show="openItem === 'teacher'">
                <li><a href="/teacherlist">教師清單</a></li>
                </ul>
            </li>
            <li>
                <button @click="toggle('classroom')">教室管理</button>
                <ul class="side-menu-item" v-show="openItem === 'classroom'">
                <li><a href="/classroomlist">教室清單</a></li>
                </ul>
            </li>
            <li>
                <button @click="toggle('sales')">銷售管理</button>
                <ul class="side-menu-item" v-show="openItem === 'sales'">
                <li><a href="/salesmanagement">銷售明細</a></li>
                </ul>
            </li>
            <li>
                <button @click="toggle('member')">會員管理</button>
                <ul class="side-menu-item" v-show="openItem === 'member'">
                <li><a href="/memberlist">會員清單</a></li>
                </ul>
            </li>
            <li>
                <button @click="toggle('reports')">報表管理</button>
                <ul class="side-menu-item" v-show="openItem === 'reports'">
                <li><a href="#">預約報表</a></li>
                <li><a href="#">交易報表</a></li>
                <li><a href="#">銷售報表</a></li>
                </ul>
            </li>
            <li>
                <button @click="toggle('activity')">活動管理</button>
                <ul class="side-menu-item" v-show="openItem === 'activity'">
                <li><a href="/notification">活動清單</a></li>
                </ul>
            </li>
            <li>
                <button @click="toggle('accounts')">帳號管理</button>
                <ul class="side-menu-item" v-show="openItem === 'accounts'">
                <li><a href="/permissionmanagement">角色與權限</a></li>
                <li><a href="/accountlist">員工帳號</a></li>
                </ul>
            </li>
            <li>
                <button @click="toggle('settings')">設定</button>
                <ul class="side-menu-item" v-show="openItem === 'settings'">
                <li><a href="/plansetting">方案設定</a></li>
                <li><a href="/venuesetting">會館設定</a></li>
                <li><a href="/generalsetting">系統設定</a></li>
                <li><a href="#">電子合約設定</a></li>
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
    height: auto;
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
  