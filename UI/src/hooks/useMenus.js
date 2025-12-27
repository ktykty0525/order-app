import { useState, useEffect } from 'react'
import { menuAPI } from '../api/api'

export const useMenus = () => {
  const [menus, setMenus] = useState([])
  const [inventory, setInventory] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadMenus = async () => {
    try {
      setLoading(true)
      setError(null)
      const menuData = await menuAPI.getMenus()
      setMenus(menuData)
      
      // 재고 정보 설정
      const stockData = {}
      menuData.forEach(menu => {
        stockData[menu.id] = menu.stock
      })
      setInventory(stockData)
    } catch (err) {
      setError(err.message)
      console.error('메뉴 로드 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMenus()
  }, [])

  return { menus, inventory, loading, error, refreshMenus: loadMenus }
}

