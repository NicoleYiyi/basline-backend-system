<template>
  <div class="allclass-page">
    <div class="page-header">
      <h2>課程總覽</h2>
      <label class="filter">
        課程類型：
        <select v-model="typeFilter">
          <option value="all">
            全部
          </option>
          <option value="團體課">
            團體課
          </option>
          <option value="期課">
            期課
          </option>
          <option value="大師課">
            大師課
          </option>
          <option value="私課">
            私課
          </option>
        </select>
      </label>
      <label class="filter">
        顯示方式：
        <select v-model="calendarView">
          <option value="month">
            月
          </option>
          <option value="week">
            週
          </option>
          <option value="day">
            日
          </option>
        </select>
      </label>
      <label class="filter">
        場館：
        <select v-model="venueFilter">
          <option value="all">
            全部
          </option>
          <option
            v-for="venue in venueOptions"
            :key="venue"
            :value="venue"
          >
            {{ venue }}
          </option>
        </select>
      </label>
    </div>

    <section class="calendar-section">
      <div class="calendar-toolbar">
        <button
          type="button"
          class="calendar-nav"
          @click="goPrevious"
        >
          ‹
        </button>
        <h3>{{ calendarTitle }}</h3>
        <button
          type="button"
          class="calendar-nav"
          @click="goNext"
        >
          ›
        </button>
      </div>

      <table
        v-if="calendarView === 'month'"
        class="calendar-table month-table"
      >
        <thead>
          <tr>
            <th
              v-for="day in weekDays"
              :key="day"
            >
              <h4>{{ day }}</h4>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(week, weekIndex) in calendarWeeks"
            :key="weekIndex"
          >
            <td
              v-for="day in week"
              :key="day.key"
              :class="{ muted: !day.isCurrentMonth, today: day.isToday }"
            >
              <div class="date-number">
                {{ day.date.getDate() }}
              </div>
              <ul class="course-list">
                <li
                  v-for="course in day.courses"
                  :key="course.id"
                  class="course-item"
                >
                  <span class="course-time">{{ course.time || '全天' }}</span>
                  <span class="course-name">{{ course.name }}</span>
                  <span
                    v-if="course.venue"
                    class="course-venue"
                  >{{ course.venue }}</span>
                  <span class="course-type">{{ course.type || '未分類' }}</span>
                </li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>

      <table
        v-else-if="calendarView === 'week'"
        class="calendar-table week-table"
      >
        <thead>
          <tr>
            <th class="time-header">
              <h4>時間</h4>
            </th>
            <th
              v-for="day in weekDates"
              :key="day.key"
            >
              <h4>{{ day.weekday }}</h4>
              <span class="header-date">{{ day.label }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="hour in weekHours"
            :key="hour.value"
          >
            <th class="time-cell">
              <h4>{{ hour.label }}</h4>
            </th>
            <td
              v-for="day in hour.days"
              :key="`${hour.value}-${day.key}`"
              :class="{ today: day.isToday }"
            >
              <ul class="course-list">
                <li
                  v-for="course in day.courses"
                  :key="course.id"
                  class="course-item"
                >
                  <span class="course-time">{{ course.time || '未指定時間' }}</span>
                  <span class="course-name">{{ course.name }}</span>
                  <span
                    v-if="course.venue"
                    class="course-venue"
                  >{{ course.venue }}</span>
                  <span class="course-type">{{ course.type || '未分類' }}</span>
                </li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>

      <table
        v-else
        class="calendar-table day-table"
      >
        <tbody>
          <tr
            v-for="hour in dayHours"
            :key="hour.value"
          >
            <th>
              <h4>{{ hour.label }}</h4>
            </th>
            <td>
              <ul class="course-list">
                <li
                  v-for="course in hour.courses"
                  :key="course.id"
                  class="course-item"
                >
                  <span class="course-time">{{ course.time || '未指定時間' }}</span>
                  <span class="course-name">{{ course.name }}</span>
                  <span
                    v-if="course.venue"
                    class="course-venue"
                  >{{ course.venue }}</span>
                  <span class="course-type">{{ course.type || '未分類' }}</span>
                </li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>

      <p
        v-if="!filteredCourses.length"
        class="empty-text"
      >
        目前沒有符合條件的課程。
      </p>
    </section>
  </div>
</template>

<script>
export default {
  name: 'BaslineAllclass',
};
</script>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { fetchClasses } from '@/api/baslineApi'

const classes = ref([])
const typeFilter = ref('all')
const venueFilter = ref('all')
const calendarView = ref('month')
const currentDate = ref(new Date())
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const venueOptions = computed(() => {
  const venues = classes.value
    .map(course => course.venue)
    .filter(venue => venue)

  return [...new Set(venues)].sort((a, b) => a.localeCompare(b, 'zh-TW'))
})

const filteredCourses = computed(() => {
  return classes.value.filter(course => {
    const matchedType = typeFilter.value === 'all' || course.type === typeFilter.value
    const matchedVenue = venueFilter.value === 'all' || course.venue === venueFilter.value
    return matchedType && matchedVenue
  })
})

const coursesByDate = computed(() => {
  return filteredCourses.value.reduce((dateMap, course) => {
    if (!course.date) return dateMap
    if (!dateMap.has(course.date)) dateMap.set(course.date, [])
    dateMap.get(course.date).push(course)
    return dateMap
  }, new Map())
})

const calendarTitle = computed(() => {
  if (calendarView.value === 'month') {
    return new Intl.DateTimeFormat('zh-TW', {
      year: 'numeric',
      month: 'long'
    }).format(currentDate.value)
  }

  if (calendarView.value === 'week') {
    const startDate = startOfWeek(currentDate.value)
    const endDate = addDays(startDate, 6)
    return `${formatDateLabel(startDate)} - ${formatDateLabel(endDate)}`
  }

  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }).format(currentDate.value)
})

