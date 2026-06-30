<template>
  <div>
    <h2>教室清單</h2>
    <button
      class="addbtn"
      @click="openClassroomAddPopup"
    >
      新增教室
    </button>
    <button
      class="addbtn"
      @click="downloadClassroomsJson"
    >
      下載教室 JSON
    </button>
    <input
      type="file"
      accept=".json"
      style="margin-left:10px"
      @change="uploadClassroomsJson"
    >
    <label class="filter">
      所屬場館：
      <select v-model="venueFilter">
        <option value="all">全部</option>
        <option
          v-for="option in venueFilterOptions"
          :key="option"
          :value="option"
        >
          {{ option }}
        </option>
      </select>
    </label>
    <BaslinePopup
      v-model="showPopup"
      :on-save="saveClassroom"
    >
      <h3>{{ actionType === 'add' ? '新增教室' : '編輯教室' }}</h3>
      <h5>
        教室名稱： <input
          v-model="formData.name"
          placeholder="教室名稱"
        >
      </h5>
      <h5>
        所屬會館：
        <select v-model="formData.venue">
          <option
            disabled
            value=""
          >
            請選擇
          </option>
          <option
            v-for="venue in venueOptions"
            :key="venue.id || venue.name"
            :value="venue.name"
          >
            {{ venue.name }}
          </option>
        </select>
        <span
          v-if="!venueOptions.length"
          class="empty-options"
        >
          目前沒有場館選項
        </span>
      </h5>
      <h5>
        可容納名額： <input
          v-model.number="formData.quota"
          min="1"
          placeholder="可容納名額(5-100)"
          type="number"
        >
      </h5>
      <!-- <h5>
        空間大小： <input
          v-model.number="formData.areaSize"
          min="0"
          placeholder="空間大小（選填）"
          type="number"
        >
      </h5> -->
      <h5>備註：</h5>
      <p style="white-space: pre-line;">
        <textarea
          v-model="formData.note"
          placeholder="教室備註"
        />
      </p>
    </BaslinePopup>
    <table>
      <thead>
        <tr>
          <th><h4>教室名稱</h4></th>
          <th><h4>所屬會館</h4></th>
          <th><h4>可容納名額</h4></th>
          <th><h4>操作</h4></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="m in filteredClassrooms"
          :key="m.id"
        >
          <td>{{ m.name }}</td>
          <td>{{ m.venue }}</td>
          <td>{{ m.quota }}</td>
          <td>
            <button @click="openClassroomEditPopup(m)">
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
  </div>
</template>

<script>
export default {
    name: 'BaslineClassroomlist',
};
</script>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useCrudPopup} from '@/composables/useCrudPopup';
import BaslinePopup from '@/components/baslinePopup.vue';
import { danceStudioSDK } from '@/api/baslineApi.js';

//課程清單
const classrooms = ref([])
const venueOptions = ref([])
const venueFilter = ref('all')
const isSaving = ref(false)

const venueFilterOptions = computed(() => {
  const venueNames = [
    ...venueOptions.value.map(venue => venue.name),
    ...classrooms.value.map(classroom => classroom.venue)
  ]

  return [...new Set(venueNames.filter(Boolean))]
})

const filteredClassrooms = computed(() => {
  if (venueFilter.value === 'all') return classrooms.value

  return classrooms.value.filter(classroom => classroom.venue === venueFilter.value)
})

watch(venueFilterOptions, options => {
  if (venueFilter.value !== 'all' && !options.includes(venueFilter.value)) {
    venueFilter.value = 'all'
  }
})

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

// 從 API 載入教室資料
function openClassroomAddPopup() {
  openAddPopup('classroom')
  formData.name = ''
  formData.venue = ''
  formData.quota = ''
  formData.areaSize = ''
  formData.note = ''
}

