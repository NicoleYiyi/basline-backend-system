const API_BASE_URL = 'https://basline-api-server-337933684397.asia-east1.run.app'

export async function fetchTeachers() {
  const response = await fetch(`${API_BASE_URL}/getTeachers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
  return response.json()
}

export async function fetchClasses() {
  const response = await fetch(`${API_BASE_URL}/getScheduledClasses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
  return response.json()
}

export async function fetchCourseTemplates() {
  const response = await fetch(`${API_BASE_URL}/getCourseTemplates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
  return response.json()
}

// function getAuthHeaders() {
//   const token = localStorage.getItem('token')
//   return token ? { Authorization: `Bearer ${token}` } : {}
// }

// async function request(path) {
//   const response = await fetch(`${API_BASE_URL}${path}`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       ...getAuthHeaders()
//     }
//   })
//   if (response.status === 401) {
//     // TODO: 清 token + 跳轉登入
//   }
//   return response.json()
// }

