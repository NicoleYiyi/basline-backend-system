<template>
  <div>
    <h2>教師清單</h2>
    <button
      class="addbtn"
      @click="openTeacherAddPopup"
    >
      新增教師
    </button>
    <button
      class="addbtn"
      @click="downloadTeachersJson"
    >
      下載教師 JSON
    </button>
    <input
      type="file"
      accept=".json"
      style="margin-left:10px"
      @change="uploadTeachersJson"
    >
    <table>
      <thead>
        <tr>
          <th><h4>圖片</h4></th>
          <th><h4>教師名稱</h4></th>
          <th><h4>所屬場館</h4></th>
          <th><h4>會員端顯示</h4></th>
          <th><h4>操作</h4></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="m in teachers"
          :key="m.id"
        >
          <td>
            <img
              v-if="m.photo"
              :src="m.photo"
              alt="教師圖片"
              style="max-width: 80px; max-height: 80px;"
            >
          </td>
          <td>{{ m.name }}</td>
          <td>{{ formatVenues(m.venues) }}</td>
          <td>{{ m.show ? '顯示' : '隱藏' }}</td>
          <td>
            <button @click="openTeacherEditPopup(m)">
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
      </tbody>
    </table>
    <BaslinePopup
      v-model="showPopup"
      :on-save="saveTeacher"
    >
      <h3>{{ actionType === 'add' ? '新增教師' : '編輯教師' }}</h3>
      <h5>
        App 端手機號碼 (綁定使用者)：
        <input
          v-model.trim="formData.userPhoneQuery"
          :list="actionType === 'add' ? 'teacher-user-phone-options' : undefined"
          placeholder="輸入電話查詢"
          :readonly="actionType !== 'add'"
          @change="handleUserPhoneInput"
          @input="handleUserPhoneInput"
        >
        <datalist
          v-if="actionType === 'add'"
          id="teacher-user-phone-options"
        >
          <option
            v-for="user in filteredUserOptions"
            :key="user.id"
            :value="user.phone"
          />
        </datalist>
        <span
          v-if="actionType === 'add' && formData.userPhoneQuery && !formData.userId"
          class="empty-options"
        >
          找不到相符電話
        </span>
      </h5>
      <h5>
        教師名稱： <input
          v-model="formData.name"
          placeholder="教師名稱"
        >
      </h5>
      <h5>
        所屬場館：
        <span
          v-if="!venueOptions.length"
          class="empty-options"
        >
          目前沒有場館選項
        </span>
        <label
          v-for="venue in venueOptions"
          v-else
          :key="venue.id || venue.name"
          class="venue-option"
        >
          <input
            v-model="formData.venues"
            type="checkbox"
            :value="venue.name"
          >
          {{ venue.name }}
        </label>
      </h5>
      <h5>
        授課類型： 
        <select v-model="formData.type">
          <option
            disabled
            value=""
          >
            請選擇
          </option>
          <option value="團體課">
            團體課
          </option>
          <option value="一對一課程">
            一對一課程
          </option>
        </select>
      </h5>
      <h5>
        圖片：<input
          id="teacherimgupload"
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
      <h5>教師介紹：</h5>
      <p style="white-space: pre-line;">
        <textarea
          v-model="formData.note"
          placeholder="教師介紹"
        />
      </p>
      <h5>
        會員端顯示： 
        <label class="switch">
          <input
            v-model="formData.show"
            type="checkbox"
          >
          <span class="slider" />
        </label>
      </h5>
    </BaslinePopup>
  </div>
</template>

<script>
export default {
    name: 'BaslineTeacherlist',
};
</script>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useCrudPopup } from '@/composables/useCrudPopup';
import BaslinePopup from '@/components/baslinePopup.vue';
import { danceStudioSDK, danceStudioSdk } from '@/api/baslineApi';

// const showPopup = ref(false)
// const previewUrl = ref(null)

const teachers = ref([])
const venueOptions = ref([])
const userOptions = ref([])
const isSaving = ref(false)

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

const filteredUserOptions = computed(() => {
  const query = String(formData.userPhoneQuery || '').trim()
  if (!query) return userOptions.value.slice(0, 20)

  return userOptions.value
    .filter(user => user.phone.includes(query))
    .slice(0, 20)
})

function openTeacherAddPopup() {
  openAddPopup('teacher')
  formData.venues = []
  formData.userId = ''
  formData.userPhoneQuery = ''
  formData.name = ''
  formData.type = ''
  formData.note = ''
  formData.photo = ''
  formData.show = true
}