function openClassroomEditPopup(classroom) {
  openEditPopup('classroom', classroom)
  formData.venue = classroom.venue || ''
  formData.quota = classroom.quota || ''
  formData.areaSize = classroom.areaSize || ''
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

function getVenueName(venue) {
  if (typeof venue === 'string') return venue.trim()
  if (!venue || typeof venue !== 'object') return ''

  return String(venue.name || venue.venueName || venue.title || '').trim()
}

function normalizeClassroomFromApi(room, fallback = {}) {
  const source = room || {}

  return {
    ...fallback,
    id: source.id ?? source.roomId ?? fallback.id,
    venueId: source.venueId ?? source.venue_id ?? source.venue?.id ?? fallback.venueId ?? '',
    name: source.name || source.roomName || fallback.name || '',
    venue: source.venueName || source.venue_name || getVenueName(source.venue) || fallback.venue || '',
    quota: source.maxCapacity ?? source.max_capacity ?? source.quota ?? fallback.quota ?? '',
    areaSize: source.areaSize ?? source.area_size ?? fallback.areaSize ?? '',
    note: source.description || source.note || fallback.note || '',
  }
}

async function loadVenues() {
  try {
    const result = await danceStudioSDK.getVenuesDetail()
    console.log('場館 API 資料：', result)
    venueOptions.value = normalizeVenueOptions(result.data)
  } catch (error) {
    console.error('載入場館失敗:', error)
    alert('無法從伺服器載入場館資料')
  }
}

async function loadClassrooms() {
  try {
    const result = await danceStudioSDK.getRoomsDetail()
    console.log('教室 API 資料：', result)

    classrooms.value = Array.isArray(result.data)
      ? result.data.map(room => normalizeClassroomFromApi(room))
      : []
  } catch (error) {
    console.error('載入教室失敗:', error)
    alert('無法從伺服器載入會教室資料')
  }
}


async function saveClassroom() {
  if (isSaving.value) return
  if (!formData.name || !formData.venue || !formData.quota) {
    alert('請輸入教室資料')
    return
  }

  const maxCapacity = Number(formData.quota)
  if (!Number.isFinite(maxCapacity) || maxCapacity <= 0) {
    alert('可容納名額需為大於 0 的數字')
    return
  }

  const localClassroom = {
    ...formData,
    quota: maxCapacity,
    areaSize: formData.areaSize ? Number(formData.areaSize) : ''
  }

  try {
    isSaving.value = true

    let result
    if (actionType.value === 'add') {
      result = await danceStudioSDK.createRoom(formData.venue, formData.name, maxCapacity)
      classrooms.value.push(normalizeClassroomFromApi(result?.data, {
        ...localClassroom,
        id: result?.data?.id ?? Date.now()
      }))
    } else {
      result = await danceStudioSDK.updateRoom({
        roomId: formData.id,
        venue: formData.venue,
        venueId: formData.venueId || undefined,
        name: formData.name,
        maxCapacity,
        areaSize: localClassroom.areaSize || undefined,
        description: formData.note || undefined
      })
      const idx = classrooms.value.findIndex(m => m.id === formData.id)
      if (idx !== -1) {
        classrooms.value[idx] = normalizeClassroomFromApi(result?.data, localClassroom)
      }
    }
    closePopup()
  } catch (error) {
    console.error('儲存教室失敗:', error)
    alert(error?.message === 'SESSION_EXPIRED' ? '登入已過期，請重新登入' : '儲存教室失敗，請確認 API 回傳內容')
  } finally {
    isSaving.value = false
  }
}

function requestDelete(id) {
  const confirmed = window.confirm('確定要刪除嗎？')
  if (confirmed) {
    deleteClassroom(id)
  }
}

async function deleteClassroom(id) {
  try {
    await danceStudioSDK.deactiveRoom(id)
    classrooms.value = classrooms.value.filter(m => m.id !== id)
    cancelDelete();
  } catch (error) {
    console.error('刪除教室失敗:', error)
    alert(error?.message === 'SESSION_EXPIRED' ? '登入已過期，請重新登入' : '刪除教室失敗，請確認 API 回傳內容')
  }
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

onMounted(() => {
  loadClassrooms()
  loadVenues()
})

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
