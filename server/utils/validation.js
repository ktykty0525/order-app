// 유효성 검사 헬퍼 함수

export const validateOrderItems = (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return { valid: false, error: '주문 항목이 필요합니다.' }
  }
  
  for (const item of items) {
    if (!item.menuId || !item.menuName || !item.quantity || !item.price) {
      return { valid: false, error: '주문 항목 정보가 불완전합니다.' }
    }
    
    if (item.quantity <= 0 || item.price <= 0) {
      return { valid: false, error: '수량과 가격은 0보다 커야 합니다.' }
    }
  }
  
  return { valid: true }
}

export const validateTotalAmount = (totalAmount) => {
  if (!totalAmount || typeof totalAmount !== 'number' || totalAmount <= 0) {
    return { valid: false, error: '유효하지 않은 주문 금액입니다.' }
  }
  return { valid: true }
}

export const validateMenuId = (menuId) => {
  if (isNaN(menuId)) {
    return { valid: false, error: '유효하지 않은 메뉴 ID입니다.' }
  }
  return { valid: true }
}

export const validateOrderId = (orderId) => {
  if (isNaN(orderId)) {
    return { valid: false, error: '유효하지 않은 주문 ID입니다.' }
  }
  return { valid: true }
}

export const validateStock = (stock) => {
  if (stock === undefined || typeof stock !== 'number' || stock < 0) {
    return { valid: false, error: '유효하지 않은 재고 수량입니다.' }
  }
  return { valid: true }
}

