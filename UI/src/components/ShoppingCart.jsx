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

  const handleIncrease = (index) => {
    onUpdateQuantity(index, cartItems[index].quantity + 1)
  }

  const handleDecrease = (index) => {
    if (cartItems[index].quantity > 1) {
      onUpdateQuantity(index, cartItems[index].quantity - 1)
    } else {
      onRemoveItem(index)
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
            cartItems.map((item, index) => {
              const unitPrice = item.basePrice + (item.options.addShot ? 500 : 0)
              return (
                <div key={index} className="cart-item">
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
                      onClick={() => handleDecrease(index)}
                      aria-label="수량 감소"
                    >
                      -
                    </button>
                    <span className="quantity-display">{item.quantity}</span>
                    <button 
                      className="quantity-btn" 
                      onClick={() => handleIncrease(index)}
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

