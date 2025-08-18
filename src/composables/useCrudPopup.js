import { ref, reactive } from 'vue'

export function useCrudPopup() {
  const showPopup = ref(false)
  const popupType = ref('') // member | course
  const actionType = ref('add') // add | edit
  const formData = reactive({})
  const previewUrl = ref(null) //圖片預覽用
  const confirmDelete = ref(false)
  const deleteTargetId = ref(null)

  function openAddPopup(type) {
    popupType.value = type
    actionType.value = 'add'
    resetForm()
    previewUrl.value = null
    showPopup.value = true
  }

  function openEditPopup(type, data) {
    popupType.value = type
    actionType.value = 'edit'
    Object.assign(formData, data)
    previewUrl.value = data.photo || null
    showPopup.value = true
  }

  function closePopup() {
    showPopup.value = false
  }

  function resetForm() {
    for (const key in formData) {
      delete formData[key]
    }
  }

  function requestDelete(id) {
    deleteTargetId.value = id
    confirmDelete.value = true
  }

  function cancelDelete() {
    confirmDelete.value = false
    deleteTargetId.value = null
  }

  function confirmDeleteAction(deleteCallback) {
    if (typeof deleteCallback === 'function' && deleteTargetId.value !== null) {
      deleteCallback(deleteTargetId.value)
    }
    cancelDelete()
  }

  // 下載 JSON 檔（傳入要存的資料陣列和檔名）
  function saveToJson(dataArray, fileName = 'data.json') {
    if (!dataArray || dataArray.length === 0) {
      alert('目前沒有任何資料可下載')
      return
    }
    const jsonStr = JSON.stringify(dataArray, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  // 從上傳的 JSON 檔讀取資料，並傳回 parsed array（外部呼叫後自行更新列表）
  function loadFromJson(event) {
    return new Promise((resolve, reject) => {
      const file = event.target.files?.[0]
      if (!file) {
        reject('未選擇檔案')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result)
          resolve(parsed)
        } catch (e) {
          reject('解析 JSON 失敗')
        }
      }
      reader.onerror = () => reject('讀取檔案錯誤')
      reader.readAsText(file)
    })
  }

  return {
    showPopup,
    popupType,
    actionType,
    formData,
    previewUrl,
    confirmDelete,
    deleteTargetId,
    openAddPopup,
    openEditPopup,
    closePopup,
    requestDelete,
    cancelDelete,
    confirmDeleteAction,
    saveToJson,
    loadFromJson
  }
}