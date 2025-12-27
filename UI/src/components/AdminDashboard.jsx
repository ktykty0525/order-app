import './AdminDashboard.css'

function AdminDashboard({ stats }) {
  return (
    <div className="admin-dashboard">
      <h2 className="dashboard-title">관리자 대시보드</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">총 주문</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">주문 접수</div>
          <div className="stat-value">{stats.received}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">제조 중</div>
          <div className="stat-value">{stats.inProgress}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">제조 완료</div>
          <div className="stat-value">{stats.completed}</div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

