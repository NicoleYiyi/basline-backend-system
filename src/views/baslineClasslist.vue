<template>
  <div>
    <h2>課程清單</h2>
    <button
      class="addbtn"
      @click="openClassAddPopup"
    >
      新增課程
    </button>
    <button
      class="addbtn"
      @click="downloadClassesJson"
    >
      下載課程 JSON
    </button>
    <input
      type="file"
      accept=".json"
      style="margin-left:10px"
      @change="uploadClassesJson"
    >
    <label class="filter">
      課程類型：
      <select v-model="typeFilter">
        <option value="all">全部</option>
        <option
          v-for="option in typeOptions"
          :key="option"
          :value="option"
        >
          {{ option }}
        </option>
      </select>
    </label>
    <table>
      <tr>
        <th><h4>圖片</h4></th>
        <th><h4>課程名稱</h4></th>
        <th><h4>課程類型</h4></th>
        <th><h4>課程狀態</h4></th>
        <th><h4>操作</h4></th>
      </tr>
      <tr
        v-for="m in filteredClasses"
        :key="m.id"
      >
        <td>
          <img
            v-if="m.photo"
            :src="m.photo"
            alt="課程圖片"
            style="max-width: 80px; max-height: 80px;"
          >
        </td>
        <td>{{ m.name }}</td>
        <td>{{ m.style }}, {{ m.type }}</td>
        <td>{{ getCourseStatusLabel(m.status) }}</td>
        <td>
          <button @click="openClassEditPopup(m)">
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
      :on-save="saveClass"
    >
      <h3>{{ actionType === 'add' ? '新增課程' : '編輯課程' }}</h3>
      <h5>
        課程名稱： <input
          v-model="formData.name"
          placeholder="課程名稱"
        >
      </h5>
      <h5>
        上課時間： <VueDatePicker
          v-model="formData.startTime"
          format="yyyy/MM/dd HH:mm"
          placeholder="上課時間"
          :clearable="true"
          :enable-seconds="false"
          :time-config="dateTimePickerTimeConfig"
        />
      </h5>
      <h5>
        下課時間： <VueDatePicker
          v-model="formData.endTime"
          format="yyyy/MM/dd HH:mm"
          placeholder="下課時間"
          :clearable="true"
          :enable-seconds="false"
          :time-config="dateTimePickerTimeConfig"
        />
      </h5>
      <h5>
        開始預約時間： <VueDatePicker
          v-model="formData.bookingStartTime"
          format="yyyy/MM/dd HH:mm"
          placeholder="開始預約時間"
          :clearable="true"
          :enable-seconds="false"
          :time-config="dateTimePickerTimeConfig"
        />
      </h5>
      <h5>
        結束預約時間： <VueDatePicker
          v-model="formData.bookingEndTime"
          format="yyyy/MM/dd HH:mm"
          placeholder="結束預約時間"
          :clearable="true"
          :enable-seconds="false"
          :time-config="dateTimePickerTimeConfig"
        />
      </h5>
      <h5>
        教師名稱：
        <select v-model="formData.teacher">
          <option
            disabled
            value=""
          >
            請選擇
          </option>
          <option
            v-for="teacher in teacherOptions"
            :key="teacher.id || teacher.name"
            :value="teacher.name"
          >
            {{ teacher.name }}
          </option>
        </select>
      </h5>
      <h5>
        舞蹈風格：
        <select v-model="formData.style">
          <option
            disabled
            value=""
          >
            請選擇
          </option>
          <option
            v-for="option in styleOptions"
            :key="option"
            :value="option"
          >
            {{ option }}
          </option>
        </select>
      </h5>
      <h5>
        課程類型：
        <select v-model="formData.type">
          <option
            disabled
            value=""
          >
            請選擇
          </option>
          <option
            v-for="option in typeOptions"
            :key="option"
            :value="option"
          >
            {{ option }}
          </option>
        </select>
      </h5>
      <template v-if="formData.type === '期課'">
        <h5>
          期課堂數：
          <input
            v-model.number="formData.periodLessons"
            min="1"
            placeholder="堂數"
            type="number"
          >
          堂
        </h5>
      </template>
      <h5>
        最小開課數： <input
          v-model="formData.minCapacity"
          placeholder="最小開課數"
        >
      </h5>
      <h5>
        最大開課數： <input
          v-model="formData.maxCapacity"
          placeholder="最大開課數"
        >
      </h5>
      <h5>
        場館：
        <select
          v-model="formData.venue"
          @change="handleVenueChange"
        >
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
      </h5>
      <h5>
        教室：
        <select v-model="formData.room">
          <option
            disabled
            value=""
          >
            請選擇
          </option>
          <option
            v-for="room in roomOptions"
            :key="room.id || room.name"
            :value="room.name"
          >
            {{ room.name }}
          </option>
        </select>
      </h5>
      <h5>
        支付方式：
        <select
          v-model="formData.paymentMethodName"
          @change="handlePaymentMethodChange"
        >
          <option
            disabled
            value=""
          >
            請選擇
          </option>
          <option
            v-for="option in paymentMethodOptions"
            :key="option.id || option.name"
            :value="option.name"
          >
            {{ option.name }}
          </option>
        </select>
      </h5>
      <h5 v-if="isSelectedPointPaymentMethod">
        點數：
        <input
          v-model.number="formData.consumeValue"
          min="1"
          placeholder="請輸入點數"
          type="number"
        >
      </h5>
      <h5>
        圖片：<input
          id="classimgupload"
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
          style="max-width: 100px;"
        >
      </div>
      <h5>課程介紹：</h5>
      <p style="white-space: pre-line;">
        <textarea
          v-model="formData.note"
          placeholder="課程介紹"
        />
      </p>
      <h5>
        課程狀態：
        <select v-model="formData.status">
          <option
            v-for="option in editableCourseStatusOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </h5>
    </BaslinePopup>
  </div>
