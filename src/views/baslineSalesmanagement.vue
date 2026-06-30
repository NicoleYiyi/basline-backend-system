<template>
  <div>
    <h2>商品明細</h2>
    <button
      class="addbtn"
      @click="openAddPopup('product')"
    >
      新增商品
    </button>
    <button
      class="addbtn"
      @click="downloadProductsJson"
    >
      下載商品 JSON
    </button>
    <input
      type="file"
      accept=".json"
      style="margin-left:10px"
      @change="uploadProductsJson"
    >
    <table>
      <tr>
        <th><h4>圖片</h4></th>
        <th><h4>商品名稱</h4></th>
        <th><h4>方案名稱</h4></th>
        <th><h4>商品類型</h4></th>
        <th><h4>價格</h4></th>
        <th><h4>數量</h4></th>
        <th><h4>效期 (天)</h4></th>
        <th><h4>商品內容</h4></th>
        <th><h4>操作</h4></th>
      </tr>
      <tr
        v-for="m in products"
        :key="m.id"
      >
        <td>
          <img
            v-if="m.photo"
            :src="m.photo"
            alt="商品圖片"
            style="max-width: 80px; max-height: 80px;"
          >
        </td>
        <td>{{ m.name }}</td>
        <td>{{ m.packageName }}</td>
        <td>{{ formatProductType(m.productType) }}</td>
        <td>{{ m.price }}</td>
        <td>{{ m.quantity }}</td>
        <td>{{ m.expiryDays }}</td>
        <td>{{ m.note }}</td>
        <td>
          <button @click="openEditPopup('product', m)">
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
      :on-save="saveProduct"
    >
      <h3>{{ actionType === 'add' ? '新增商品' : '編輯商品' }}</h3>
      <h5>
        商品名稱： <input
          v-model="formData.name"
          placeholder="商品名稱"
        >
      </h5>
      <h5>
        商品類型：
        <select v-model="formData.productType">
          <option
            disabled
            value=""
          >
            請選擇
          </option>
          <option value="POINTS">
            點數方案
          </option>
          <option value="TICKET">
            票券
          </option>
        </select>
      </h5>
      <h5>
        方案名稱： <input
          v-model="formData.packageName"
          placeholder="方案名稱"
        >
      </h5>
      <h5>
        商品售價： <input
          v-model="formData.price"
          placeholder="商品售價"
        >
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
          placeholder="效期"
        > 天
      </h5>
      <h5>
        圖片：<input
          id="productimgupload"
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
      <h5>商品介紹：</h5>
      <p style="white-space: pre-line;">
        <textarea
          v-model="formData.note"
          placeholder="商品介紹"
        />
      </p>
    </BaslinePopup>
  </div>
</template>

<script>
export default {
    name: 'BaslineSalesmanagement',
};
</script>

<script setup>
import { ref, onMounted } from 'vue'
import { useCrudPopup} from '@/composables/useCrudPopup';
import BaslinePopup from '@/components/baslinePopup.vue';
import { danceStudioSDK } from '@/api/baslineApi.js';

//商品清單
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

// 從 API 載入商品資料
async function loadProducts() {
  try {
    const [productsResult, packagesResult] = await Promise.all([
      danceStudioSDK.getProductsDetail(),
      danceStudioSDK.getPackagesDetail(),
    ])
    console.log('商品 API 資料：', productsResult)
    console.log('商品規格包 API 資料：', packagesResult)

    const data = productsResult?.data ?? productsResult
    const productList = Array.isArray(data) ? data : [data]
    const packageData = packagesResult?.data ?? packagesResult
    const packageList = Array.isArray(packageData) ? packageData : []

    if (!productList.length || !productList[0]) {
      throw new Error('商品 API 回傳格式錯誤')
    }

    const productMap = productList.reduce((map, product) => {
      map.set(String(product.id), product)
      map.set(product.name, product)
      return map
    }, new Map())

    if (packageList.length > 0) {
      products.value = packageList.map(packageItem => {
        const product = productMap.get(String(packageItem.productId))
          ?? productMap.get(packageItem.product?.name)
          ?? {}

        return {
          id: packageItem.id,
          packageId: packageItem.id,
          productId: packageItem.productId
            ?? packageItem.product_id
            ?? product.id,
          name: product.name ?? packageItem.product?.name ?? '',
          packageName: packageItem.name ?? '',
          price: packageItem.price ?? '',
          quantity: packageItem.quantity ?? '',
          expiryDays: packageItem.expiryDays ?? '',
          productType: product.productType ?? packageItem.product?.productType ?? '',
          photo: product.imageUrl ?? product.image_url ?? '',
          note: product.description ?? packageItem.product?.description ?? '',
          isActive: packageItem.isActive ?? product.isActive ?? false,
        }
      })
      return
    }

    // API 的 packages 是陣列，表格需要將每個 package 攤平成一列。
    products.value = productList.flatMap(product => {
      const packages = Array.isArray(product?.packages) ? product.packages : []

      if (packages.length === 0) {
        return [{
          id: product.id,
          productId: product.id,
          packageId: null,
          name: product.name ?? '',
          packageName: '',
          price: '',
          quantity: '',
          expiryDays: '',
          productType: product.productType ?? '',
          photo: product.imageUrl ?? product.image_url ?? '',
          note: product.description ?? '',
          isActive: product.isActive ?? false,
        }]
      }

      return packages.map((packageItem, index) => ({
        id: packageItem.id ?? `${product.id}-${index}`,
        packageId: packageItem.id ?? packageItem.packageId ?? null,
        productId: packageItem.productId
          ?? packageItem.product_id
          ?? product.id,
        name: product.name ?? '',
        packageName: packageItem.name ?? '',
        price: packageItem.price ?? '',
        quantity: packageItem.quantity ?? '',
        expiryDays: packageItem.expiryDays ?? '',
        productType: product.productType ?? '',
        photo: product.imageUrl ?? product.image_url ?? '',
        note: product.description ?? '',
        isActive: packageItem.isActive ?? product.isActive ?? false,
      }))
    })
  } catch (error) {
    console.error('載入商品失敗:', error)
    alert('無法從伺服器載入商品資料')
  }
}

