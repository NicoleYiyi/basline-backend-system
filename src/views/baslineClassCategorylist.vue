<template>
  <div>
    <h2>舞風/課程類型清單</h2>
    <button
      class="addbtn"
      @click="openOptionPopup('style')"
    >
      編輯舞蹈風格
    </button>
    <button
      class="addbtn"
      @click="openOptionPopup('type')"
    >
      編輯課程類型
    </button>
    <table>
      <tr>
        <th><h4>舞蹈風格</h4></th>
        <th><h4>課程類型</h4></th>
      </tr>
      <tr
        v-for="m in classcats"
        :key="m.id"
      >
        <td>{{ m.style }}</td>
        <td>{{ m.type }}</td>
      </tr>
    </table>
    <BaslinePopup
      v-model="showOptionPopup"
      :on-save="saveOptions"
    >
      <h3>編輯{{ optionPopupTitle }}</h3>
      <div
        v-for="(option, index) in editableOptions"
        :key="index"
        class="option-row"
      >
        <input
          v-model="editableOptions[index]"
          :placeholder="`${optionPopupTitle}項目`"
        >
        <button
          type="button"
          class="del-btn"
          @click="removeOption(index)"
        >
          刪除
        </button>
      </div>
      <button
        type="button"
        class="close-btn add-option-btn"
        @click="addOption"
      >
        新增項目
      </button>
    </BaslinePopup>
  </div>
</template>

<script>
export default {
    name: 'BaslineClassCategorylist',
};
</script>

<script setup>
import { ref, computed, onMounted } from 'vue'
import BaslinePopup from '@/components/baslinePopup.vue';
import { danceStudioSDK } from '@/api/baslineApi';

const styleOptions = ref([])
const typeOptions = ref([])
const showOptionPopup = ref(false)
const optionPopupTarget = ref('')
const editableOptions = ref([])
const isSaving = ref(false)

const optionPopupTitle = computed(() => {
  return optionPopupTarget.value === 'style' ? '舞蹈風格' : '課程類型'
})

function normalizeOption(option) {
  if (typeof option === 'string') return option.trim()
  if (option && typeof option === 'object') {
    return String(option.name || option.title || option.label || option.value || '').trim()
  }
  return ''
}

function normalizeOptions(options) {
  if (!Array.isArray(options)) return []

  return [...new Set(options.map(normalizeOption).filter(Boolean))]
}

function assertApiSuccess(result) {
  if (result?.success === false) {
    throw new Error(result.message || result.error || 'API 回傳失敗')
  }
}

function getSaveErrorMessage(error) {
  if (error.message === 'SESSION_EXPIRED') return '登入已過期，請重新登入'
  if (error.response?.status === 401) return '尚未登入或登入已過期，請重新登入'
  if (error.response?.status === 403) return '目前帳號沒有新增權限'
  return error.response?.data?.message || error.responseData?.message || error.message || '請確認 API 回傳內容'
}

const classcats = computed(() => {
  const rowCount = Math.max(styleOptions.value.length, typeOptions.value.length)

  return Array.from({ length: rowCount }, (_, index) => ({
    id: index,
    style: styleOptions.value[index] || '',
    type: typeOptions.value[index] || '',
  }))
})

function getOptionRef(target) {
  return target === 'style' ? styleOptions : typeOptions
}

function openOptionPopup(target) {
  optionPopupTarget.value = target
  editableOptions.value = [...getOptionRef(target).value]
  showOptionPopup.value = true
}

function addOption() {
  editableOptions.value.push('')
}

function removeOption(index) {
  editableOptions.value.splice(index, 1)
}

async function saveOptions() {
  if (isSaving.value) return

  const uniqueOptions = normalizeOptions(editableOptions.value)
  const optionRef = getOptionRef(optionPopupTarget.value)
  const currentOptions = normalizeOptions(optionRef.value)
  const addedOptions = uniqueOptions.filter(option => !currentOptions.includes(option))
  const removedOptions = currentOptions.filter(option => !uniqueOptions.includes(option))

  if (uniqueOptions.length === 0) {
    alert(`請至少保留一個${optionPopupTitle.value}項目`)
    return
  }

  if (removedOptions.length > 0) {
    alert('目前 API 只支援新增項目；修改名稱或刪除項目需要後端提供更新/刪除 API')
    return
  }

  try {
    isSaving.value = true

    let results
    if (optionPopupTarget.value === 'style') {
      results = await Promise.all(addedOptions.map(option => danceStudioSDK.createCourseCategory(option)))
    } else {
      results = await Promise.all(addedOptions.map(option => danceStudioSDK.createCourseType(option)))
    }
    results.forEach(assertApiSuccess)

    optionRef.value = uniqueOptions
    showOptionPopup.value = false
    await loadClasscats()
  } catch (error) {
    console.error(`儲存${optionPopupTitle.value}失敗:`, error)
    alert(`儲存${optionPopupTitle.value}失敗：${getSaveErrorMessage(error)}`)
  } finally {
    isSaving.value = false
  }
}

async function loadClasscats() {
  try {
    const [categoriesResult, typesResult] = await Promise.all([
      danceStudioSDK.getCourseCategories(),
      danceStudioSDK.getCourseTypes(),
    ])
    console.log('舞風 API 資料：', categoriesResult)
    console.log('課程類型 API 資料：', typesResult)

    styleOptions.value = normalizeOptions(categoriesResult.data)
    typeOptions.value = normalizeOptions(typesResult.data)
  } catch (error) {
    console.error('載入舞風/課程類型失敗:', error)
    alert('無法從伺服器載入舞風/課程類型資料')
  }
}

onMounted(() => {
  loadClasscats()
})
</script>

<style scoped>
th,td{
    width:50%;
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
.option-row{
  display:flex;
  gap:8px;
  margin-top:8px;
}
.option-row input{
  flex:1;
}
.add-option-btn{
  margin-top:12px;
}
</style>
