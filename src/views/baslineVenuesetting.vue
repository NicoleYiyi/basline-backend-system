<template>
  <div>
    <h2>會館設定</h2>
    <button
      class="addbtn"
      @click="openAddPopup('venue')"
    >
      新增會館
    </button>
    <button
      class="addbtn"
      @click="downloadVenuesJson"
    >
      下載會館 JSON
    </button>
    <input
      type="file"
      accept=".json"
      style="margin-left:10px"
      @change="uploadVenuesJson"
    >
    <BaslinePopup
      v-model="showPopup"
      :on-save="saveVenue"
    >
      <h3>{{ actionType === 'add' ? '新增會館' : '編輯會館' }}</h3>
      <h5>
        會館名稱： <input
          v-model="formData.name"
          placeholder="會館名稱"
        >
      </h5>
      <h5>
        圖片：<input
          id="venueimgupload"
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
      <h5>
        會館地址： <input
          v-model="formData.address"
          placeholder="會館地址"
        >
      </h5>
      <h5>
        館主： <input
          v-model="formData.manager"
          placeholder="館主"
        >
      </h5>
      <h5>
        電話： <input
          v-model="formData.phone"
          placeholder="電話"
        >
      </h5>
      <h5>備註：</h5>
      <p style="white-space: pre-line;">
        <textarea
          v-model="formData.note"
          placeholder="會館備註"
        />
      </p>
    </BaslinePopup>
    <table>
      <tr>
        <th><h4>圖片</h4></th>
        <th><h4>會館名稱</h4></th>
        <th><h4>館主</h4></th>
        <th><h4>地址</h4></th>
        <th><h4>操作</h4></th>
      </tr>
      <tr
        v-for="m in filteredVenues"
        :key="m.id"
      >
        <td>
          <img
            v-if="m.photo"
            :src="m.photo"
            alt="會館圖片"
            style="max-width: 80px; max-height: 80px;"
          >
        </td>
        <td>{{ m.name }}</td>
        <td>{{ m.manager }}</td>
        <td>{{ m.address }}</td>
        <td>
          <button @click="openEditPopup('venue', m)">
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
  </div>
</template>

<script>
export default {
    name: 'BaslineVenuesetting',
};
</script>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCrudPopup} from '@/composables/useCrudPopup';
import BaslinePopup from '@/components/baslinePopup.vue';
import { fetchVenues } from '@/api/baslineApi';

//會館清單
const venues = ref([])
const typeFilter = ref('all')

const filteredVenues = computed(() => {
  if (typeFilter.value === 'all') return venues.value
  return venues.value.filter(m => {
    const venue = m.venue || ''
    if (typeFilter.value === '1') return venue === '1' || venue === '1'
    return venue === typeFilter.value
  })
})

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

// 從 API 載入會館資料
async function loadVenues() {
  try {
    const result = await fetchVenues()
    console.log('會館 API 資料：', result)

    // 使用 result.data（這才是陣列）
    venues.value = result.data.map(t => ({
      id: t.id,
      name: t.name || '',
      manager: t.manager || '',
      photo: t.image_url || '',
      note: t.description || '',
      address: t.address || '',
    }))
  } catch (error) {
    console.error('載入會館失敗:', error)
    alert('無法從伺服器載入會館資料')
  }
}

function saveVenue() {
  console.log('test');
  if (!formData.manager || !formData.name || !formData.address) {
    alert('請輸入會館資料')
    return
  }
  if (actionType.value === 'add') {
    venues.value.push({ ...formData, id: Date.now(), show: formData.show ?? false })
  } else {
    const idx = venues.value.findIndex(m => m.id === formData.id)
    if (idx !== -1) venues.value[idx] = { ...formData, show: formData.show ?? false }
  }
  closePopup()
}

function requestDelete(id) {
  const confirmed = window.confirm('確定要刪除嗎？')
  if (confirmed) {
    deleteVenues(id)
  }
}

function deleteVenues(id) {
  venues.value = venues.value.filter(m => m.id !== id)
  cancelDelete();
}

// 下載會館 JSON 檔
function downloadVenuesJson() {
  const exportData = venues.value.map(t => ({
    ...t,
    show: t.show ? '顯示' : '隱藏'
  }))
  saveToJson(exportData, 'venues.json')
}

// 上傳並載入會館 JSON 檔
async function uploadVenuesJson(event) {
  try {
    const loadedData = await loadFromJson(event)
    if (Array.isArray(loadedData)) {
      venues.value = loadedData.map(t => ({
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
  loadVenues()
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
</style>
