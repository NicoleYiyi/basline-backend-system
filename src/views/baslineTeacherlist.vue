<template>
    <div>
      <h2>教師清單</h2>
      <button class="addbtn" @click="openAddPopup('teacher')">新增教師</button>
      <button class="addbtn" @click="downloadTeachersJson">下載教師 JSON</button>
      <input type="file" @change="uploadTeachersJson" accept=".json" style="margin-left:10px" />
      <table>
        <tr>
            <th><h4>圖片</h4></th>
            <th><h4>教師名稱</h4></th>
            <th><h4>授課類型</h4></th>
            <th><h4>會員端顯示</h4></th>
            <th><h4>操作</h4></th>
        </tr>
        <tr v-for="m in teachers" :key="m.id">
            <td><img v-if="m.photo" :src="m.photo" alt="教師圖片" style="max-width: 80px; max-height: 80px;" /></td>
            <td>{{ m.name }}</td>
            <td>{{ m.type }}</td>
            <td>{{ m.show ? '顯示' : '隱藏' }}</td>
            <td>
              <button @click="openEditPopup('teacher', m)">編輯</button>
              <button @click="requestDelete(m.id)" style="margin-left: 5px;">刪除</button>
            </td>
        </tr>
      </table>
      <BaslinePopup v-model="showPopup" :onSave="saveTeacher">
        <h3>{{ actionType === 'add' ? '新增教師' : '編輯教師' }}</h3>
        <h5>教師名稱： <input v-model="formData.name" placeholder="課程名稱" /></h5>
        <h5>授課類型： 
          <select v-model="formData.type">
            <option disabled value="">請選擇</option>
            <option value="團體課">團體課</option>
            <option value="一對一課程">一對一課程</option>
          </select>
        </h5>
        <h5>圖片：<input id="teacherimgupload" type="file" @change="onFileChange" accept="image/*" /></h5>
        <div v-if="previewUrl" class="preview">
            <h5>圖片預覽：</h5>
            <img :src="previewUrl" alt="預覽圖片" style="max-width: 300px;" />
        </div>
        <h5>教師介紹：</h5>
        <p style="white-space: pre-line;">
        <textarea v-model="formData.note" placeholder="教師介紹"></textarea></p>
        <h5>會員端顯示： 
          <label class="switch">
            <input type="checkbox" v-model="formData.show" />
            <span class="slider"></span>
          </label>
        </h5>
      </BaslinePopup>
    </div>
</template>

<script>
export default {
    name: 'baslineTeacherlist',
};
</script>

<script setup>
import { ref, onMounted } from 'vue'
import { useCrudPopup } from '@/composables/useCrudPopup';
import BaslinePopup from '@/components/baslinePopup.vue';
import { fetchTeachers } from '@/api/baslineApi';

// const showPopup = ref(false)
// const previewUrl = ref(null)

const teachers = ref([])

const {
  showPopup,
  // popupType,
  actionType,
  formData,
  previewUrl, // ← 從 useCrudPopup 取得
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

// 從 API 載入教師資料
async function loadTeachers() {
  try {
    const result = await fetchTeachers()
    console.log('API 回傳內容:', result)

    // 使用 result.data（這才是陣列）
    teachers.value = result.data.map(t => ({
      id: t.id,
      name: t.name || '',
      type: t.private_lesson ? '一對一課程' : t.group_class ? '團體課程' : '',
      note: t.introduction || '',
      photo: t.avatar_url || '',
      show: t.is_active === 1 // API 的 1 代表顯示，0 代表隱藏
    }))
  } catch (error) {
    console.error('載入教師資料失敗:', error)
    alert('無法從伺服器載入教師資料')
  }
}

function saveTeacher() {
  console.log('test');
  if (!formData.type || !formData.name || !formData.note) {
    alert('請輸入教師資料')
    return
  }
  if (actionType.value === 'add') {
    teachers.value.push({ ...formData, id: Date.now(), show: formData.show ?? false })
  } else {
    const idx = teachers.value.findIndex(m => m.id === formData.id)
    if (idx !== -1) teachers.value[idx] = { ...formData, show: formData.show ?? false }
  }
  closePopup()
}

function requestDelete(id) {
  const confirmed = window.confirm('確定要刪除嗎？')
  if (confirmed) {
    deleteTeacher(id)
  }
}

function deleteTeacher(id) {
  teachers.value = teachers.value.filter(m => m.id !== id)
  cancelDelete();
}

// 下載會員 JSON 檔
function downloadTeachersJson() {
  const exportData = teachers.value.map(t => ({
    ...t,
    show: t.show ? '顯示' : '隱藏'
  }))
  saveToJson(exportData, 'teachers.json')
}

// 上傳並載入會員 JSON 檔
async function uploadTeachersJson(event) {
  try {
    const loadedData = await loadFromJson(event)
    if (Array.isArray(loadedData)) {
      teachers.value = loadedData.map(t => ({
        ...t,
        // 確保 show 轉成布林
        show: t.show === true || t.show === '顯示'
      }))
    } else {
      alert('JSON 格式錯誤，預期為陣列')
    }
  } catch (e) {
    alert(e)
  }
}

//處理圖片轉 Base64
function onFileChange(event) {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = () => {
      formData.photo = reader.result
      previewUrl.value = reader.result
    }
    reader.readAsDataURL(file)
  } else {
    previewUrl.value = null
    formData.photo = ''
    alert('請上傳圖片格式的檔案')
  }
}

// 組件掛載時自動載入資料
onMounted(() => {
  loadTeachers()
})

// function onFileChange(event) {
//   const file = event.target.files[0]
//   if (file && file.type.startsWith('image/')) {
//     previewUrl.value = URL.createObjectURL(file)
//   } else {
//     previewUrl.value = null
//     alert('請上傳圖片格式的檔案')
//   }
// }
</script>

<style scoped>
th,td{
    width:20%;
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

/* switch 樣式 */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 26px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4caf50;
}

input:checked + .slider:before {
  transform: translateX(24px);
}
</style>
