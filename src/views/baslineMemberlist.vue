<template>
    <div>
      <h2>會員清單</h2>
      <button class="addbtn" @click="openAddPopup('member')">新增會員</button>
      <button class="addbtn" @click="downloadMembersJson">下載會員 JSON</button>
      <input type="file" @change="uploadMembersJson" accept=".json" style="margin-left:10px" />
      <BaslinePopup v-model="showPopup">
        <h3>{{ actionType === 'add' ? '新增會員' : '編輯會員' }}</h3>
        <h5>姓名： <input v-model="formData.name" placeholder="會員姓名" /></h5>
        <h5>性別：
        <select v-model="formData.gender">
            <option disabled value="">請選擇</option>
            <option value="先生">先生</option>
            <option value="小姐">小姐</option>
        </select></h5>
        <h5>生日： <input type="date" v-model="formData.birthday" /></h5>
        <h5>Email： <input v-model="formData.email" placeholder="電子郵件" /></h5>
        <h5>註冊日期： <input type="date" v-model="formData.registerDate" /></h5>
        <h5>會員照片：<input id="memberimgupload" type="file" @change="onFileChange" accept="image/*" /></h5>
        <div v-if="previewUrl" class="preview">
            <h5>圖片預覽：</h5>
            <img :src="previewUrl" alt="預覽圖片" style="max-width: 300px;" />
        </div>
        <h5>備註：</h5>
        <p style="white-space: pre-line;">
        <textarea v-model="formData.note" placeholder="學員備註"></textarea></p>

        <div style="margin-top: 15px;">
          <button @click="saveMember">儲存</button>
          <button @click="closePopup">取消</button>
        </div>

      </BaslinePopup>
      <table>
        <tr>
            <th><h4>會員帳號</h4></th>
            <th><h4>姓名</h4></th>
            <th><h4>最新儲值 (性別)</h4></th>
            <th><h4>最近預約 (Email)</h4></th>
            <th><h4>註冊日期</h4></th>
            <th><h4>操作</h4></th>
        </tr>
        <tr v-for="m in members" :key="m.id">
            <td>{{ index + 1 }}</td>
            <td>{{ m.name }}</td>
            <td>{{ m.gender }}</td>
            <td>{{ m.email }}</td>
            <td>{{ m.registerDate }}</td>
            <td>
                <button @click="openEditPopup('member', m)">編輯</button>
                <button @click="requestDelete(m.id)" style="margin-left: 5px;">刪除</button>
            </td>
        </tr>
      </table>
      <div v-if="confirmDelete" class="confirm-box">
        <p>確定要刪除嗎？</p>
        <button @click="confirmDeleteAction(deleteMember)">確定</button>
        <button @click="cancelDelete">取消</button>
      </div>
    </div>
</template>

<script>
export default {
    name: 'baslineMemberlist',
};
</script>

<script setup>
import { ref } from 'vue'
import { useCrudPopup} from '@/composables/useCrudPopup';
import BaslinePopup from '@/components/baslinePopup.vue';

//const showPopup = ref(false)
const previewUrl = ref(null)
//const isEditing = ref(false)       //是否在編輯模式
//const editingIndex = ref(null)     //目前編輯的會員索引
//const selectedDate = ref('')

//會員清單
const members = ref([])

const {
  showPopup,
  // popupType,
  actionType,
  formData,
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

function saveMember() {
  if (!formData.name || !formData.gender || !formData.email || !formData.registerDate) {
    alert('請輸入學員資料')
    return
  }
  if (actionType.value === 'add') {
    members.value.push({ ...formData, id: Date.now() })
  } else {
    const idx = members.value.findIndex(m => m.id === formData.id)
    if (idx !== -1) members.value[idx] = { ...formData }
  }
  closePopup()
}

function deleteMember(id) {
  members.value = members.value.filter(m => m.id !== id)
}

// 下載會員 JSON 檔
function downloadMembersJson() {
  saveToJson(members.value, 'members.json')
}

// 上傳並載入會員 JSON 檔
async function uploadMembersJson(event) {
  try {
    const loadedData = await loadFromJson(event)
    if (Array.isArray(loadedData)) {
      members.value = loadedData
    } else {
      alert('JSON 格式錯誤，預期為陣列')
    }
  } catch (e) {
    alert(e)
  }
}
//表單資料 (包含photo欄位)
// const formData = ref({
//   name: '',
//   gender: '',
//   birthday: '',
//   email: '',
//   registerDate: '',
//   note: '',
//   photo: '' //Base64 圖片
// })

//開啟新增會員彈窗
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

//加入會員清單
// function addMember() {
//   if (!formData.value.name || !formData.value.gender) {
//     alert('請至少輸入姓名與性別')
//     return
//   }

//   members.value.push({ ...formData.value })
//   resetForm()
//   showPopup.value = false
// }

//編輯會員
// function editMember(index) {
//   const member = members.value[index]
//   formData.value = { ...member } //帶入原資料
//   previewUrl.value = member.photo || null
//   isEditing.value = true
//   editingIndex.value = index
//   showPopup.value = true
// }

//更新會員
// function updateMember() {
//   if (editingIndex.value !== null) {
//     members.value[editingIndex.value] = { ...formData.value }
//     resetForm()
//     isEditing.value = false
//     editingIndex.value = null
//     showPopup.value = false
//   }
// }

//刪除會員
// function deleteMember(index) {
//   if (confirm(`確定要刪除會員「${members.value[index].name}」嗎？`)) {
//     members.value.splice(index, 1)
//   }
// }

//重置表單
// function resetForm() {
//   formData.value = {
//     name: '',
//     gender: '',
//     birthday: '',
//     email: '',
//     registerDate: '',
//     note: '',
//     photo: ''
//   }
//   previewUrl.value = null
// }

//下載 JSON 檔
// function saveToJson() {
//   if (members.value.length === 0) {
//     alert('目前沒有任何會員資料可下載')
//     return
//   }

//   const dataStr = JSON.stringify(members.value, null, 2)
//   const blob = new Blob([dataStr], { type: "application/json" })
//   const url = URL.createObjectURL(blob)

//   const a = document.createElement('a')
//   a.href = url
//   a.download = 'members.json'
//   a.click()

//   URL.revokeObjectURL(url)
// }
</script>

<style scoped>
th,td{
    width:16%;
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