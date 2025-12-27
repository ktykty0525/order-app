import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { testConnection } from './config/database.js'
import pool from './config/database.js'

// 환경 변수 로드
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const NODE_ENV = process.env.NODE_ENV || 'development'

// 미들웨어 설정
app.use(cors()) // 프런트엔드와의 통신을 위해 CORS 활성화
app.use(express.json()) // JSON 요청 본문 파싱
app.use(express.urlencoded({ extended: true })) // URL 인코딩된 요청 본문 파싱

// 개발 환경에서만 상세한 에러 정보 표시
if (NODE_ENV === 'development') {
  app.use((err, req, res, next) => {
    console.error('에러 발생:', err)
    res.status(err.status || 500).json({
      success: false,
      error: err.message,
      stack: err.stack
    })
  })
}

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '커피 주문 앱 API 서버가 정상적으로 실행 중입니다.',
    version: '1.0.0'
  })
})

// 헬스체크 및 데이터베이스 연결 확인
app.get('/api/health', async (req, res) => {
  try {
    const client = await pool.connect()
    const dbResult = await client.query('SELECT NOW() as current_time, version() as pg_version')
    client.release()
    
    res.json({
      success: true,
      status: 'healthy',
      database: {
        connected: true,
        currentTime: dbResult.rows[0].current_time,
        version: dbResult.rows[0].pg_version.split(' ')[0] + ' ' + dbResult.rows[0].pg_version.split(' ')[1]
      },
      server: {
        uptime: process.uptime(),
        environment: NODE_ENV
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      database: {
        connected: false,
        error: error.message
      }
    })
  }
})

// API 라우트
app.get('/api/menus', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        name,
        description,
        price,
        image_url as "imageUrl",
        stock,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM menus
      ORDER BY id
    `)
    
    res.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('메뉴 조회 오류:', error)
    res.status(500).json({
      success: false,
      error: '메뉴 조회 중 오류가 발생했습니다.',
      message: error.message
    })
  }
})

app.get('/api/orders', (req, res) => {
  // TODO: 주문 목록 조회 구현
  res.json({
    success: true,
    data: []
  })
})

// 서버 시작
app.listen(PORT, async () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`)
  console.log(`환경: ${NODE_ENV}`)
  console.log(`http://localhost:${PORT}`)
  
  // 데이터베이스 연결 테스트
  await testConnection()
})