</template>

<script>
export default {
    name: 'BaslineClasslist',
};
</script>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCrudPopup} from '@/composables/useCrudPopup';
import BaslinePopup from '@/components/baslinePopup.vue';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import { danceStudioSDK } from '@/api/baslineApi';

//課程清單
const classes = ref([])
const typeFilter = ref('all')
const styleOptions = ref([])
const typeOptions = ref([])
const teacherOptions = ref([])
const venueOptions = ref([])
const paymentMethodOptions = ref([])
const isSaving = ref(false)
const courseDateTimeFields = ['startTime', 'endTime', 'bookingStartTime', 'bookingEndTime']
const dateTimePickerTimeConfig = {
  enableSeconds: false,
  timePickerInline: true
}
const COURSE_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  BOOKING_CLOSED: 'BOOKING_CLOSED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED'
}
const courseStatusLabels = {
  [COURSE_STATUS.DRAFT]: '編輯中',
  [COURSE_STATUS.PUBLISHED]: '上架中（開放預約）',
  [COURSE_STATUS.BOOKING_CLOSED]: '截止預約 / 停止報名',
  [COURSE_STATUS.CANCELLED]: '已取消',
  [COURSE_STATUS.COMPLETED]: '已結束'
}
const editableCourseStatusOptions = [
  { value: COURSE_STATUS.DRAFT, label: courseStatusLabels[COURSE_STATUS.DRAFT] },
  { value: COURSE_STATUS.PUBLISHED, label: courseStatusLabels[COURSE_STATUS.PUBLISHED] }
]

const filteredClasses = computed(() => {
  if (typeFilter.value === 'all') return classes.value
  return classes.value.filter(m => {
    const type = m.type || ''
    if (typeFilter.value === '團課') return type === '團課' || type === '團體課'
    if (typeFilter.value === '一對一') return type === '一對一' || type === '私課'
    return type === typeFilter.value
  })
})

const selectedVenue = computed(() => venueOptions.value.find(venue => venue.name === formData.venue))

const roomOptions = computed(() => {
  const rooms = selectedVenue.value?.rooms
  if (!Array.isArray(rooms)) return []

  return rooms
    .map(room => {
      if (typeof room === 'string') {
        return { id: room, name: room }
      }
      return {
        ...room,
        name: String(room?.name || room?.roomName || room?.title || '').trim()
      }
    })
    .filter(room => room.name)
})

