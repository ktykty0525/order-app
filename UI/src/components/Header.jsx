import './Header.css'

function Header({ currentPage, onPageChange }) {
  return (
    <header className="header">
      <div className="header-logo">COZY</div>
      <div className="header-buttons">
        <button 
          className={`header-btn ${currentPage === 'order' ? 'active' : ''}`}
          onClick={() => onPageChange('order')}
        >
          주문하기
        </button>
        <button 
          className={`header-btn ${currentPage === 'admin' ? 'active' : ''}`}
          onClick={() => onPageChange('admin')}
        >
          관리자
        </button>
      </div>
    </header>
  )
}

export default Header