function openTeacherEditPopup(teacher) {
  openEditPopup('teacher', {
    ...teacher,
    venues: normalizeSelectedVenues(teacher.venues),
    userPhoneQuery: teacher.userPhone || getUserPhoneById(teacher.userId)
  })
}

// 從 API 載入教師資料
async function loadTeachers() {
  try {
    const result = await danceStudioSdk.getTeachersDetailWithUser()
    console.log('API 回傳內容:', result)

    teachers.value = result.data.map(normalizeTeacherFromApi)
  } catch (error) {
    console.error('載入教師資料失敗:', error)
    alert('無法從伺服器載入教師資料')
  }
}

async function loadVenues() {
  try {
    const result = await danceStudioSdk.getVenuesDetail()
    console.log('場館 API 回傳內容:', result)
    venueOptions.value = normalizeVenueOptions(result.data)
  } catch (error) {
    console.error('載入場館資料失敗:', error)
    alert('無法從伺服器載入場館資料')
  }
}

async function loadUsers() {
  try {
    const result = await danceStudioSdk.getUsersDetail()
    console.log('使用者 API 回傳內容:', result)
    userOptions.value = normalizeUserOptions(result.data)
  } catch (error) {
    console.error('載入使用者資料失敗:', error)
    alert('無法從伺服器載入使用者資料')
  }
}

function normalizeUserOptions(users) {
  if (!Array.isArray(users)) return []

  return users
    .map(user => ({
      ...user,
      phone: String(user?.phone || '').trim()
    }))
    .filter(user => user.id !== undefined && user.id !== null && user.phone)
}

function normalizeVenueOptions(venues) {
  if (!Array.isArray(venues)) return []

  return venues
    .map(venue => ({
      ...venue,
      name: String(venue?.name || venue?.venueName || '').trim()
    }))
    .filter(venue => venue.name)
}

function getVenueId(venue) {
  if (venue && typeof venue === 'object') return venue.id ?? venue.venueId ?? null
  return null
}

function getVenueName(venue) {
  if (typeof venue === 'string') return venue.trim()
  if (!venue || typeof venue !== 'object') return ''

  return String(venue.name || venue.venueName || venue.title || '').trim()
}

function normalizeSelectedVenues(venues) {
  if (Array.isArray(venues)) {
    return [...new Set(venues.map(getVenueName).filter(Boolean))]
  }

  const venueName = getVenueName(venues)
  if (!venueName) return []

  return venueName
    .split(',')
    .map(name => name.trim())
    .filter(Boolean)
}

function formatVenues(venues) {
  return normalizeSelectedVenues(venues).join('、')
}

function getUserPhoneById(userId) {
  const user = userOptions.value.find(option => String(option.id) === String(userId))
  return user?.phone || ''
}

function handleUserPhoneInput() {
  if (actionType.value !== 'add') return

  const phone = String(formData.userPhoneQuery || '').trim()
  const matchedUser = userOptions.value.find(user => user.phone === phone)
  formData.userId = matchedUser?.id || ''
}

function getSelectedVenueIds() {
  const selectedNames = normalizeSelectedVenues(formData.venues)
  return venueOptions.value
    .filter(venue => selectedNames.includes(venue.name))
    .map(getVenueId)
    .filter(id => id !== null && id !== undefined)
}

function normalizeTeacherType(teacher) {
  const type = teacher.type || teacher.courseType || ''
  if (type) return type
  if (teacher.private_lesson || teacher.privateLesson) return '一對一課程'
  if (teacher.group_class || teacher.groupClass) return '團體課'
  return ''
}

function normalizeTeacherShow(teacher) {
  const value = teacher.isActive ?? teacher.is_active ?? teacher.show
  return value === true || value === 1 || value === '1' || value === '顯示'
}

function getTeacherPhoto(teacher, fallback = {}) {
  return teacher.avatar_url ||
    teacher.avatarUrl ||
    teacher.imageUrl ||
    teacher.image_url ||
    teacher.image ||
    teacher.photo ||
    fallback.photo ||
    ''
}

function isImageFile(value) {
  return typeof File !== 'undefined' && value instanceof File
}