const calendarWeeks = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7
  const todayKey = formatDateKey(new Date())
  const cells = []

  for (let index = 0; index < totalCells; index += 1) {
    const date = new Date(year, month, index - firstDay + 1)
    const key = formatDateKey(date)
    cells.push({
      key,
      date,
      isCurrentMonth: date.getMonth() === month,
      isToday: key === todayKey,
      courses: coursesByDate.value.get(key) || []
    })
  }

  const weeks = []
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7))
  }
  return weeks
})

const weekDates = computed(() => {
  const startDate = startOfWeek(currentDate.value)
  const todayKey = formatDateKey(new Date())

  return weekDays.map((weekday, index) => {
    const date = addDays(startDate, index)
    const key = formatDateKey(date)
    return {
      key,
      date,
      weekday,
      label: formatShortDateLabel(date),
      isToday: key === todayKey,
      courses: coursesByDate.value.get(key) || []
    }
  })
})

const weekHours = computed(() => {
  return Array.from({ length: 24 }, (_, hour) => ({
    value: hour,
    label: `${String(hour).padStart(2, '0')}:00`,
    days: weekDates.value.map(day => ({
      ...day,
      courses: day.courses.filter(course => course.hour === hour)
    }))
  }))
})

const dayHours = computed(() => {
  const key = formatDateKey(currentDate.value)
  const dayCourses = coursesByDate.value.get(key) || []

  return Array.from({ length: 24 }, (_, hour) => ({
    value: hour,
    label: `${String(hour).padStart(2, '0')}:00`,
    courses: dayCourses.filter(course => course.hour === hour)
  }))
})

function goPrevious() {
  if (calendarView.value === 'month') {
    currentDate.value = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth() - 1,
      1
    )
    return
  }

  currentDate.value = addDays(currentDate.value, calendarView.value === 'week' ? -7 : -1)
}

function goNext() {
  if (calendarView.value === 'month') {
    currentDate.value = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth() + 1,
      1
    )
    return
  }

  currentDate.value = addDays(currentDate.value, calendarView.value === 'week' ? 7 : 1)
}

async function loadClasses() {
  try {
    const result = await fetchClasses()
    const data = Array.isArray(result.data) ? result.data : []
    classes.value = data.map(normalizeCourse).filter(course => course.date)
  } catch (error) {
    console.error('載入課程失敗:', error)
    classes.value = []
  }
}

