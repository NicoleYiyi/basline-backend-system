<template>
  <div>
    <h2>方案設定</h2>
    <button
      class="addbtn"
      @click="openAddPopup('plan')"
    >
      新增方案
    </button>
    <button
      class="addbtn"
      @click="downloadPlansJson"
    >
      下載方案 JSON
    </button>
    <input
      type="file"
      accept=".json"
      style="margin-left:10px"
      @change="uploadPlansJson"
    >
    <table>
      <tr>
        <th><h4>方案名稱</h4></th>
        <th><h4>類型</h4></th>
        <th><h4>價錢</h4></th>
        <th><h4>效期</h4></th>
        <th><h4>數量</h4></th>
        <th><h4>操作</h4></th>
      </tr>
      <tr
        v-if="isLoading"
      >
        <td colspan="6">
          方案資料載入中
        </td>
      </tr>
      <tr
        v-else-if="plans.length === 0"
      >
        <td colspan="6">
          {{ loadError || '目前沒有 packages 方案資料' }}
        </td>
      </tr>
      <tr
        v-for="m in plans"
        :key="m.id"
      >
        <td>{{ m.name }}</td>
        <td>{{ m.type }}</td>
        <td>{{ m.price }}</td>
        <td>{{ m.expiryDays }}</td>
        <td>{{ m.quantity }}</td>
        <td>
          <button @click="openEditPopup('plan', m)">
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
      :on-save="savePlan"
    >
      <h3>{{ actionType === 'add' ? '新增方案' : '編輯方案' }}</h3>
      <h5>
        方案名稱： <input
          v-model="formData.name"
          placeholder="方案名稱"
        >
      </h5>
      <h5>
        類型：
        <select v-model="formData.type">
          <option
            disabled
            value=""
          >
            請選擇
          </option>
          <option value="點數">
            點數
          </option>
          <option value="票券">
            票券
          </option>
        </select>
      </h5>
      <h5>
        價格： <input
          v-model="formData.price"
          placeholder="價格"
        > 元
      </h5>
      <h5>
        數量： <input
          v-model="formData.quantity"
          placeholder="數量"
        >
      </h5>
      <h5>
        效期： <input
          v-model="formData.expiryDays"
          placeholder="使用期限"
        > 天
      </h5>
      <h5>方案介紹：</h5>
      <p style="white-space: pre-line;">
        <textarea
          v-model="formData.note"
          placeholder="方案介紹"
        />
      </p>
    </BaslinePopup>
  </div>
</template>

<script>
export default {
    name: 'BaslinePlansetting',
};
</script>

<script setup>
import { ref, onMounted } from 'vue'
import { useCrudPopup} from '@/composables/useCrudPopup';
import BaslinePopup from '@/components/baslinePopup.vue';
import { fetchPlans } from '@/api/baslineApi.js';

//方案清單
const plans = ref([])
const isLoading = ref(true)
const loadError = ref('')

const {
  showPopup,
  // popupType,
  actionType,
  formData,
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

// 從 API 載入方案資料
async function loadPlans() {
  isLoading.value = true
  loadError.value = ''

  try {
    const result = await fetchPlans()
    console.log('方案 API 資料：', result)

    if (!Array.isArray(result)) {
      throw new Error('方案 API 回傳格式錯誤')
    }

    // fetchPlans 已將每個 package 攤平成一筆方案資料。
    plans.value = result.map(plan => ({
      id: plan.id,
      productId: plan.productId,
      name: plan.name,
      type: formatProductType(plan.productType),
      note: plan.description,
      quantity: plan.quantity,
      price: plan.price,
      expiryDays: plan.expiryDays,
    }))

    console.log(
      `方案表格資料共 ${plans.value.length} 筆：`,
      JSON.stringify(plans.value)
    )

    if (plans.value.length === 0) {
      loadError.value = '目前連線的 /products API 沒有回傳 packages'
    }
  } catch (error) {
    console.error('載入方案失敗:', error)
    loadError.value = error.message || '無法從伺服器載入方案資料'
    alert('無法從伺服器載入方案資料')
  } finally {
    isLoading.value = false
  }
}

function formatProductType(productType) {
  const typeMap = {
    TICKET: '票券',
    POINT: '點數',
    POINTS: '點數',
    COURSE: '課程',
  }
  return typeMap[productType] ?? productType ?? ''
}


function savePlan() {
  console.log('test');
  const priceMissing = formData.price === '' || formData.price == null
  if (!formData.type || !formData.name || priceMissing || !formData.quantity || !formData.expiryDays) {
    alert('請輸入方案資料')
    return
  }
  if (actionType.value === 'add') {
    plans.value.push({ ...formData, id: Date.now() })
  } else {
    const idx = plans.value.findIndex(m => m.id === formData.id)
    if (idx !== -1) plans.value[idx] = { ...formData }
  }
  closePopup()
}

function requestDelete(id) {
  const confirmed = window.confirm('確定要刪除嗎？')
  if (confirmed) {
    deletePlan(id)
  }
}

function deletePlan(id) {
  plans.value = plans.value.filter(m => m.id !== id)
  cancelDelete();
}

// 下載方案 JSON 檔
function downloadPlansJson() {
  saveToJson(plans.value, 'plans.json')
}

// 上傳並載入方案 JSON 檔
async function uploadPlansJson(event) {
  try {
    const loadedData = await loadFromJson(event)
    if (Array.isArray(loadedData)) {
      plans.value = loadedData
    } else {
      alert('JSON 格式錯誤，預期為陣列')
    }
  } catch (e) {
    alert(e)
  }
}

onMounted(() => {
  loadPlans()
})
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
