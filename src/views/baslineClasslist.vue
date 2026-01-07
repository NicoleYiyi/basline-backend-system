<template>
    <div>
      <h2>課程清單</h2>
      <button class="addbtn" @click="openAddPopup('class')">新增課程</button>
      <button class="addbtn" @click="downloadClassesJson">下載課程 JSON</button>
      <input type="file" @change="uploadClassesJson" accept=".json" style="margin-left:10px" />
      <table>
        <tr>
            <th><h4>圖片</h4></th>
            <th><h4>課程名稱</h4></th>
            <th><h4>課程類型</h4></th>
            <th><h4>會員端顯示</h4></th>
            <th><h4>操作</h4></th>
        </tr>
        <tr v-for="m in classes" :key="m.id">
            <td><img v-if="m.photo" :src="m.photo" alt="課程圖片" style="max-width: 80px; max-height: 80px;" /></td>
            <td>{{ m.name }}</td>
            <td>{{ m.type }}</td>
            <td>{{ m.show ? '顯示' : '隱藏' }}</td>
            <td>
              <button @click="openEditPopup('class', m)">編輯</button>
              <button @click="requestDelete(m.id)" style="margin-left: 5px;">刪除</button>
            </td>
        </tr>
      </table>
      <BaslinePopup v-model="showPopup" :onSave="saveClass">
        <h3>{{ actionType === 'add' ? '新增課程' : '編輯課程' }}</h3>
        <h5>課程類型：
        <select v-model="formData.type">
            <option disabled value="">請選擇</option>
            <option value="團體課">團體課</option>
            <option value="期課">期課</option>
            <option value="大師課">大師課</option>
            <option value="私課">私課</option>
        </select></h5>
        <h5>課程名稱： <input v-model="formData.name" placeholder="課程名稱" /></h5>
        <h5>圖片：<input id="classimgupload" type="file" @change="onFileChange" accept="image/*" /></h5>
        <div v-if="previewUrl" class="preview">
            <h5>圖片預覽：</h5>
            <img :src="previewUrl" alt="預覽圖片" style="max-width: 300px;" />
        </div>
        <h5>課程介紹：</h5>
        <p style="white-space: pre-line;">
        <textarea v-model="formData.note" placeholder="課程介紹"></textarea></p>
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
    name: 'baslineClasslist',
};
</script>

<script setup>
import { ref, onMounted } from 'vue'
import { useCrudPopup} from '@/composables/useCrudPopup';
import BaslinePopup from '@/components/baslinePopup.vue';
import { fetchCourseTemplates } from '@/api/baslineApi';

//課程清單
const classes = ref([])

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

// 從 API 載入課程資料
async function loadClasses() {
  try {
    const result = await fetchCourseTemplates()
    console.log('課程 API 資料：', result)

    // 使用 result.data（這才是陣列）
    classes.value = result.data.map(t => ({
      id: t.id,
      name: t.name || '',
      type: t.type || '',
      photo: t.image_url || '',
      note: t.description || '',
      is_visible: t.show === 1
    }))
  } catch (error) {
    console.error('載入課程失敗:', error)
    alert('無法從伺服器載入課程資料')
  }
}

function saveClass() {
  console.log('test');
  if (!formData.type || !formData.name || !formData.note) {
    alert('請輸入課程資料')
    return
  }
  if (actionType.value === 'add') {
    classes.value.push({ ...formData, id: Date.now(), show: formData.show ?? false })
  } else {
    const idx = classes.value.findIndex(m => m.id === formData.id)
    if (idx !== -1) classes.value[idx] = { ...formData, show: formData.show ?? false }
  }
  closePopup()
}

function requestDelete(id) {
  const confirmed = window.confirm('確定要刪除嗎？')
  if (confirmed) {
    deleteClass(id)
  }
}

function deleteClass(id) {
  classes.value = classes.value.filter(m => m.id !== id)
  cancelDelete();
}

// 下載會員 JSON 檔
function downloadClassesJson() {
  const exportData = classes.value.map(t => ({
    ...t,
    show: t.show ? '顯示' : '隱藏'
  }))
  saveToJson(exportData, 'classes.json')
}

// 上傳並載入會員 JSON 檔
async function uploadClassesJson(event) {
  try {
    const loadedData = await loadFromJson(event)
    if (Array.isArray(loadedData)) {
      classes.value = loadedData.map(t => ({
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

onMounted(() => {
  loadClasses()
})

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
