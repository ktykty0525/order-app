// 환경 변수에서 API URL 가져오기, 없으면 기본값 사용
// Vite는 VITE_ 접두사가 있는 환경 변수만 클라이언트에 노출됨
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// API 호출 헬퍼 함수
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })
    
    let data
    try {
      data = await response.json()
    } catch (parseError) {
      // JSON 파싱 실패 시 (예: 빈 응답)
      if (!response.ok) {
        throw new Error(`서버 오류 (${response.status})`)
      }
      throw new Error('응답을 파싱할 수 없습니다.')
    }
    
    if (!response.ok) {
      // 상세 정보가 있는 경우 포함
      const errorMessage = data.details 
        ? `${data.error} - ${JSON.stringify(data.details)}`
        : data.error || `API 호출 중 오류가 발생했습니다. (${response.status})`
      throw new Error(errorMessage)
    }
    
    return data
  } catch (error) {
    // 네트워크 오류 처리
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('네트워크 오류:', error)
      throw new Error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.')
    }
    console.error('API 호출 오류:', error)
    throw error
  }
}

// 메뉴 관련 API
export const menuAPI = {
  // 메뉴 목록 조회
  getMenus: async () => {
    const response = await apiCall('/menus')
    return response.data
  },
  
  // 특정 메뉴 조회
  getMenu: async (menuId) => {
    const response = await apiCall(`/menus/${menuId}`)
    return response.data
  },
  
  // 재고 수정
  updateStock: async (menuId, stock) => {
    const response = await apiCall(`/menus/${menuId}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stock })
    })
    return response.data
  }
}

// 주문 관련 API
export const orderAPI = {
  // 주문 생성
  createOrder: async (orderData) => {
    const response = await apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    })
    return response.data
  },
  
  // 주문 목록 조회
  getOrders: async (status = null) => {
    const query = status ? `?status=${status}` : ''
    const response = await apiCall(`/orders${query}`)
    return response.data
  },
  
  // 특정 주문 조회
  getOrder: async (orderId) => {
    const response = await apiCall(`/orders/${orderId}`)
    return response.data
  },
  
  // 주문 상태 변경
  updateOrderStatus: async (orderId, status) => {
    const response = await apiCall(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
    return response.data
  }
}

