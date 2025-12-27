import { useState, useEffect, useMemo } from 'react'
import Header from './components/Header'
import MenuCard from './components/MenuCard'
import ShoppingCart from './components/ShoppingCart'
import AdminDashboard from './components/AdminDashboard'
import InventoryStatus from './components/InventoryStatus'
import OrderStatus from './components/OrderStatus'
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
  const [inventory, setInventory] = useState(() => {
    // 초기 재고 설정 (각 메뉴당 10개)
    const initialInventory = {}
    initialMenus.forEach(menu => {
      initialInventory[menu.id] = 10
    })
    return initialInventory
  })

  const handleAddToCart = (item) => {
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
    } else {
      // 없으면 새로 추가
      setCartItems([...cartItems, { ...item, quantity: 1 }])
    }
  }

  const handleUpdateQuantity = (index, newQuantity) => {
    const updatedCart = [...cartItems]
    updatedCart[index].quantity = newQuantity
    setCartItems(updatedCart)
  }

  const handleRemoveItem = (index) => {
    const updatedCart = cartItems.filter((_, i) => i !== index)
    setCartItems(updatedCart)
  }

  const handleOrder = () => {
    if (cartItems.length === 0) {
      alert('장바구니가 비어있습니다.')
      return
    }

    // 총 금액 계산
    const totalAmount = cartItems.reduce((total, item) => {
      let price = item.basePrice
      if (item.options.addShot) price += 500
      return total + (price * item.quantity)
    }, 0)

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
    alert('주문이 완료되었습니다!')
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

  return (
    <div className="App">
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
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        </div>
      )}
    </div>
  )
}

export default App
