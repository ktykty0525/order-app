import { useState } from 'react'
import './MenuCard.css'

function MenuCard({ menu, onAddToCart, inventory = 0 }) {
  const [addShot, setAddShot] = useState(false)
  const [addSyrup, setAddSyrup] = useState(false)

  const handleAddToCart = () => {
    onAddToCart({
      menuId: menu.id,
      menuName: menu.name,
      basePrice: menu.price,
      options: {
        addShot,
        addSyrup
      }
    })
    
    // 옵션 초기화
    setAddShot(false)
    setAddSyrup(false)
  }

  const isOutOfStock = inventory <= 0

  return (
    <div className="menu-card">
      <div className="menu-image">
        {menu.imageUrl ? (
          <img src={menu.imageUrl} alt={menu.name} className="menu-img" />
        ) : (
          <div className="image-placeholder">이미지</div>
        )}
      </div>
      <div className="menu-info">
        <h3 className="menu-name">{menu.name}</h3>
        <p className="menu-price">{menu.price.toLocaleString()}원</p>
        <p className="menu-description">{menu.description}</p>
        <div className="menu-options">
          <label className="option-label">
            <input
              type="checkbox"
              checked={addShot}
              onChange={(e) => setAddShot(e.target.checked)}
            />
            <span>샷 추가 (+500원)</span>
          </label>
          <label className="option-label">
            <input
              type="checkbox"
              checked={addSyrup}
              onChange={(e) => setAddSyrup(e.target.checked)}
            />
            <span>시럽 추가 (+0원)</span>
          </label>
        </div>
        <button 
          className="add-to-cart-btn" 
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? '품절' : '담기'}
        </button>
      </div>
    </div>
  )
}

export default MenuCard