function formatProductType(productType) {
  const typeMap = {
    TICKET: '票券',
    POINT: '點數方案',
    POINTS: '點數方案',
    COURSE: '課程',
  }
  return typeMap[productType] ?? productType ?? ''
}


function isEmptyValue(value) {
  return value === '' || value == null
}

function toNumber(value) {
  if (isEmptyValue(value)) return ''
  return Number(value)
}

function assertApiSuccess(result, fallbackMessage) {
  if (result?.success === false) {
    throw new Error(result.message || result.error || fallbackMessage)
  }
}

function buildPackagePayload() {
  return {
    name: formData.packageName,
    expiryDays: toNumber(formData.expiryDays),
    quantity: toNumber(formData.quantity),
    price: toNumber(formData.price),
  }
}

async function saveProduct() {
  if (
    !formData.productType
    || !formData.name
    || !formData.packageName
    || !formData.note
    || isEmptyValue(formData.price)
    || isEmptyValue(formData.quantity)
    || isEmptyValue(formData.expiryDays)
  ) {
    alert('請輸入商品資料')
    return
  }

  try {
    if (actionType.value === 'add') {
      const result = await danceStudioSDK.createProduct({
        name: formData.name,
        description: formData.note,
        productType: formData.productType,
        packages: [buildPackagePayload()],
      })
      assertApiSuccess(result, '新增商品失敗')
    } else {
      const productId = formData.productId ?? formData.id
      const productResult = await danceStudioSDK.updateProduct({
        productId,
        name: formData.name,
        description: formData.note,
      })
      assertApiSuccess(productResult, '更新商品失敗')

      if (!formData.packageId) {
        throw new Error('找不到原始商品方案 ID，無法更新方案內容')
      }

      const packageResult = await danceStudioSDK.updatePackage({
        packageId: formData.packageId,
        ...buildPackagePayload(),
        isActive: formData.isActive ?? true,
      })
      assertApiSuccess(packageResult, '更新商品方案失敗')
    }

    closePopup()
    await loadProducts()
  } catch (error) {
    console.error('儲存商品失敗:', error)
    alert(error.message || '儲存商品失敗')
  }
}

function requestDelete(id) {
  const confirmed = window.confirm('確定要刪除嗎？')
  if (confirmed) {
    deleteProduct(id)
  }
}

async function deleteProduct(id) {
  const target = products.value.find(m => m.id === id)

  if (!target) {
    return
  }

  try {
    if (target.packageId) {
      const result = await danceStudioSDK.deletePackage(target.packageId)
      assertApiSuccess(result, '刪除商品方案失敗')
    } else if (target.packageName) {
      throw new Error('找不到原始商品方案 ID，無法刪除方案')
    } else {
      const result = await danceStudioSDK.deleteProduct(target.productId ?? target.id)
      assertApiSuccess(result, '刪除商品失敗')
    }

    cancelDelete();
    await loadProducts()
  } catch (error) {
    console.error('刪除商品失敗:', error)
    alert(error.message || '刪除商品失敗')
  }
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

onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
th,td{
    width:11%;
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
