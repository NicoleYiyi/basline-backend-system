<template>
  <div>
    <h2>活動清單</h2>
    <button
      class="addbtn"
      @click="openNotificationAddPopup"
    >
      新增通知
    </button>
    <button
      class="addbtn"
      @click="downloadNotificationsJson"
    >
      下載通知 JSON
    </button>
    <input
      type="file"
      accept=".json"
      style="margin-left:10px"
      @change="uploadNotificationsJson"
    >
    <BaslinePopup
      v-model="showPopup"
      :on-save="saveNotification"
    >
      <h3>{{ actionType === 'add' ? '新增通知' : '編輯通知' }}</h3>
      <h5>
        主題名稱： <input
          v-model="formData.name"
          placeholder="活動主題"
        >
      </h5>
      <h5>
        活動內容： <textarea
          v-model="formData.content"
          placeholder="活動內容"
        />
      </h5>
      <h5>
        發送時間： <VueDatePicker
          v-model="formData.time"
          format="yyyy/MM/dd,HH:mm"
          model-type="yyyy/MM/dd,HH:mm"
          placeholder="發送通知時間"
        />
      </h5>
      <h5>
        發送渠道：
        <div class="setting-pic">
          <input
            id="noticeemail"
            v-model="formData.channels"
            type="checkbox"
            value="noticeemail"
          >Email
        </div>
        <div class="setting-pic">
          <input
            id="noticeapp"
            v-model="formData.channels"
            type="checkbox"
            value="noticeapp"
          >APP 推播
        </div>
      </h5>
    </BaslinePopup>
    <table>
      <tr>
        <th><h4>主題</h4></th>
        <th><h4>通知內容</h4></th>
        <th><h4>發送時間</h4></th>
        <th><h4>發送狀態</h4></th>
        <th><h4>發送渠道</h4></th>
        <th><h4>操作</h4></th>
      </tr>
      <tr
        v-for="notification in notifications"
        :key="notification.id"
      >
        <td>{{ notification.name }}</td>
        <td>{{ notification.content }}</td>
        <td>{{ notification.time }}</td>
        <td>4</td>
        <td>{{ formatChannels(notification.channels) }}</td>
        <td>
          <button @click="openNotificationEditPopup(notification)">
            編輯
          </button>
          <button
            style="margin-left: 5px;"
            @click="requestDelete(notification.id)"
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
    name: 'BaslineNotification',
};
</script>

<script setup>
import { ref } from 'vue'
import { useCrudPopup} from '@/composables/useCrudPopup';
import BaslinePopup from '@/components/baslinePopup.vue';
import { VueDatePicker } from '@vuepic/vue-datepicker';

//課程清單
const notifications = ref([])

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

const channelLabels = {
  noticeemail: 'Email',
  noticeapp: 'APP 推播'
}

function ensureNotificationChannels() {
  if (!Array.isArray(formData.channels)) {
    formData.channels = []
  }
}

function openNotificationAddPopup() {
  openAddPopup('notification')
  ensureNotificationChannels()
}

function openNotificationEditPopup(notification) {
  openEditPopup('notification', notification)
  if (Array.isArray(notification.channels)) {
    formData.channels = [...notification.channels]
  }
  ensureNotificationChannels()
}

function formatChannels(channels) {
  if (!Array.isArray(channels) || channels.length === 0) {
    return '-'
  }
  return channels.map(channel => channelLabels[channel] || channel).join('/')
}

function saveNotification() {
  if (!formData.name || !formData.content || !formData.time) {
    alert('請輸入活動資料')
    return
  }
  const notificationData = {
    ...formData,
    channels: Array.isArray(formData.channels) ? [...formData.channels] : []
  }
  if (actionType.value === 'add') {
    notifications.value.push({ ...notificationData, id: Date.now() })
  } else {
    const idx = notifications.value.findIndex(m => m.id === formData.id)
    if (idx !== -1) notifications.value[idx] = notificationData
  }
  closePopup()
}

function requestDelete(id) {
  const confirmed = window.confirm('確定要刪除嗎？')
  if (confirmed) {
    deleteNotification(id)
  }
}

function deleteNotification(id) {
  notifications.value = notifications.value.filter(m => m.id !== id)
  cancelDelete();
}

// 下載活動 JSON 檔
function downloadNotificationsJson() {
  saveToJson(notifications.value, 'notifications.json')
}

// 上傳並載入活動 JSON 檔
async function uploadNotificationsJson(event) {
  try {
    const loadedData = await loadFromJson(event)
    if (Array.isArray(loadedData)) {
      notifications.value = loadedData
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
    width:16.6%;
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
