<template>
  <div>
    <h2>會員清單</h2>
    <button
      class="addbtn"
      @click="openAddPopup('member')"
    >
      新增會員
    </button>
    <button
      class="addbtn"
      @click="downloadMembersJson"
    >
      下載會員 JSON
    </button>
    <input
      type="file"
      accept=".json"
      style="margin-left:10px"
      @change="uploadMembersJson"
    >
    <table>
      <tr>
        <th><h4>會員帳號</h4></th>
        <th><h4>姓名</h4></th>
        <th><h4>最新儲值 (性別)</h4></th>
        <th><h4>最近預約 (Email)</h4></th>
        <th><h4>註冊日期</h4></th>
        <th><h4>操作</h4></th>
      </tr>
      <tr
        v-for="m in members"
        :key="m.id"
      >
        <td>{{ m.phone }}</td>
        <td>{{ m.name }}</td>
        <td>{{ m.gender }}</td>
        <td>{{ m.email }}</td>
        <td>{{ m.registerDate }}</td>
        <td>
          <button @click="openEditPopup('member', m)">
            編輯
          </button>
          <button
            style="margin-left: 5px;"
            @click="requestDelete(m.id)"
          >
            刪除
          </button>
        </td>
      </tr>
    </table>
    <BaslinePopup
      v-model="showPopup"
      :on-save="saveMember"
    >
      <h3>{{ actionType === 'add' ? '新增會員' : '編輯會員' }}</h3>
      <h5>
        會員帳號 / 手機： <input
          v-model.trim="formData.phone"
          placeholder="09xxxxxxxx"
        >
      </h5>
      <h5 v-if="actionType === 'add'">
        密碼： <input
          v-model="formData.password"
          type="password"
          placeholder="8-16碼，需含英數"
        >
      </h5>
      <h5>
        姓名： <input
          v-model="formData.name"
          placeholder="會員姓名"
        >
      </h5>
      <h5>
        性別：
        <select v-model="formData.gender">
          <option
            disabled
            value=""
          >
            請選擇
          </option>
          <option value="先生">
            先生
          </option>
          <option value="小姐">
            小姐
          </option>
        </select>
      </h5>
      <h5>
        生日： <input
          v-model="formData.birthday"
          type="date"
        >
      </h5>
      <h5>
        Email： <input
          v-model="formData.email"
          placeholder="電子郵件"
        >
      </h5>
      <h5>
        註冊日期： <input
          v-model="formData.registerDate"
          type="date"
        >
      </h5>
      <h5>
        會員照片：<input
          id="memberimgupload"
          type="file"
          accept="image/*"
          @change="onFileChange"
        >
      </h5>
      <div
        v-if="previewUrl"
        class="preview"
      >
        <h5>圖片預覽：</h5>
        <img
          :src="previewUrl"
          alt="預覽圖片"
          style="max-width: 300px;"
        >
      </div>
      <h5>備註：</h5>
      <p style="white-space: pre-line;">
        <textarea
          v-model="formData.note"
          placeholder="學員備註"
        />
      </p>
    </BaslinePopup>
  </div>
</template>

<script>
export default {
    name: 'BaslineMemberlist',
};
</script>

<script setup>
import { ref, onMounted } from 'vue'
import { useCrudPopup} from '@/composables/useCrudPopup';
import BaslinePopup from '@/components/baslinePopup.vue';
import { danceStudioSDK } from '@/api/baslineApi';

//會員清單
const members = ref([])
const isSaving = ref(false)

const {
  showPopup,
  // popupType,
  actionType,
  formData,
  previewUrl,
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

function assertApiSuccess(result, fallbackMessage) {
  if (result?.success === false) {
    throw new Error(result.message || result.error || fallbackMessage)
  }
}

function formatDate(value) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10)

  return date.toISOString().slice(0, 10)
}

function normalizeGenderFromApi(gender) {
  if (gender === 'MALE') return '先生'
  if (gender === 'FEMALE') return '小姐'
  return gender || ''
}

