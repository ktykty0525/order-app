// SQL 쿼리 헬퍼 함수

export const menuSelectFields = `
  id,
  name,
  description,
  price,
  image_url as "imageUrl",
  stock,
  created_at as "createdAt",
  updated_at as "updatedAt"
`

export const orderSelectFields = `
  o.id,
  o.order_date as "orderDate",
  o.total_amount as "totalAmount",
  o.status,
  o.created_at as "createdAt",
  o.updated_at as "updatedAt"
`

export const orderItemFields = `
  json_agg(
    json_build_object(
      'menuId', oi.menu_id,
      'menuName', oi.menu_name,
      'quantity', oi.quantity,
      'price', oi.unit_price,
      'options', oi.options
    )
  ) as items
`

// 에러 응답 헬퍼
export const sendError = (res, statusCode, error, message = null) => {
  res.status(statusCode).json({
    success: false,
    error,
    ...(message && { message })
  })
}

// 성공 응답 헬퍼
export const sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data
  })
}

