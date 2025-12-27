import express from 'express'
import pool from '../config/database.js'
import { menuSelectFields, sendError, sendSuccess } from '../utils/queryHelpers.js'
import { validateMenuId, validateStock } from '../utils/validation.js'

const router = express.Router()

// GET /api/menus - 메뉴 목록 조회
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ${menuSelectFields}
      FROM menus
      ORDER BY id
    `)
    
    sendSuccess(res, result.rows)
  } catch (error) {
    console.error('메뉴 조회 오류:', error)
    sendError(res, 500, '메뉴 조회 중 오류가 발생했습니다.', error.message)
  }
})

// GET /api/menus/:menuId - 특정 메뉴 조회
router.get('/:menuId', async (req, res) => {
  try {
    const { menuId } = req.params
    
    // 숫자 유효성 검사
    const idValidation = validateMenuId(menuId)
    if (!idValidation.valid) {
      return sendError(res, 400, idValidation.error)
    }
    
    const result = await pool.query(`
      SELECT ${menuSelectFields}
      FROM menus
      WHERE id = $1
    `, [menuId])
    
    if (result.rows.length === 0) {
      return sendError(res, 404, '메뉴를 찾을 수 없습니다.')
    }
    
    sendSuccess(res, result.rows[0])
  } catch (error) {
    console.error('메뉴 조회 오류:', error)
    sendError(res, 500, '메뉴 조회 중 오류가 발생했습니다.', error.message)
  }
})

// PATCH /api/menus/:menuId/stock - 재고 수정
router.patch('/:menuId/stock', async (req, res) => {
  try {
    const { menuId } = req.params
    const { stock } = req.body
    
    // 숫자 유효성 검사
    const idValidation = validateMenuId(menuId)
    if (!idValidation.valid) {
      return sendError(res, 400, idValidation.error)
    }
    
    // 재고 유효성 검사
    const stockValidation = validateStock(stock)
    if (!stockValidation.valid) {
      return sendError(res, 400, stockValidation.error)
    }
    
    const result = await pool.query(`
      UPDATE menus
      SET stock = $1
      WHERE id = $2
      RETURNING id, stock
    `, [stock, menuId])
    
    if (result.rows.length === 0) {
      return sendError(res, 404, '메뉴를 찾을 수 없습니다.')
    }
    
    sendSuccess(res, result.rows[0])
  } catch (error) {
    console.error('재고 수정 오류:', error)
    sendError(res, 500, '재고 수정 중 오류가 발생했습니다.', error.message)
  }
})

export default router

