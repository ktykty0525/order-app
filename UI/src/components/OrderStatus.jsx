import './OrderStatus.css'

function OrderStatus({ orders, onUpdateOrderStatus }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${month}월 ${day}일 ${hours}:${minutes}`
  }

  const formatOrderItems = (items) => {
    return items.map(item => {
      const options = []
      if (item.options.addShot) options.push('샷 추가')
      if (item.options.addSyrup) options.push('시럽 추가')
      const optionText = options.length > 0 ? ` (${options.join(', ')})` : ''
      return `${item.menuName}${optionText} x ${item.quantity}`
    }).join(', ')
  }

  const getStatusButton = (order) => {
    switch (order.status) {
      case 'pending':
        return (
          <button 
            className="status-btn received"
            onClick={() => onUpdateOrderStatus(order.id, 'received')}
          >
            주문 접수
          </button>
        )
      case 'received':
        return (
          <button 
            className="status-btn in-progress"
            onClick={() => onUpdateOrderStatus(order.id, 'in_progress')}
          >
            제조 시작
          </button>
        )
      case 'in_progress':
        return (
          <button 
            className="status-btn completed"
            onClick={() => onUpdateOrderStatus(order.id, 'completed')}
          >
            제조 완료
          </button>
        )
      case 'completed':
        return <span className="status-text">완료</span>
      default:
        return null
    }
  }

  const filteredOrders = orders.filter(order => order.status !== 'completed' || orders.length <= 10)

  return (
    <div className="order-status">
      <h2 className="order-title">주문 현황</h2>
      <div className="order-list">
        {filteredOrders.length === 0 ? (
          <p className="empty-orders">주문이 없습니다.</p>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="order-item">
              <div className="order-info">
                <div className="order-date">{formatDate(order.orderDate)}</div>
                <div className="order-items">{formatOrderItems(order.items)}</div>
                <div className="order-amount">{order.totalAmount.toLocaleString()}원</div>
              </div>
              <div className="order-action">
                {getStatusButton(order)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default OrderStatus

