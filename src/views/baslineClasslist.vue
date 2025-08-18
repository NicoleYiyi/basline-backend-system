<template>
    <div>
      <h2>課程清單</h2>
      <button class="addbtn" @click="openAddPopup('class')">新增課程</button>
      <button class="addbtn" @click="downloadClassesJson">下載課程 JSON</button>
      <input type="file" @change="uploadClassesJson" accept=".json" style="margin-left:10px" />
      <BaslinePopup v-model="showPopup">
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

        <div style="margin-top: 15px;">
          <button @click="saveClass">儲存</button>
          <button @click="closePopup">取消</button>
        </div>

      </BaslinePopup>
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
            <td>4</td>
            <td>
              <button @click="openEditPopup('class', m)">編輯</button>
              <button @click="requestDelete(m.id)" style="margin-left: 5px;">刪除</button>
            </td>
        </tr>
      </table>
      <div v-if="confirmDelete" class="confirm-box">
        <p>確定要刪除嗎？</p>
        <button @click="confirmDeleteAction(deleteClass)">確定</button>
        <button @click="cancelDelete">取消</button>
      </div>
    </div>
</template>

<script>
export default {
    name: 'baslineClasslist',
};
</script>

<script setup>
import { ref } from 'vue'
import { useCrudPopup} from '@/composables/useCrudPopup';
import BaslinePopup from '@/components/baslinePopup.vue';

// const showPopup = ref(false)
// const previewUrl = ref(null)
// const isEditing = ref(false)       // 是否在編輯模式
// const editingIndex = ref(null)     // 目前編輯的課程索引

//課程清單
const classes = ref([])

const {
  showPopup,
  // popupType,
  actionType,
  formData,
  previewUrl, // ← 從 useCrudPopup 取得
  confirmDelete,
  openAddPopup,
  openEditPopup,
  closePopup,
  requestDelete,
  cancelDelete,
  confirmDeleteAction,
  saveToJson,
  loadFromJson
} = useCrudPopup()

function saveClass() {
  if (!formData.type || !formData.name || !formData.note) {
    alert('請輸入課程資料')
    return
  }
  if (actionType.value === 'add') {
    classes.value.push({ ...formData, id: Date.now() })
  } else {
    const idx = classes.value.findIndex(m => m.id === formData.id)
    if (idx !== -1) classes.value[idx] = { ...formData }
  }
  closePopup()
}

function deleteClass(id) {
  classes.value = classes.value.filter(m => m.id !== id)
}

// 下載會員 JSON 檔
function downloadClassesJson() {
  saveToJson(classes.value, 'classes.json')
}

// 上傳並載入會員 JSON 檔
async function uploadClassesJson(event) {
  try {
    const loadedData = await loadFromJson(event)
    if (Array.isArray(loadedData)) {
      classes.value = loadedData
    } else {
      alert('JSON 格式錯誤，預期為陣列')
    }
  } catch (e) {
    alert(e)
  }
}

//表單資料 (包含photo欄位)
// const formData = ref({
//   photo: '', //Base64 圖片
//   name: '',
//   type: ''
// })

//開啟新增課程彈窗
// function openAddPopup() {
//   resetForm()
//   isEditing.value = false
//   showPopup.value = true
// }

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

//編輯課程
// function editClass(index) {
//   const danceclass = classes.value[index]
//   formData.value = { ...danceclass } //帶入原資料
//   previewUrl.value = danceclass.photo || null
//   isEditing.value = true
//   editingIndex.value = index
//   showPopup.value = true
// }

//更新課程
// function updateClass() {
//   if (editingIndex.value !== null) {
//     classes.value[editingIndex.value] = { ...formData.value }
//     resetForm()
//     isEditing.value = false
//     editingIndex.value = null
//     showPopup.value = false
//   }
// }

//刪除會員
// function deleteClass(index) {
//   if (confirm(`確定要刪除課程「${classes.value[index].name}」嗎？`)) {
//     classes.value.splice(index, 1)
//   }
// }

//重置表單
// function resetForm() {
//   formData.value = {
//     photo: '',
//     name: '',
//     type: ''
//   }
//   previewUrl.value = null
// }

//下載 JSON 檔
// function saveToJson() {
//   if (classes.value.length === 0) {
//     alert('目前沒有任何課程資料可下載')
//     return
//   }

  // const dataStr = JSON.stringify(classes.value, null, 2)
  // const blob = new Blob([dataStr], { type: "application/json" })
  // const url = URL.createObjectURL(blob)

  // const a = document.createElement('a')
  // a.href = url
  // a.download = 'classes.json'
  // a.click()

  // URL.revokeObjectURL(url)
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
</style>