const selectedPaymentMethod = computed(() => paymentMethodOptions.value.find(option => option.name === formData.paymentMethodName))

const isSelectedPointPaymentMethod = computed(() => {
  const option = selectedPaymentMethod.value
  if (!option) return false

  return getPaymentMethodType(option) === 'POINTS'
})

function coerceDatePickerValue(value) {
  if (!value) return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  const parsed = new Date(String(value).trim().replace(',', 'T').replace(/\//g, '-').replace(' ', 'T'))
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatDateTimeWithTimezone(value) {
  const date = coerceDatePickerValue(value)
  if (!date) return undefined

  const pad = number => String(number).padStart(2, '0')
  const offsetMinutes = -date.getTimezoneOffset()
  const offsetSign = offsetMinutes >= 0 ? '+' : '-'
  const absoluteOffsetMinutes = Math.abs(offsetMinutes)
  const offsetHours = pad(Math.floor(absoluteOffsetMinutes / 60))
  const offsetRemainingMinutes = pad(absoluteOffsetMinutes % 60)

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${offsetSign}${offsetHours}:${offsetRemainingMinutes}`
}

function normalizeFormDateTimeFields() {
  courseDateTimeFields.forEach(field => {
    formData[field] = coerceDatePickerValue(formData[field])
  })
}

function openClassAddPopup() {
  openAddPopup('class')
  courseDateTimeFields.forEach(field => {
    formData[field] = null
  })
  formData.venue = ''
  formData.room = ''
  formData.teacher = ''
  formData.paymentMethodName = ''
  formData.consumeValue = ''
  formData.status = COURSE_STATUS.DRAFT
}

function openClassEditPopup(course) {
  openEditPopup('class', course)
  normalizeFormDateTimeFields()
  normalizeFormSelectionFields()
  formData.status = normalizeCourseStatus(formData.status, formData.show)
}

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

async function loadCourseOptions() {
  try {
    const [categoriesResult, typesResult, teachersResult, venuesResult, productsResult] = await Promise.all([
      danceStudioSDK.getCourseCategories(),
      danceStudioSDK.getCourseTypes(),
      danceStudioSDK.getTeachersDetail(),
      danceStudioSDK.getVenuesDetail(),
      danceStudioSDK.getProductsDetail(),
    ])
    console.log('舞風 API 資料：', categoriesResult)
    console.log('課程類型 API 資料：', typesResult)
    console.log('老師 API 資料：', teachersResult)
    console.log('場館 API 資料：', venuesResult)
    console.log('商品 API 資料：', productsResult)

    styleOptions.value = normalizeOptions(categoriesResult.data)
    typeOptions.value = normalizeOptions(typesResult.data)
    teacherOptions.value = normalizeTeacherOptions(teachersResult.data)
    venueOptions.value = normalizeVenueOptions(venuesResult.data)
    paymentMethodOptions.value = normalizeProductOptions(productsResult.data)

    if (typeFilter.value !== 'all' && !typeOptions.value.includes(typeFilter.value)) {
      typeFilter.value = 'all'
    }
  } catch (error) {
    console.error('載入舞風/課程類型失敗:', error)
    alert('無法從伺服器載入舞風/課程類型資料')
  }
}

function normalizeTeacherOptions(teachers) {
  if (!Array.isArray(teachers)) return []

  return teachers
    .map(teacher => ({
      ...teacher,
      name: getTeacherName(teacher)
    }))
    .filter(teacher => teacher.name)
}

function normalizeVenueOptions(venues) {
  if (!Array.isArray(venues)) return []

  return venues
    .map(venue => ({
      ...venue,
      name: String(venue?.name || venue?.venueName || '').trim(),
      rooms: Array.isArray(venue?.rooms) ? venue.rooms : []
    }))
    .filter(venue => venue.name)
}

function normalizeProductOptions(products) {
  if (!Array.isArray(products)) return []

  return products
    .map(product => ({
      ...product,
      name: String(product?.name || product?.ProductName || product?.title || '').trim(),
      productType: product?.productType || product?.type || product?.ProductType || ''
    }))
    .filter(product => product.name)
}

function getPaymentMethodName(paymentMethods) {
  const firstPaymentMethod = Array.isArray(paymentMethods) ? paymentMethods[0] : paymentMethods
  if (typeof firstPaymentMethod === 'string') return firstPaymentMethod
  if (!firstPaymentMethod || typeof firstPaymentMethod !== 'object') return ''

  return String(
    firstPaymentMethod.ProductName
      || firstPaymentMethod.productName
      || firstPaymentMethod.product?.name
      || firstPaymentMethod.product
      || firstPaymentMethod.paymentMethod
      || firstPaymentMethod.name
      || ''
  ).trim()
}

function getPaymentMethodConsumeValue(paymentMethods) {
  const firstPaymentMethod = Array.isArray(paymentMethods) ? paymentMethods[0] : paymentMethods
  if (!firstPaymentMethod || typeof firstPaymentMethod !== 'object') return ''

  return firstPaymentMethod.consumeValue ?? firstPaymentMethod.points ?? firstPaymentMethod.value ?? ''
}

function getVenueName(venue) {
  if (typeof venue === 'string') return venue
  if (!venue || typeof venue !== 'object') return ''

  return String(venue.name || venue.venueName || venue.title || '').trim()
}

function getRoomName(room) {
  if (typeof room === 'string') return room
  if (!room || typeof room !== 'object') return ''

  return String(room.name || room.roomName || room.title || '').trim()
}

function getTeacherName(teacher) {
  if (typeof teacher === 'string') return teacher
  if (!teacher || typeof teacher !== 'object') return ''

  return String(teacher.name || teacher.teacherName || teacher.title || teacher.user?.name || '').trim()
}

function normalizeCourseStatus(status, legacyShow) {
  if (Object.values(COURSE_STATUS).includes(status)) return status
  if (legacyShow === true || legacyShow === 1 || legacyShow === '顯示') return COURSE_STATUS.PUBLISHED
  return COURSE_STATUS.DRAFT
}

function isPublishedCourse(status) {
  return normalizeCourseStatus(status) === COURSE_STATUS.PUBLISHED
}

function getCourseStatusLabel(status) {
  const normalizedStatus = normalizeCourseStatus(status)
  return courseStatusLabels[normalizedStatus] || normalizedStatus
}

function normalizeFormSelectionFields() {
  formData.paymentMethodName = formData.paymentMethodName || getPaymentMethodName(formData.paymentMethods)
  formData.consumeValue = formData.consumeValue || getPaymentMethodConsumeValue(formData.paymentMethods)
  formData.teacher = getTeacherName(formData.teacher) || formData.teacher || ''
  if (!formData.venue) formData.venue = ''
  if (!formData.room) formData.room = ''
  formData.status = normalizeCourseStatus(formData.status, formData.show)
}

function handleVenueChange() {
  if (!roomOptions.value.some(room => room.name === formData.room)) {
    formData.room = ''
  }
}

function handlePaymentMethodChange() {
  if (!isSelectedPointPaymentMethod.value) {
    formData.consumeValue = ''
  }
}

function getPaymentMethodType(option) {
  const productType = String(option?.productType || option?.type || '').toUpperCase()
  if (productType === 'POINT' || productType === 'POINTS') return 'POINTS'
  if (productType === 'TICKET') return 'TICKET'
  if (option?.name?.includes('點')) return 'POINTS'
  if (option?.name?.includes('票') || option?.name?.includes('券')) return 'TICKET'
  return ''
}

function buildPaymentMethodsPayload() {
  if (!formData.paymentMethodName) return []

  const selected = selectedPaymentMethod.value || {}
  const paymentMethod = getPaymentMethodType(selected)
  const payload = {
    paymentMethod,
    product: formData.paymentMethodName,
  }

  if (selected.id !== undefined && selected.id !== null) {
    payload.productId = selected.id
  }
  if (isSelectedPointPaymentMethod.value && formData.consumeValue) {
    payload.consumeValue = formData.consumeValue
  }

  return [payload]
}

// 從 API 載入課程資料
async function loadClasses() {
  try {
    const result = await danceStudioSDK.getCoursesDetail()
    console.log('課程 API 資料：', result)

    classes.value = result.data.map(t => ({
      id: t.id,
      name: t.name || t.title || '',
      style: t.style || t.courseCategory || t.category?.name || t.category || '',
      type: t.type || t.courseType || '',
      periodLessons: t.periodLessons || t.period_lessons || t.totalClasses || '',
      photo: t.photo || t.image_url || t.imageUrl || '',
      note: t.note || t.description || '',
      show: isPublishedCourse(normalizeCourseStatus(t.status, t.show ?? t.is_visible ?? t.isActive)),
      teacher: getTeacherName(t.teacher),
      venue: getVenueName(t.venue),
      room: getRoomName(t.room),
      startTime: t.startTime || t.starttime || t.start_time,
      endTime: t.endTime || t.endtime || t.end_time,
      bookingStartTime: t.bookingStartTime || t.bookingstarttime || t.booking_start_time,
      bookingEndTime: t.bookingEndTime || t.bookingendtime || t.booking_end_time,
      minCapacity: t.minCapacity,
      maxCapacity: t.maxCapacity,
      paymentMethods: t.paymentMethods || t.PaymentMethods,
      paymentMethodName: getPaymentMethodName(t.paymentMethods || t.PaymentMethods),
      consumeValue: getPaymentMethodConsumeValue(t.paymentMethods || t.PaymentMethods),
      status: normalizeCourseStatus(t.status, t.show ?? t.is_visible ?? t.isActive)
    }))
  } catch (error) {
    console.error('載入課程失敗:', error)
    alert('無法從伺服器載入課程資料')
  }
}

function buildCoursePayload() {
  const payload = {
    courseCategory: formData.style,
    courseType: formData.type,
    title: formData.name,
    name: formData.name,
    style: formData.style,
    type: formData.type,
    description: formData.note,
    note: formData.note,
    imageUrl: formData.photo,
    image_url: formData.photo,
    photo: formData.photo,
    periodLessons: formData.periodLessons || undefined,
    period_lessons: formData.periodLessons || undefined,
    totalClasses: formData.type === '期課' ? formData.periodLessons : undefined,
    show: isPublishedCourse(formData.status),
    is_visible: isPublishedCourse(formData.status) ? 1 : 0,
    isActive: isPublishedCourse(formData.status),
    status: normalizeCourseStatus(formData.status),
    teacher: formData.teacher,
    venue: formData.venue,
    room: formData.room,
    startTime: formatDateTimeWithTimezone(formData.startTime),
    endTime: formatDateTimeWithTimezone(formData.endTime),
    bookingStartTime: formatDateTimeWithTimezone(formData.bookingStartTime),
    bookingEndTime: formatDateTimeWithTimezone(formData.bookingEndTime),
    minCapacity: formData.minCapacity,
    maxCapacity: formData.maxCapacity,
    paymentMethods: buildPaymentMethodsPayload()
  }

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== '')
  )
}

function normalizeClassFromApi(apiData, fallbackData) {
  const source = apiData || {}
  return {
    ...fallbackData,
    id: source.id ?? fallbackData.id,
    name: source.name || source.title || fallbackData.name || '',
    style: source.style || source.courseCategory || source.category?.name || source.category || fallbackData.style || '',
    type: source.type || source.courseType || fallbackData.type || '',
    periodLessons: source.periodLessons || source.period_lessons || source.totalClasses || fallbackData.periodLessons || '',
    photo: source.photo || source.image_url || source.imageUrl || fallbackData.photo || '',
    note: source.note || source.description || fallbackData.note || '',
    show: isPublishedCourse(normalizeCourseStatus(source.status ?? fallbackData.status, source.show ?? source.is_visible ?? source.isActive ?? fallbackData.show)),
    teacher: getTeacherName(source.teacher) || fallbackData.teacher,
    venue: getVenueName(source.venue) || fallbackData.venue,
    room: getRoomName(source.room) || fallbackData.room,
    startTime: source.startTime ?? source.starttime ?? source.start_time ?? fallbackData.startTime,
    endTime: source.endTime ?? source.endtime ?? source.end_time ?? fallbackData.endTime,
    bookingStartTime: source.bookingStartTime ?? source.bookingstarttime ?? source.booking_start_time ?? fallbackData.bookingStartTime,
    bookingEndTime: source.bookingEndTime ?? source.bookingendtime ?? source.booking_end_time ?? fallbackData.bookingEndTime,
    minCapacity: source.minCapacity ?? fallbackData.minCapacity,
    maxCapacity: source.maxCapacity ?? fallbackData.maxCapacity,
    paymentMethods: source.paymentMethods ?? fallbackData.paymentMethods,
    paymentMethodName: getPaymentMethodName(source.paymentMethods ?? fallbackData.paymentMethods) || fallbackData.paymentMethodName,
    consumeValue: getPaymentMethodConsumeValue(source.paymentMethods ?? fallbackData.paymentMethods) || fallbackData.consumeValue,
    status: normalizeCourseStatus(source.status ?? fallbackData.status, source.show ?? source.is_visible ?? source.isActive ?? fallbackData.show)
  }
}

async function saveClass() {
  if (isSaving.value) return
  if (!formData.style || !formData.type || !formData.name || !formData.note) {
    alert('請輸入課程資料')
    return
  }
  if (formData.type === '期課' && !formData.periodLessons) {
    alert('請輸入期課堂數')
    return
  }
  if (formData.type !== '期課') {
    formData.periodLessons = ''
  }
  if (formData.paymentMethodName && !getPaymentMethodType(selectedPaymentMethod.value)) {
    alert('支付方式資料缺少 POINTS/TICKET 類型，請確認商品設定')
    return
  }
  if (isSelectedPointPaymentMethod.value && !formData.consumeValue) {
    alert('請輸入點數')
    return
  }

  const localClass = {
    ...formData,
    status: normalizeCourseStatus(formData.status),
    show: isPublishedCourse(formData.status)
  }
  const payload = buildCoursePayload()

  try {
    isSaving.value = true

    let result
    if (actionType.value === 'add') {
      result = await danceStudioSDK.createCourse(payload)
      const savedClass = normalizeClassFromApi(result?.data, {
        ...localClass,
        id: result?.data?.id ?? Date.now()
      })
      classes.value.push(savedClass)
    } else {
      result = await danceStudioSDK.updateCourse({
        ...payload,
        courseId: formData.id
      })
      const idx = classes.value.findIndex(m => m.id === formData.id)
      if (idx !== -1) {
        classes.value[idx] = normalizeClassFromApi(result?.data, localClass)
      }
    }

    closePopup()
  } catch (error) {
    console.error('儲存課程失敗:', error)
    alert(error?.message === 'SESSION_EXPIRED' ? '登入已過期，請重新登入' : '儲存課程失敗，請確認 API 回傳內容')
  } finally {
    isSaving.value = false
  }
}

function requestDelete(id) {
  const confirmed = window.confirm('確定要刪除嗎？')
  if (confirmed) {
    deleteClass(id)
  }
}

function deleteClass(id) {
  classes.value = classes.value.filter(m => m.id !== id)
  cancelDelete();
}

// 下載會員 JSON 檔
function downloadClassesJson() {
  const exportData = classes.value.map(t => ({
    ...t,
    status: normalizeCourseStatus(t.status, t.show),
    statusLabel: getCourseStatusLabel(t.status)
  }))
  saveToJson(exportData, 'classes.json')
}

// 上傳並載入會員 JSON 檔
async function uploadClassesJson(event) {
  try {
    const loadedData = await loadFromJson(event)
    if (Array.isArray(loadedData)) {
      classes.value = loadedData.map(t => ({
        ...t,
        status: normalizeCourseStatus(t.status, t.show),
        show: isPublishedCourse(normalizeCourseStatus(t.status, t.show))
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
  loadCourseOptions()
  loadClasses()
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
.filter{
  margin-left:10px;
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