function normalizeTeacherFromApi(teacher, fallback = {}) {
  const source = teacher || {}
  return {
    ...fallback,
    id: source.id ?? fallback.id,
    userId: source.userId ?? source.user_id ?? source.user?.id ?? fallback.userId ?? '',
    userPhone: source.userPhone || source.user_phone || source.user?.phone || fallback.userPhone || '',
    name: source.name || fallback.name || '',
    venues: normalizeSelectedVenues(source.venues ?? fallback.venues),
    type: normalizeTeacherType(source) || fallback.type || '',
    note: source.bio || source.introduction || source.note || fallback.note || '',
    photo: getTeacherPhoto(source, fallback),
    show: normalizeTeacherShow(source) || fallback.show || false
  }
}

async function saveTeacher() {
  if (isSaving.value) return
  if (!formData.name) {
    alert('請輸入教師資料')
    return
  }
  if (actionType.value === 'add' && !formData.userId) {
    alert('請輸入並選擇要綁定的 App 端手機號碼')
    return
  }

  const localTeacher = {
    ...formData,
    venues: normalizeSelectedVenues(formData.venues),
    userPhone: formData.userPhone || formData.userPhoneQuery || '',
    show: formData.show ?? false
  }

  try {
    isSaving.value = true

    let result
    let teacherId = formData.id
    const imageUrl = isImageFile(formData.photo)
      ? await danceStudioSDK.uploadImage(formData.photo, 'teacher')
      : (formData.photo || '')
    const teacherWithImage = {
      ...localTeacher,
      photo: imageUrl
    }

    if (actionType.value === 'add') {
      result = await danceStudioSdk.createTeacher(formData.userId, formData.name, formData.note, imageUrl)
      teacherId = result?.data?.id
      if (teacherId) {
        await danceStudioSdk.assignTeacherVenues(teacherId, getSelectedVenueIds())
      }
      teachers.value.push(normalizeTeacherFromApi(result?.data, {
        ...teacherWithImage,
        id: teacherId ?? Date.now()
      }))
    } else {
      result = await danceStudioSdk.updateTeacher({
        teacherId,
        name: formData.name,
        bio: formData.note,
        image: imageUrl
      })
      if (teacherId) {
        await danceStudioSdk.assignTeacherVenues(teacherId, getSelectedVenueIds())
      }
      const idx = teachers.value.findIndex(m => m.id === formData.id)
      if (idx !== -1) {
        teachers.value[idx] = normalizeTeacherFromApi(result?.data, teacherWithImage)
      }
    }

    closePopup()
  } catch (error) {
    console.error('儲存教師失敗:', error)
    alert(error?.message === 'SESSION_EXPIRED' ? '登入已過期，請重新登入' : '儲存教師失敗，請確認 API 回傳內容')
  } finally {
    isSaving.value = false
  }
}

function requestDelete(id) {
  const confirmed = window.confirm('確定要刪除嗎？')
  if (confirmed) {
    deleteTeacher(id)
  }
}

async function deleteTeacher(id) {
  try {
    await danceStudioSdk.deleteTeacher(id)
    teachers.value = teachers.value.filter(m => m.id !== id)
    cancelDelete();
  } catch (error) {
    console.error('刪除教師失敗:', error)
    alert(error?.message === 'SESSION_EXPIRED' ? '登入已過期，請重新登入' : '刪除教師失敗，請確認 API 回傳內容')
  }
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
        venues: normalizeSelectedVenues(t.venues),
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

// //處理圖片轉 Base64
// function onFileChange(event) {
//   const file = event.target.files[0]
//   if (file && file.type.startsWith('image/')) {
//     const reader = new FileReader()
//     reader.onload = () => {
//       formData.photo = reader.result
//       previewUrl.value = reader.result
//     }
//     reader.readAsDataURL(file)
//   } else {
//     previewUrl.value = null
//     formData.photo = ''
//     alert('請上傳圖片格式的檔案')
//   }
// }

// 🔍 改寫後的圖片選取處理（適應原始檔案上傳流程）
function onFileChange(event) {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    // 1. 💾 直接把實體 file 物件存入變數，不要轉成 base64 字串
    formData.photo = file 

    // 2. 🖼️ 使用瀏覽器內建記憶體投影技術，瞬間產生一個暫時的預覽 URL 
    // 這比 FileReader 快非常多，且不佔用 CPU 解析大字串
    previewUrl.value = URL.createObjectURL(file)
    
  } else {
    previewUrl.value = null
    formData.photo = null
    alert('請上傳圖片格式的檔案')
  }
}

// 組件掛載時自動載入資料
onMounted(() => {
  loadTeachers()
  loadVenues()
  loadUsers()
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

.venue-option {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-right: 12px;
  white-space: nowrap;
}

.empty-options {
  color: #777;
}
</style>
