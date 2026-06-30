<template>
  <div>
    <h2>交易管理</h2>
    <button
      class="addbtn"
      @click="openAddOrderPopup"
    >
      新增交易
    </button>
    <button
      class="addbtn"
      @click="downloadOrdersJson"
    >
      下載交易 JSON
    </button>
    <input
      type="file"
      accept=".json"
      style="margin-left:10px"
      @change="uploadOrdersJson"
    >
    <BaslinePopup
      v-model="showPopup"
      :on-save="saveOrder"
    >
      <h3>{{ actionType === 'add' ? '新增交易' : '編輯交易' }}</h3>
      <h5>
        會員：
        <input
          v-model="formData.userKeyword"
          list="order-user-options"
          placeholder="輸入會員姓名或電話"
          :disabled="actionType === 'edit'"
          @input="syncSelectedUser"
          @change="syncSelectedUser"
        >
        <datalist id="order-user-options">
          <option
            v-for="user in users"
            :key="user.id"
            :value="user.label"
          />
        </datalist>
      </h5>
      <h5 v-if="actionType === 'add'">
        商品方案：
        <select v-model="formData.packageName">
          <option
            disabled
            value=""
          >
            請選擇
          </option>
          <option
            v-for="pkg in packages"
            :key="pkg.id"
            :value="pkg.name"
          >
            {{ pkg.label }}
          </option>
        </select>
      </h5>
      <h5 v-if="actionType === 'add'">
        數量： <input
          v-model="formData.quantity"
          type="number"
          min="1"
          placeholder="數量"
        >
      </h5>
      <h5 v-if="actionType === 'edit'">
        訂單編號： <input
          v-model="formData.orderNo"
          placeholder="訂單編號"
          disabled
        >
      </h5>
      <h5 v-if="actionType === 'edit'">
        交易金額： <input
          v-model="formData.totalAmount"
          placeholder="交易金額"
          disabled
        >
      </h5>
      <h5>
        交易狀態：
        <select v-model="formData.status">
          <option
            disabled
            value=""
          >
            請選擇
          </option>
          <option value="PENDING">
            待確認
          </option>
          <option value="APPROVE">
            成功
          </option>
        </select>
      </h5>
      <h5>備註：</h5>
      <p style="white-space: pre-line;">
        <textarea
          v-model="formData.note"
          placeholder="交易備註"
        />
      </p>
    </BaslinePopup>
    <table>
      <tr>
        <th><h4>訂單編號</h4></th>
        <th><h4>會員名稱</h4></th>
        <th><h4>交易金額</h4></th>
        <th><h4>交易狀態</h4></th>
        <th><h4>操作</h4></th>
      </tr>
      <tr
        v-if="isLoading"
      >
        <td colspan="5">
          交易資料載入中
        </td>
      </tr>
      <tr
        v-else-if="orders.length === 0"
      >
        <td colspan="5">
          {{ loadError || '目前沒有交易資料' }}
        </td>
      </tr>
      <tr
        v-for="m in orders"
        :key="m.id"
      >
        <td>{{ m.orderNo }}</td>
        <td>{{ m.name }}</td>
        <td>{{ m.totalAmount }}</td>
        <td>{{ m.status }}</td>
        <td>
          <template v-if="isPendingOrder(m)">
            <button @click="approveOrder(m)">
              核准
            </button>
            <button
              style="margin-left: 5px;"
              @click="rejectOrder(m)"
            >
              駁回
            </button>
          </template>
        </td>
      </tr>
    </table>
  </div>
