import { useState, useEffect, useMemo } from 'react'
import { orderAPI } from '../api/api'

export const useOrders = (autoLoad = false) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadOrders = async (status = null) => {
    try {
      setLoading(true)
      setError(null)
      const orderData = await orderAPI.getOrders(status)
      setOrders(orderData)
    } catch (err) {
      setError(err.message)
      console.error('주문 목록 로드 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (autoLoad) {
      loadOrders()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad])

  // 주문 통계 계산
  const stats = useMemo(() => {
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

  return { 
    orders: sortedOrders, 
    stats, 
    loading, 
    error, 
    loadOrders,
    refreshOrders: () => loadOrders()
  }
}

