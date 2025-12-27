import './ShoppingCart.css'

function ShoppingCart({ cartItems, onOrder, onUpdateQuantity, onRemoveItem }) {
  const calculateItemPrice = (item) => {
    let price = item.basePrice
    if (item.options.addShot) price += 500
    return price * item.quantity
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + calculateItemPrice(item), 0)
  }

  const formatOptions = (options) => {
    const optionList = []
    if (options.addShot) optionList.push('샷 추가')
    if (options.addSyrup) optionList.push('시럽 추가')
    return optionList.length > 0 ? ` (${optionList.join(', ')})` : ''
  }

  const handleIncrease = (itemId) => {
    const item = cartItems.find(cartItem => cartItem.id === itemId)
    if (item) {
      onUpdateQuantity(itemId, item.quantity + 1)
    }
  }

  const handleDecrease = (itemId) => {
    const item = cartItems.find(cartItem => cartItem.id === itemId)
    if (item) {
      if (item.quantity > 1) {
        onUpdateQuantity(itemId, item.quantity - 1)
      } else {
        onRemoveItem(itemId)
      }
    }
  }

  return (
    <div className="shopping-cart">
      <h2 className="cart-title">장바구니</h2>
      <div className="cart-container">
        <div className="cart-items-section">
          {cartItems.length === 0 ? (
            <p className="empty-cart">장바구니가 비어있습니다.</p>
          ) : (
            cartItems.map((item) => {
              const unitPrice = item.basePrice + (item.options.addShot ? 500 : 0)
              return (
                <div key={item.id || item.menuId} className="cart-item">
                  <div className="item-info">
                    <span className="item-name">
                      {item.menuName}{formatOptions(item.options)}
                    </span>
                    <div className="item-price-row">
                      <span className="item-unit-price">{unitPrice.toLocaleString()}원</span>
                      <span className="item-quantity">X {item.quantity}</span>
                      <span className="item-total-price">{calculateItemPrice(item).toLocaleString()}원</span>
                    </div>
                  </div>
                  <div className="quantity-controls">
                    <button 
                      className="quantity-btn" 
                      onClick={() => handleDecrease(item.id || item.menuId)}
                      aria-label="수량 감소"
                    >
                      -
                    </button>
                    <span className="quantity-display">{item.quantity}</span>
                    <button 
                      className="quantity-btn" 
                      onClick={() => handleIncrease(item.id || item.menuId)}
                      aria-label="수량 증가"
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
        {cartItems.length > 0 && (
          <div className="cart-summary-section">
            <div className="cart-total">
              <span className="total-label">총 금액</span>
              <span className="total-amount">{calculateTotal().toLocaleString()}원</span>
            </div>
            <button className="order-btn" onClick={onOrder}>
              주문하기
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShoppingCart

