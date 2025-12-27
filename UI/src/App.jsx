import { useState, useMemo } from 'react'
import Header from './components/Header'
import MenuCard from './components/MenuCard'
import ShoppingCart from './components/ShoppingCart'
import AdminDashboard from './components/AdminDashboard'
import InventoryStatus from './components/InventoryStatus'
import OrderStatus from './components/OrderStatus'
import Toast from './components/Toast'
import './App.css'

// 임시 메뉴 데이터
const initialMenus = [
  {
    id: 1,
    name: '아메리카노(ICE)',
    price: 4000,
    description: '시원한 아이스 아메리카노',
    imageUrl: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=300&fit=crop&q=80'
  },
  {
    id: 2,
    name: '아메리카노(HOT)',
    price: 4000,
    description: '따뜻한 핫 아메리카노',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&q=80'
  },
  {
    id: 3,
    name: '카페라떼',
    price: 5000,
    description: '부드러운 우유와 에스프레소의 조화',
    imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop&q=80'
  },
  {
    id: 4,
    name: '카푸치노',
    price: 5000,
    description: '우유 거품이 올라간 카푸치노',
    imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop&q=80'
  },
  {
    id: 5,
    name: '바닐라라떼',
    price: 5500,
    description: '바닐라 시럽이 들어간 달콤한 라떼',
    imageUrl: 'https://images.unsplash.com/photo-1570968914863-9a7b11898539?w=400&h=300&fit=crop&q=80'
  },
  {
    id: 6,
    name: '카라멜마키아토',
    price: 6000,
    description: '카라멜 시럽과 우유의 달콤한 조합',
    imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop&q=80'
  }
]

function App() {
  const [currentPage, setCurrentPage] = useState('order')
  const [cartItems, setCartItems] = useState([])
  const [orders, setOrders] = useState([])
  const [toast, setToast] = useState(null)
  const [inventory, setInventory] = useState(() => {
    // 초기 재고 설정 (각 메뉴당 10개)
    const initialInventory = {}
    initialMenus.forEach(menu => {
      initialInventory[menu.id] = 10
    })
    return initialInventory
  })

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
  }

  const handleAddToCart = (item) => {
    // 재고 확인
    const currentStock = inventory[item.menuId] || 0
    const existingItem = cartItems.find(
      cartItem =>
        cartItem.menuId === item.menuId &&
        cartItem.options.addShot === item.options.addShot &&
        cartItem.options.addSyrup === item.options.addSyrup
    )
    
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
      const updatedCart = [...cartItems]
      updatedCart[existingItemIndex].quantity += 1
      setCartItems(updatedCart)
      showToast('장바구니에 추가되었습니다.', 'success')
    } else {
      // 없으면 새로 추가
      const cartItemId = `${item.menuId}-${item.options.addShot}-${item.options.addSyrup}-${Date.now()}`
      setCartItems([...cartItems, { ...item, id: cartItemId, quantity: 1 }])
      showToast('장바구니에 추가되었습니다.', 'success')
    }
  }

  const handleUpdateQuantity = (itemId, newQuantity) => {
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

    const updatedCart = cartItems.map(cartItem =>
      cartItem.id === itemId ? { ...cartItem, quantity: newQuantity } : cartItem
    )
    setCartItems(updatedCart)
  }

  const handleRemoveItem = (itemId) => {
    const updatedCart = cartItems.filter(cartItem => cartItem.id !== itemId)
    setCartItems(updatedCart)
  }

  const handleOrder = () => {
    if (cartItems.length === 0) {
      showToast('장바구니가 비어있습니다.', 'warning')
      return
    }

    // 재고 확인
    const stockIssues = []
    cartItems.forEach(item => {
      const currentStock = inventory[item.menuId] || 0
      if (currentStock < item.quantity) {
        stockIssues.push(item.menuName)
      }
    })

    if (stockIssues.length > 0) {
      showToast(`${stockIssues.join(', ')}의 재고가 부족합니다.`, 'error')
      return
    }

    // 총 금액 계산
    const totalAmount = cartItems.reduce((total, item) => {
      let price = item.basePrice
      if (item.options.addShot) price += 500
      return total + (price * item.quantity)
    }, 0)

    // 재고 차감
    const updatedInventory = { ...inventory }
    cartItems.forEach(item => {
      updatedInventory[item.menuId] = (updatedInventory[item.menuId] || 0) - item.quantity
    })
    setInventory(updatedInventory)

    // 주문 생성
    const newOrder = {
      id: Date.now(),
      orderDate: new Date().toISOString(),
      items: cartItems.map(item => ({
        menuId: item.menuId,
        menuName: item.menuName,
        options: item.options,
        quantity: item.quantity,
        price: item.basePrice + (item.options.addShot ? 500 : 0)
      })),
      totalAmount,
      status: 'received' // 초기 상태: 주문 접수
    }

    setOrders([newOrder, ...orders])
    showToast('주문이 완료되었습니다!', 'success')
    setCartItems([])
  }

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ))
  }

  const handleUpdateInventory = (menuId, newStock) => {
    setInventory({
      ...inventory,
      [menuId]: newStock
    })
  }

  // 주문 통계 계산
  const orderStats = useMemo(() => {
    return {
      total: orders.length,
      received: orders.filter(o => o.status === 'received').length,
      inProgress: orders.filter(o => o.status === 'in_progress').length,
      completed: orders.filter(o => o.status === 'completed').length
    }
  }, [orders])

  // 주문 정렬 (최신순)
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
  }, [orders])

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
            <div className="menu-grid">
              {initialMenus.map(menu => (
                <MenuCard
                  key={menu.id}
                  menu={menu}
                  inventory={inventory[menu.id] || 0}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
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
          <AdminDashboard stats={orderStats} />
          <InventoryStatus 
            menus={initialMenus}
            inventory={inventory}
            onUpdateInventory={handleUpdateInventory}
          />
          <OrderStatus 
            orders={sortedOrders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        </div>
      )}
    </div>
  )
}

export default App
