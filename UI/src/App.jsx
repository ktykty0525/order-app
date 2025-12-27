import { useState, useCallback } from 'react'
import Header from './components/Header'
import MenuCard from './components/MenuCard'
import ShoppingCart from './components/ShoppingCart'
import AdminDashboard from './components/AdminDashboard'
import InventoryStatus from './components/InventoryStatus'
import OrderStatus from './components/OrderStatus'
import Toast from './components/Toast'
import { useMenus } from './hooks/useMenus'
import { useOrders } from './hooks/useOrders'
import { menuAPI, orderAPI } from './api/api'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('order')
  const [cartItems, setCartItems] = useState([])
  const [toast, setToast] = useState(null)
  
  const { menus, inventory, loading, refreshMenus } = useMenus()
  const { orders, stats, loadOrders } = useOrders(currentPage === 'admin')

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type })
  }, [])

  // 장바구니 아이템 찾기 헬퍼
  const findCartItem = useCallback((item) => {
    return cartItems.find(
      cartItem =>
        cartItem.menuId === item.menuId &&
        cartItem.options.addShot === item.options.addShot &&
        cartItem.options.addSyrup === item.options.addSyrup
    )
  }, [cartItems])

  const handleAddToCart = useCallback((item) => {
    // 재고 확인
    const currentStock = inventory[item.menuId] || 0
    const existingItem = findCartItem(item)
    const currentQuantity = existingItem ? existingItem.quantity : 0
    
    if (currentStock <= currentQuantity) {
      showToast('재고가 부족합니다.', 'error')
      return
    }

    // 같은 메뉴와 옵션 조합이 있는지 확인
    const existingItemIndex = cartItems.findIndex(
      cartItem =>
        cartItem.menuId === item.menuId &&
        cartItem.options.addShot === item.options.addShot &&
        cartItem.options.addSyrup === item.options.addSyrup
    )

    if (existingItemIndex !== -1) {
      // 이미 있으면 수량 증가
      setCartItems(prev => {
        const updated = [...prev]
        updated[existingItemIndex].quantity += 1
        return updated
      })
      showToast('장바구니에 추가되었습니다.', 'success')
    } else {
      // 없으면 새로 추가
      const cartItemId = `${item.menuId}-${item.options.addShot}-${item.options.addSyrup}-${Date.now()}`
      setCartItems(prev => [...prev, { ...item, id: cartItemId, quantity: 1 }])
      showToast('장바구니에 추가되었습니다.', 'success')
    }
  }, [cartItems, inventory, findCartItem, showToast])

  const handleUpdateQuantity = useCallback((itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId)
      return
    }

    const item = cartItems.find(cartItem => cartItem.id === itemId)
    if (!item) return

    // 재고 확인
    const currentStock = inventory[item.menuId] || 0
    if (newQuantity > currentStock) {
      showToast('재고가 부족합니다.', 'error')
      return
    }

    setCartItems(prev => prev.map(cartItem =>
      cartItem.id === itemId ? { ...cartItem, quantity: newQuantity } : cartItem
    ))
  }, [cartItems, inventory, showToast])

  const handleRemoveItem = useCallback((itemId) => {
    setCartItems(prev => prev.filter(cartItem => cartItem.id !== itemId))
  }, [])

  // 총 금액 계산 헬퍼
  const calculateItemPrice = useCallback((item) => {
    return item.basePrice + (item.options.addShot ? 500 : 0)
  }, [])

  const handleOrder = useCallback(async () => {
    if (cartItems.length === 0) {
      showToast('장바구니가 비어있습니다.', 'warning')
      return
    }

    // 총 금액 계산
    const totalAmount = cartItems.reduce((total, item) => {
      return total + (calculateItemPrice(item) * item.quantity)
    }, 0)

    // 주문 데이터 준비
    const orderData = {
      items: cartItems.map(item => ({
        menuId: item.menuId,
        menuName: item.menuName,
        options: item.options,
        quantity: item.quantity,
        price: calculateItemPrice(item)
      })),
      totalAmount
    }

    try {
      // 서버에 주문 생성 요청
      await orderAPI.createOrder(orderData)
      
      // 메뉴 목록 다시 로드 (재고 업데이트)
      await refreshMenus()
      
      showToast('주문이 완료되었습니다!', 'success')
      setCartItems([])
    } catch (error) {
      showToast(error.message || '주문 생성 중 오류가 발생했습니다.', 'error')
      console.error('주문 생성 오류:', error)
    }
  }, [cartItems, calculateItemPrice, refreshMenus, showToast])

  const handleUpdateOrderStatus = useCallback(async (orderId, newStatus) => {
    try {
      await orderAPI.updateOrderStatus(orderId, newStatus)
      await loadOrders()
      showToast('주문 상태가 변경되었습니다.', 'success')
    } catch (error) {
      showToast(error.message || '주문 상태 변경 중 오류가 발생했습니다.', 'error')
      console.error('주문 상태 변경 오류:', error)
    }
  }, [loadOrders, showToast])

  const handleUpdateInventory = useCallback(async (menuId, newStock) => {
    try {
      await menuAPI.updateStock(menuId, newStock)
      await refreshMenus()
    } catch (error) {
      showToast(error.message || '재고 수정 중 오류가 발생했습니다.', 'error')
      console.error('재고 수정 오류:', error)
    }
  }, [refreshMenus, showToast])

  return (
    <div className="App">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <Header currentPage={currentPage} onPageChange={setCurrentPage} />
      
      {currentPage === 'order' && (
        <div className="order-page">
          <div className="menu-section">
            <h2 className="section-title">메뉴</h2>
            {loading ? (
              <p>메뉴를 불러오는 중...</p>
            ) : (
              <div className="menu-grid">
                {menus.map(menu => (
                  <MenuCard
                    key={menu.id}
                    menu={menu}
                    inventory={inventory[menu.id] || 0}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="cart-section">
            <ShoppingCart 
              cartItems={cartItems} 
              onOrder={handleOrder}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
            />
          </div>
        </div>
      )}

      {currentPage === 'admin' && (
        <div className="admin-page">
          <AdminDashboard stats={stats} />
          <InventoryStatus 
            menus={menus}
            inventory={inventory}
            onUpdateInventory={handleUpdateInventory}
          />
          <OrderStatus 
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        </div>
      )}
    </div>
  )
}

export default App
