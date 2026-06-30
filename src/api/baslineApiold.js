const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || '/api'

const LOGIN_ENDPOINTS = {
  admin: `${API_BASE_URL}/auth/admin/login`,
  user: `${API_BASE_URL}/auth/login`
}

async function parseJsonResponse(response) {
  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = result?.message
      || result?.error
      || `API request failed: ${response.status}`
    throw new Error(message)
  }

  return result
}

function findAuthToken(result) {
  return result?.token
    || result?.accessToken
    || result?.access_token
    || result?.data?.token
    || result?.data?.accessToken
    || result?.data?.access_token
}

function getAuthHeaders() {
  const token = localStorage.getItem('token')

  if (!token) {
    return {}
  }

  return {
    Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`
  }
}

export async function login(name, password, role = 'admin') {
  const endpoint = LOGIN_ENDPOINTS[role]

  if (!endpoint) {
    throw new Error('不支援的登入身份')
  }

  const credentials = role === 'user'
    ? { phone: name, password }
    : { name, password }

  const result = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  }).then(parseJsonResponse)

  const token = findAuthToken(result)

  if (!token) {
    throw new Error('登入成功但未取得授權 token')
  }

  return {
    token,
    role,
    user: result?.user || result?.data?.user || result?.data || null,
    raw: result
  }
}

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

export async function fetchGroupclasses() {
  const response = await fetch(`${API_BASE_URL}/getGroupclasses`, {
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

export async function fetchVenues() {
  const response = await fetch(`${API_BASE_URL}/venues`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
  return response.json()
}

export async function fetchClassrooms() {
  const response = await fetch(`${API_BASE_URL}/rooms`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
  return response.json()
}

export async function fetchProducts() {
  const response = await fetch(
    `${API_BASE_URL}/products?active=true&detail=true`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }
  )
  return response.json()
}

export async function fetchOrders() {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    }
  })
  return response.json()
}

// 方案與商品共用同一個 API，但方案只回傳 products[].packages 的內容。
export async function fetchPlans() {
  const result = await fetchProducts()
  console.log('products API 原始回應：', result)
  const data = result?.data ?? result
  const products = Array.isArray(data) ? data : [data]

  return products.flatMap(product => {
    if (!Array.isArray(product?.packages)) {
      return []
    }

    return product.packages.map(packageItem => ({
      id: packageItem.id,
      productId: packageItem.productId
        ?? packageItem.product_id
        ?? product.id,
      name: product.name ?? '',
      description: product.description ?? '',
      productType: product.productType ?? '',
      quantity: packageItem.quantity ?? '',
      expiryDays: packageItem.expiryDays ?? '',
      price: packageItem.price ?? '',
      isActive: packageItem.isActive ?? false,
    }))
  })
}

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
