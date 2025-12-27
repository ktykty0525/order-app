import express from 'express'
import pool from '../config/database.js'
import { orderSelectFields, orderItemFields, sendError, sendSuccess } from '../utils/queryHelpers.js'
import { VALID_ORDER_STATUSES } from '../utils/constants.js'
import { validateOrderItems, validateTotalAmount, validateOrderId } from '../utils/validation.js'

const router = express.Router()

// 주문 조회 공통 쿼리 빌더
const buildOrderQuery = (whereClause = '') => {
  return `
    SELECT 
      ${orderSelectFields},
      ${orderItemFields}
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    ${whereClause}
    GROUP BY o.id
    ORDER BY o.order_date DESC
  `
}

// POST /api/orders - 주문 생성
router.post('/', async (req, res) => {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    
    const { items, totalAmount } = req.body
    
    // 유효성 검사
    const itemsValidation = validateOrderItems(items)
    if (!itemsValidation.valid) {
      await client.query('ROLLBACK')
      return sendError(res, 400, itemsValidation.error)
    }
    
    const amountValidation = validateTotalAmount(totalAmount)
    if (!amountValidation.valid) {
      await client.query('ROLLBACK')
      return sendError(res, 400, amountValidation.error)
    }
    
    // 재고 확인 및 차감
    for (const item of items) {
      const menuResult = await client.query(
        'SELECT stock FROM menus WHERE id = $1',
        [item.menuId]
      )
      
      if (menuResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return sendError(res, 404, `메뉴 ID ${item.menuId}를 찾을 수 없습니다.`)
      }
      
      const currentStock = menuResult.rows[0].stock
      if (currentStock < item.quantity) {
        await client.query('ROLLBACK')
        return res.status(400).json({
          success: false,
          error: '재고가 부족합니다.',
          details: {
            menuId: item.menuId,
            menuName: item.menuName,
            availableStock: currentStock,
            requestedQuantity: item.quantity
          }
        })
        // sendError는 단순 메시지만 지원하므로 상세 정보가 필요한 경우 직접 응답
      }
      
      // 재고 차감
      await client.query(
        'UPDATE menus SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.menuId]
      )
    }
    
    // 주문 생성
    const orderResult = await client.query(`
      INSERT INTO orders (total_amount, status)
      VALUES ($1, 'received')
      RETURNING id, order_date as "orderDate", total_amount as "totalAmount", status
    `, [totalAmount])
    
    const order = orderResult.rows[0]
    
    // 주문 아이템 생성
    for (const item of items) {
      await client.query(`
        INSERT INTO order_items (order_id, menu_id, menu_name, quantity, unit_price, options)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        order.id,
        item.menuId,
        item.menuName,
        item.quantity,
        item.price,
        JSON.stringify(item.options || {})
      ])
    }
    
    await client.query('COMMIT')
    
    sendSuccess(res, order, 201)
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('주문 생성 오류:', error)
    sendError(res, 500, '주문 생성 중 오류가 발생했습니다.', error.message)
  } finally {
    client.release()
  }
})

// GET /api/orders - 주문 목록 조회
router.get('/', async (req, res) => {
  try {
    const { status, limit = 50 } = req.query
    
    const params = []
    let whereClause = ''
    
    if (status) {
      if (!VALID_ORDER_STATUSES.includes(status)) {
        return sendError(res, 400, '유효하지 않은 주문 상태입니다.')
      }
      whereClause = 'WHERE o.status = $1'
      params.push(status)
    }
    
    const limitValue = Math.min(Math.max(parseInt(limit) || 50, 1), 100) // 1-100 사이로 제한
    const query = buildOrderQuery(whereClause) + ` LIMIT $${params.length + 1}`
    params.push(limitValue)
    
    const result = await pool.query(query, params)
    
    sendSuccess(res, result.rows)
  } catch (error) {
    console.error('주문 목록 조회 오류:', error)
    sendError(res, 500, '주문 목록 조회 중 오류가 발생했습니다.', error.message)
  }
})

// GET /api/orders/:orderId - 특정 주문 조회
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params
    
    // 숫자 유효성 검사
    const idValidation = validateOrderId(orderId)
    if (!idValidation.valid) {
      return sendError(res, 400, idValidation.error)
    }
    
    const query = buildOrderQuery('WHERE o.id = $1')
    const result = await pool.query(query, [orderId])
    
    if (result.rows.length === 0) {
      return sendError(res, 404, '주문을 찾을 수 없습니다.')
    }
    
    sendSuccess(res, result.rows[0])
  } catch (error) {
    console.error('주문 조회 오류:', error)
    sendError(res, 500, '주문 조회 중 오류가 발생했습니다.', error.message)
  }
})

// PATCH /api/orders/:orderId/status - 주문 상태 변경
router.patch('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params
    const { status } = req.body
    
    // 숫자 유효성 검사
    if (isNaN(orderId)) {
      return sendError(res, 400, '유효하지 않은 주문 ID입니다.')
    }
    
    // 상태 유효성 검사
    if (!status || !VALID_ORDER_STATUSES.includes(status)) {
      return sendError(res, 400, '유효하지 않은 주문 상태입니다.')
    }
    
    const result = await pool.query(`
      UPDATE orders
      SET status = $1
      WHERE id = $2
      RETURNING id, status
    `, [status, orderId])
    
    if (result.rows.length === 0) {
      return sendError(res, 404, '주문을 찾을 수 없습니다.')
    }
    
    sendSuccess(res, result.rows[0])
  } catch (error) {
    console.error('주문 상태 변경 오류:', error)
    sendError(res, 500, '주문 상태 변경 중 오류가 발생했습니다.', error.message)
  }
})

export default router