</template>
  
  <script>
  export default {
      name: 'BaslineOrdermanagement',
  };
  </script>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useCrudPopup} from '@/composables/useCrudPopup';
  import BaslinePopup from '@/components/baslinePopup.vue';
  import { danceStudioSDK } from '@/api/baslineApi';
  
  //交易清單
  const orders = ref([])
  const users = ref([])
  const packages = ref([])
  const isLoading = ref(true)
  const loadError = ref('')
    
  const {
    showPopup,
    // popupType,
    actionType,
    formData,
    // confirmDelete,
    openAddPopup,
    closePopup,
    // requestDelete,
    // confirmDeleteAction,
    saveToJson,
    loadFromJson
  } = useCrudPopup()

  function assertApiSuccess(result, fallbackMessage) {
    if (result?.success === false) {
      throw new Error(result.message || result.error || fallbackMessage)
    }
  }

  function getOrderUser(order) {
    return order.user ?? order.User ?? {}
  }

  function normalizeOrder(order) {
    const user = getOrderUser(order)

    return {
      id: order.id,
      userId: order.userId ?? order.user_id ?? user.id ?? '',
      name: user.name ?? order.userName ?? order.name ?? '',
      orderNo: order.orderNo || '',
      totalAmount: order.totalAmount ?? '',
      note: order.description ?? order.note ?? '',
      status: order.status || '',
    }
  }

  function normalizePackage(packageItem) {
    const productName = packageItem.product?.name ?? packageItem.productName ?? ''
    const packageName = packageItem.name ?? ''

    return {
      id: packageItem.id,
      name: packageName,
      label: [productName, packageName].filter(Boolean).join(' - ') || packageName,
      price: packageItem.price ?? '',
      isActive: packageItem.isActive ?? true,
    }
  }

  function getErrorMessage(error, fallbackMessage) {
    if (error?.message === 'SESSION_EXPIRED') return '登入已過期，請重新登入'
    return error.response?.data?.message || error.responseData?.message || error.message || fallbackMessage
  }

  function formatUserLabel(user) {
    return [
      user.name || user.phone || `會員 ${user.id}`,
      user.phone,
      user.id ? `ID:${user.id}` : '',
    ].filter(Boolean).join(' / ')
  }

  function syncSelectedUser() {
    const keyword = String(formData.userKeyword || '').trim()
    const selectedUser = users.value.find(user => user.label === keyword)

    formData.userId = selectedUser?.id || ''
  }

  function openAddOrderPopup() {
    openAddPopup('order')
    formData.userId = ''
    formData.userKeyword = ''
    formData.packageName = ''
    formData.quantity = 1
    formData.status = 'PENDING'
    formData.note = ''
  }
  
  // 從 API 載入交易資料
  async function loadOrders() {
    isLoading.value = true
    loadError.value = ''

    try {
      const result = await danceStudioSDK.getOrders()
      console.log('交易 API 資料：', result)
  
      const data = result?.data ?? result
      orders.value = Array.isArray(data) ? data.map(normalizeOrder) : []
    } catch (error) {
      console.error('載入交易失敗:', error)
      loadError.value = getErrorMessage(error, '無法從伺服器載入交易資料')
      alert(loadError.value)
    } finally {
      isLoading.value = false
    }
  }

  async function loadOrderFormOptions() {
    try {
      const [usersResult, packagesResult] = await Promise.all([
        danceStudioSDK.getUsersDetail(),
        danceStudioSDK.getPackagesDetail(),
      ])

      const usersData = usersResult?.data ?? usersResult
      const packagesData = packagesResult?.data ?? packagesResult

      users.value = Array.isArray(usersData)
        ? usersData.map(user => ({
          id: user.id,
          name: user.name || user.phone || `會員 ${user.id}`,
          phone: user.phone || '',
          label: formatUserLabel(user),
        }))
        : []

      packages.value = Array.isArray(packagesData)
        ? packagesData
          .map(normalizePackage)
          .filter(packageItem => packageItem.name && packageItem.isActive !== false)
        : []
    } catch (error) {
      console.error('載入交易表單選項失敗:', error)
      alert(getErrorMessage(error, '載入會員或方案資料失敗'))
    }
  }
  
  async function applyOrderStatus(orderNo, status) {
    if (status === 'APPROVE') {
      return danceStudioSDK.approveOrder(orderNo)
    }
    if (status === 'REJECTED') {
      return danceStudioSDK.rejectOrder(orderNo)
    }
    if (status === 'CANCELLED') {
      return danceStudioSDK.cancelOrder(orderNo)
    }
    return null
  }

  function isPendingOrder(order) {
    return String(order.status || '').toUpperCase() === 'PENDING'
  }

  async function updateOrderStatus(order, status, actionText) {
    if (!order.orderNo) {
      alert('找不到訂單編號，無法更新交易')
      return
    }

    const confirmed = window.confirm(`確定要${actionText}這筆訂單嗎？`)
    if (!confirmed) return

    try {
      const result = await applyOrderStatus(order.orderNo, status)
      assertApiSuccess(result, `${actionText}交易失敗`)
      await loadOrders()
    } catch (error) {
      console.error(`${actionText}交易失敗:`, error)
      alert(getErrorMessage(error, `${actionText}交易失敗`))
    }
  }

  function approveOrder(order) {
    updateOrderStatus(order, 'APPROVE', '核准')
  }

  function rejectOrder(order) {
    updateOrderStatus(order, 'REJECTED', '駁回')
  }

  async function saveOrder() {
    if (!formData.status) {
      alert('請輸入交易資料')
      return
    }

    try {
      if (actionType.value === 'add') {
        const quantity = Number(formData.quantity)

        syncSelectedUser()

        if (!formData.userId || !formData.packageName || !Number.isFinite(quantity) || quantity <= 0) {
          alert('請輸入交易資料')
          return
        }

        const result = await danceStudioSDK.createOrder(Number(formData.userId), [
          {
            packageName: formData.packageName,
            quantity,
          },
        ])
        assertApiSuccess(result, '新增交易失敗')

        const createdOrderNo = result?.data?.orderNo
        if (createdOrderNo && formData.status !== 'PENDING') {
          const statusResult = await applyOrderStatus(createdOrderNo, formData.status)
          assertApiSuccess(statusResult, '更新交易狀態失敗')
        }
      } else {
        if (!formData.orderNo) {
          alert('找不到訂單編號，無法更新交易')
          return
        }

        const original = orders.value.find(order => order.id === formData.id)
        if (!original || original.status !== formData.status) {
          const result = await applyOrderStatus(formData.orderNo, formData.status)
          assertApiSuccess(result, '更新交易狀態失敗')
        }
      }

      closePopup()
      await loadOrders()
    } catch (error) {
      console.error('儲存交易失敗:', error)
      alert(getErrorMessage(error, '儲存交易失敗'))
    }
  }
  
  // 下載交易 JSON 檔
  function downloadOrdersJson() {
    const exportData = orders.value.map(t => ({
      ...t,
      show: t.show ? '顯示' : '隱藏'
    }))
    saveToJson(exportData, 'orders.json')
  }
  
  // 上傳並載入交易 JSON 檔
  async function uploadOrdersJson(event) {
    try {
      const loadedData = await loadFromJson(event)
      if (Array.isArray(loadedData)) {
        orders.value = loadedData.map(t => ({
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
    
  onMounted(() => {
    loadOrderFormOptions()
    loadOrders()
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
  
