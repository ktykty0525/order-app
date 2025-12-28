import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg

// Render.com 환경인지 확인
const IS_RENDER = process.env.RENDER || false
const DB_HOST = process.env.DB_HOST || 'localhost'
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

// Render.com의 PostgreSQL은 SSL 연결이 필요함
// render.com 또는 onrender.com 호스트를 사용하거나 프로덕션 환경일 때 SSL 활성화
const NEEDS_SSL = IS_RENDER || 
                  IS_PRODUCTION || 
                  DB_HOST.includes('render.com') || 
                  DB_HOST.includes('onrender.com')

// PostgreSQL 연결 풀 생성
const pool = new Pool({
  host: DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'order_app',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  // Render.com 또는 프로덕션 환경에서는 SSL 연결 필요
  ssl: NEEDS_SSL ? { rejectUnauthorized: false } : false,
  max: 20, // 최대 연결 수
  idleTimeoutMillis: 30000, // 유휴 연결 타임아웃
  connectionTimeoutMillis: 2000, // 연결 타임아웃
})

// 연결 테스트
pool.on('connect', () => {
  console.log('✅ PostgreSQL 데이터베이스에 연결되었습니다.')
})

pool.on('error', (err) => {
  console.error('❌ 데이터베이스 연결 오류:', err)
})

// 데이터베이스 연결 테스트 함수
export const testConnection = async () => {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT NOW()')
    console.log('📊 데이터베이스 연결 테스트 성공:', result.rows[0])
    client.release()
    return true
  } catch (error) {
    console.error('❌ 데이터베이스 연결 테스트 실패:', error.message)
    return false
  }
}

export default pool