function normalizeGenderToApi(gender) {
  if (gender === '先生') return 'MALE'
  if (gender === '小姐') return 'FEMALE'
  return gender || undefined
}

function normalizeMemberFromApi(user, fallback = {}) {
  const source = user || {}

  return {
    ...fallback,
    id: source.id ?? source.userId ?? fallback.id,
    phone: source.phone || source.account || fallback.phone || '',
    name: source.name || fallback.name || '',
    gender: normalizeGenderFromApi(source.gender ?? fallback.gender),
    birthday: formatDate(source.birth ?? source.birthday ?? fallback.birthday),
    email: source.email || fallback.email || '',
    registerDate: formatDate(source.createdAt ?? source.created_at ?? source.registerDate ?? fallback.registerDate),
    photo: source.image || source.photo || source.avatarUrl || source.avatar_url || fallback.photo || '',
    note: source.note || source.remark || fallback.note || '',
    isActive: source.isActive ?? fallback.isActive ?? true
  }
}

function buildMemberPayload() {
  return {
    userId: formData.id,
    name: formData.name,
    phone: formData.phone,
    email: formData.email,
    birth: formData.birthday,
    gender: normalizeGenderToApi(formData.gender),
    note: formData.note,
    image: formData.photo,
    registerDate: formData.registerDate
  }
}

async function loadUsers() {
  try {
    const result = await danceStudioSDK.getUsersDetail()
    console.log('API 回傳內容:', result)
    assertApiSuccess(result, '載入會員資料失敗')
    members.value = Array.isArray(result.data)
      ? result.data.map(normalizeMemberFromApi)
      : []
  } catch (error){
    console.error('載入會員資料失敗:', error)
    alert(error?.message === 'SESSION_EXPIRED' ? '登入已過期，請重新登入' : '無法從伺服器載入會員資料')
  }
}

async function saveMember() {
  if (isSaving.value) return
  if (!formData.phone || !formData.name || !formData.gender || !formData.email) {
    alert('請輸入學員資料')
    return
  }

  if (actionType.value === 'add' && !formData.password) {
    alert('新增會員請輸入密碼')
    return
  }

  try {
    isSaving.value = true

    let result
    const localMember = { ...formData }

    if (actionType.value === 'add') {
      result = await danceStudioSDK.register({
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
        birth: formData.birthday,
        gender: normalizeGenderToApi(formData.gender),
        email: formData.email,
        note: formData.note,
        image: formData.photo,
        registerDate: formData.registerDate
      })
    } else {
      result = await danceStudioSDK.updateUserDetails(buildMemberPayload())
    }

    assertApiSuccess(result, actionType.value === 'add' ? '新增會員失敗' : '更新會員失敗')

    if (actionType.value === 'add') {
      members.value.push(normalizeMemberFromApi(result?.data, {
        ...localMember,
        id: result?.data?.id ?? Date.now()
      }))
    } else {
      const idx = members.value.findIndex(m => m.id === formData.id)
      if (idx !== -1) {
        members.value[idx] = normalizeMemberFromApi(result?.data, localMember)
      }
    }

    closePopup()
  } catch (error) {
    console.error('儲存會員失敗:', error)
    alert(error?.message === 'SESSION_EXPIRED' ? '登入已過期，請重新登入' : (error.message || '儲存會員失敗'))
  } finally {
    isSaving.value = false
  }
}

function requestDelete(id) {
  const confirmed = window.confirm('確定要刪除嗎？')
  if (confirmed) {
    deleteMember(id)
  }
}

async function deleteMember(id) {
  try {
    const result = await danceStudioSDK.deleteUser(id)
    assertApiSuccess(result, '刪除會員失敗')
    members.value = members.value.filter(m => m.id !== id)
    cancelDelete();
  } catch (error) {
    console.error('刪除會員失敗:', error)
    alert(error?.message === 'SESSION_EXPIRED' ? '登入已過期，請重新登入' : (error.message || '刪除會員失敗'))
  }
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
      members.value = loadedData.map(normalizeMemberFromApi)
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
  loadUsers()
})

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
