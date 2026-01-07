<template>
    <div>
      <h2>銷售明細</h2>
      <button class="addbtn" @click="openAddPopup('product')">新增商品</button>
      <button class="addbtn" @click="downloadProductsJson">下載商品 JSON</button>
      <input type="file" @change="uploadProductsJson" accept=".json" style="margin-left:10px" />
      <table>
        <tr>
            <th><h4>圖片</h4></th>
            <th><h4>商品名稱</h4></th>
            <th><h4>商品類型</h4></th>
            <th><h4>商品內容</h4></th>
            <th><h4>操作</h4></th>
        </tr>
        <tr v-for="m in products" :key="m.id">
            <td><img v-if="m.photo" :src="m.photo" alt="課程圖片" style="max-width: 80px; max-height: 80px;" /></td>
            <td>{{ m.name }}</td>
            <td>{{ m.type }}</td>
            <td>{{ m.note }}</td>
            <td>
              <button @click="openEditPopup('product', m)">編輯</button>
              <button @click="requestDelete(m.id)" style="margin-left: 5px;">刪除</button>
            </td>
        </tr>
      </table>
      <BaslinePopup v-model="showPopup" :onSave="saveProduct">
        <h3>{{ actionType === 'add' ? '新增商品' : '編輯商品' }}</h3>
        <h5>商品名稱： <input v-model="formData.name" placeholder="商品名稱" /></h5>
        <h5>商品類型：
        <select v-model="formData.type">
            <option disabled value="">請選擇</option>
            <option value="點數方案">點數方案</option>
            <option value="期課">期課</option>
            <option value="私課">私課</option>
            <option value="樂享券請款">樂享券請款</option>
        </select></h5>
        <h5>圖片：<input id="productimgupload" type="file" @change="onFileChange" accept="image/*" /></h5>
        <div v-if="previewUrl" class="preview">
            <h5>圖片預覽：</h5>
            <img :src="previewUrl" alt="預覽圖片" style="max-width: 300px;" />
        </div>
        <h5>價格： <input v-model="formData.price" placeholder="商品價格" /> 元</h5>
        <h5>商品介紹：</h5>
        <p style="white-space: pre-line;">
        <textarea v-model="formData.note" placeholder="商品介紹"></textarea></p>
      </BaslinePopup>
    </div>
</template>

<script>
export default {
    name: 'baslineSalesmanagement',
};
</script>

<script setup>
import { ref } from 'vue'
import { useCrudPopup} from '@/composables/useCrudPopup';
import BaslinePopup from '@/components/baslinePopup.vue';

//課程清單
const products = ref([])

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

function saveProduct() {
  console.log('test');
  if (!formData.type || !formData.name || !formData.note) {
    alert('請輸入商品資料')
    return
  }
  if (actionType.value === 'add') {
    products.value.push({ ...formData, id: Date.now() })
  } else {
    const idx = products.value.findIndex(m => m.id === formData.id)
    if (idx !== -1) products.value[idx] = { ...formData }
  }
  closePopup()
}

function requestDelete(id) {
  const confirmed = window.confirm('確定要刪除嗎？')
  if (confirmed) {
    deleteProduct(id)
  }
}

function deleteProduct(id) {
  products.value = products.value.filter(m => m.id !== id)
  cancelDelete();
}

// 下載會員 JSON 檔
function downloadProductsJson() {
  saveToJson(products.value, 'products.json')
}

// 上傳並載入會員 JSON 檔
async function uploadProductsJson(event) {
  try {
    const loadedData = await loadFromJson(event)
    if (Array.isArray(loadedData)) {
      products.value = loadedData
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