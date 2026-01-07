<template>
    <div>
      <h2>教室清單</h2>
      <button class="addbtn" @click="openAddPopup('classroom')">新增教室</button>
      <button class="addbtn" @click="downloadClassroomsJson">下載教室 JSON</button>
      <input type="file" @change="uploadClassroomsJson" accept=".json" style="margin-left:10px" />
      <BaslinePopup v-model="showPopup" :onSave="saveClassroom">
        <h3>{{ actionType === 'add' ? '新增教室' : '編輯教室' }}</h3>
        <h5>教室名稱： <input v-model="formData.name" placeholder="教室名稱" /></h5>
        <h5>所屬會館： <input v-model="formData.venue" placeholder="會館名稱" /></h5>
        <h5>可容納名額： <input v-model="formData.quota" placeholder="可容納名額(5-100)" /></h5>
      </BaslinePopup>
      <table>
        <tr>
            <th><h4>教室名稱</h4></th>
            <th><h4>所屬會館</h4></th>
            <th><h4>可容納名額</h4></th>
            <th><h4>操作</h4></th>
        </tr>
        <tr v-for="classroom in classrooms" :key="classroom.id">
            <td>{{ classroom.name }}</td>
            <td>{{ classroom.venue }}</td>
            <td>{{ classroom.quota }}</td>
            <td>
              <button @click="openEditPopup('classroom', classroom)">編輯</button>
              <button @click="requestDelete(classroom.id)" style="margin-left: 5px;">刪除</button>
            </td>
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
import { useCrudPopup} from '@/composables/useCrudPopup';
import BaslinePopup from '@/components/baslinePopup.vue';

//課程清單
const classrooms = ref([])

const {
  showPopup,
  // popupType,
  actionType,
  formData,
//   previewUrl, // ← 從 useCrudPopup 取得
  // confirmDelete,
  openAddPopup,
  openEditPopup,
  closePopup,
  // requestDelete,
  cancelDelete,
  // confirmDeleteAction,
  saveToJson,
  loadFromJson
} = useCrudPopup()

function saveClassroom() {
  if (!formData.name || !formData.venue || !formData.quota) {
    alert('請輸入教室資料')
    return
  }
  if (actionType.value === 'add') {
    classrooms.value.push({ ...formData, id: Date.now() })
  } else {
    const idx = classrooms.value.findIndex(m => m.id === formData.id)
    if (idx !== -1) classrooms.value[idx] = { ...formData }
  }
  closePopup()
}

function requestDelete(id) {
  const confirmed = window.confirm('確定要刪除嗎？')
  if (confirmed) {
    deleteClassroom(id)
  }
}

function deleteClassroom(id) {
  classrooms.value = classrooms.value.filter(m => m.id !== id)
  cancelDelete();
}

// 下載會員 JSON 檔
function downloadClassroomsJson() {
  saveToJson(classrooms.value, 'classrooms.json')
}

// 上傳並載入會員 JSON 檔
async function uploadClassroomsJson(event) {
  try {
    const loadedData = await loadFromJson(event)
    if (Array.isArray(loadedData)) {
      classrooms.value = loadedData
    } else {
      alert('JSON 格式錯誤，預期為陣列')
    }
  } catch (e) {
    alert(e)
  }
}

</script>

<style scoped>
th,td{
    width:25%;
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