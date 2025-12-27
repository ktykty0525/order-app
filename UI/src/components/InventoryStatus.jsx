import './InventoryStatus.css'

function InventoryStatus({ menus, inventory, onUpdateInventory }) {
  const getStockStatus = (stock) => {
    if (stock === 0) return { text: '품절', color: '#ef4444' }
    if (stock < 5) return { text: '주의', color: '#f59e0b' }
    return { text: '정상', color: '#10b981' }
  }

  const handleIncrease = (menuId) => {
    const currentStock = inventory[menuId] || 0
    onUpdateInventory(menuId, currentStock + 1)
  }

  const handleDecrease = (menuId) => {
    const currentStock = inventory[menuId] || 0
    if (currentStock > 0) {
      onUpdateInventory(menuId, currentStock - 1)
    }
  }

  return (
    <div className="inventory-status">
      <h2 className="inventory-title">재고 현황</h2>
      <div className="inventory-grid">
        {menus.map(menu => {
          const stock = inventory[menu.id] || 0
          const status = getStockStatus(stock)
          return (
            <div key={menu.id} className="inventory-card">
              <div className="menu-name">{menu.name}</div>
              <div className="stock-info">
                <span className="stock-quantity">{stock}개</span>
                <span className="stock-status" style={{ color: status.color }}>
                  {status.text}
                </span>
              </div>
              <div className="stock-controls">
                <button 
                  className="stock-btn decrease"
                  onClick={() => handleDecrease(menu.id)}
                  disabled={stock === 0}
                >
                  -
                </button>
                <button 
                  className="stock-btn increase"
                  onClick={() => handleIncrease(menu.id)}
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default InventoryStatus