function normalizeCourse(course) {
  const dateValue =
    course.date ||
    course.class_date ||
    course.course_date ||
    course.scheduled_date ||
    course.lesson_date ||
    course.start_date ||
    course.started_at ||
    course.start_time
  const time = formatCourseTime(course.start_time || course.time || course.started_at)

  return {
    id: course.id || `${dateValue}-${course.name || course.course_name || course.title}`,
    name: course.name || course.course_name || course.class_name || course.title || '未命名課程',
    type: course.type || course.course_type || course.class_type || '',
    date: formatCourseDate(dateValue),
    time,
    hour: getCourseHour(time),
    teacher: course.teacher_name || course.teacher || '',
    venue: course.venue_name || course.venue || course.classroom || ''
  }
}

function formatCourseDate(value) {
  if (!value) return ''
  if (typeof value === 'string') {
    const matchedDate = value.match(/\d{4}-\d{2}-\d{2}/)
    if (matchedDate) return matchedDate[0]
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return formatDateKey(date)
}

function formatCourseTime(value) {
  if (!value) return ''
  if (typeof value === 'string') {
    const matchedTime = value.match(/\d{2}:\d{2}/)
    if (matchedTime) return matchedTime[0]
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

function getCourseHour(time) {
  if (!time) return -1
  const hour = Number(time.slice(0, 2))
  return Number.isInteger(hour) ? hour : -1
}

function startOfWeek(date) {
  return addDays(date, -date.getDay())
}

function addDays(date, days) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

function formatDateKey(date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDateLabel(date) {
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

function formatShortDateLabel(date) {
  return new Intl.DateTimeFormat('zh-TW', {
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

onMounted(() => {
  loadClasses()
})
</script>

<style scoped>
.page-header{
    display:flex;
    align-items:center;
    gap:10px;
    flex-wrap:wrap;
    margin-bottom:16px;
}
h2{
    margin:0;
}
.calendar-section{
    width:100%;
}
.calendar-toolbar{
    display:flex;
    align-items:center;
    justify-content:center;
    gap:14px;
    margin-bottom:12px;
}
.calendar-toolbar h3{
    min-width:220px;
    margin:0;
    text-align:center;
    font-size:20px;
    font-weight:500;
}
.calendar-nav{
    width:34px;
    height:34px;
    border:1px solid #d8d8d8;
    border-radius:5px;
    background:#fff;
    cursor:pointer;
    font-size:22px;
    line-height:1;
}
.calendar-table{
    table-layout:fixed;
    border:1px solid #e4e4e4;
}
.calendar-table th,
.calendar-table td{
    text-align:left;
    padding:8px;
    border-right:1px solid #e4e4e4;
    border-bottom:1px solid #e4e4e4;
    vertical-align:top;
}
.calendar-table th:last-child,
.calendar-table td:last-child{
    border-right:none;
}
.calendar-table tbody tr:last-child td,
.calendar-table tbody tr:last-child th{
    border-bottom:none;
}
.month-table th,
.month-table td{
    width:14.285%;
}
.month-table td,
.week-table td{
    height:112px;
    background:#fff;
}
.week-table .time-header,
.week-table .time-cell{
    width:90px;
}
.week-table td{
    height:58px;
}
.day-table th{
    width:90px;
}
.day-table td{
    min-height:58px;
    background:#fff;
}
.calendar-table td.muted{
    background:#f8f8f8;
    color:#999;
}
.calendar-table td.today{
    box-shadow:inset 0 0 0 2px #292929;
}
th{
    background-color:#252525;
}
h4{
    margin:0;
    color:#fff;
}
.header-date{
  display:block;
  margin-top:2px;
  color:#fff;
  font-size:12px;
  font-weight:400;
}
.filter{
  margin-left:10px;
}
.filter select{
  margin-left:4px;
}
.date-number{
  margin-bottom:6px;
  font-weight:500;
}
.course-list{
  display:flex;
  flex-direction:column;
  gap:4px;
  margin:0;
  padding:0;
  list-style:none;
}
.course-item{
  display:flex;
  flex-direction:column;
  gap:2px;
  padding:5px;
  border-left:3px solid #292929;
  border-radius:4px;
  background:#f1f1f1;
  color:#222;
  font-size:12px;
  line-height:1.35;
}
.course-time{
  font-weight:600;
}
.course-name,
.course-venue,
.course-type{
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.course-venue{
  color:#444;
}
.course-type{
  color:#666;
}
.empty-text{
  margin:12px 0 0;
  color:#777;
}
</style>
