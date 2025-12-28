import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Client } = pkg

// Render.com 환경인지 확인 (데이터베이스가 이미 생성되어 있는 경우)
const IS_RENDER = process.env.RENDER || process.env.DB_HOST?.includes('render.com') || false
const DB_NAME = process.env.DB_NAME || 'order_app'
const DB_USER = process.env.DB_USER || 'postgres'
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_PORT = process.env.DB_PORT || 5432

// Render.com의 External Database URL을 사용하는 경우 SSL 필요
// 일반적으로 render.com 호스트는 SSL이 필요함
const NEEDS_SSL = IS_RENDER || DB_HOST.includes('render.com') || DB_HOST.includes('onrender.com')

// 애플리케이션 데이터베이스에 연결
const appClient = new Client({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  // Render.com의 경우 SSL 연결 필요
  ssl: NEEDS_SSL ? { rejectUnauthorized: false } : false
})

async function initDatabase() {
  try {
    console.log('🔄 데이터베이스 초기화를 시작합니다...')
    console.log(`📍 환경: ${IS_RENDER ? 'Render.com' : '로컬'}`)
    
    // Render.com이 아닌 경우에만 데이터베이스 생성 시도
    if (!IS_RENDER) {
      // postgres 데이터베이스에 연결 (데이터베이스 생성용)
      const adminClient = new Client({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
        database: 'postgres', // 기본 데이터베이스
        ssl: NEEDS_SSL ? { rejectUnauthorized: false } : false
      })

      try {
        await adminClient.connect()
        console.log('✅ postgres 데이터베이스에 연결되었습니다.')

        // 데이터베이스 존재 여부 확인 및 생성
        const dbCheckResult = await adminClient.query(
          `SELECT 1 FROM pg_database WHERE datname = $1`,
          [DB_NAME]
        )

        if (dbCheckResult.rows.length === 0) {
          console.log(`📦 데이터베이스 '${DB_NAME}' 생성 중...`)
          await adminClient.query(`CREATE DATABASE ${DB_NAME}`)
          console.log(`✅ 데이터베이스 '${DB_NAME}' 생성 완료!`)
        } else {
          console.log(`ℹ️  데이터베이스 '${DB_NAME}'가 이미 존재합니다.`)
        }

        await adminClient.end()
      } catch (error) {
        console.log(`ℹ️  데이터베이스 생성 단계를 건너뜁니다: ${error.message}`)
      }
    } else {
      console.log('ℹ️  Render.com 환경: 데이터베이스는 이미 생성되어 있습니다.')
    }

    // 애플리케이션 데이터베이스에 연결
    await appClient.connect()
    console.log(`✅ 데이터베이스 '${DB_NAME}'에 연결되었습니다.`)

    // 4. 테이블 생성
    console.log('📋 테이블 생성 중...')

    // Menus 테이블
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS menus (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price INTEGER NOT NULL,
        image_url VARCHAR(500),
        stock INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ menus 테이블 생성 완료')

    // Options 테이블
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS options (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price INTEGER DEFAULT 0,
        menu_id INTEGER REFERENCES menus(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ options 테이블 생성 완료')

    // Orders 테이블
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total_amount INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'received',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ orders 테이블 생성 완료')

    // OrderItems 테이블
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        menu_id INTEGER NOT NULL REFERENCES menus(id) ON DELETE RESTRICT,
        menu_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price INTEGER NOT NULL,
        options JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ order_items 테이블 생성 완료')

    // 5. updated_at 자동 업데이트 트리거 함수 생성
    await appClient.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `)

    // 트리거 생성
    await appClient.query(`
      DROP TRIGGER IF EXISTS update_menus_updated_at ON menus;
      CREATE TRIGGER update_menus_updated_at
        BEFORE UPDATE ON menus
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `)

    await appClient.query(`
      DROP TRIGGER IF EXISTS update_options_updated_at ON options;
      CREATE TRIGGER update_options_updated_at
        BEFORE UPDATE ON options
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `)

    await appClient.query(`
      DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
      CREATE TRIGGER update_orders_updated_at
        BEFORE UPDATE ON orders
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `)
    console.log('✅ 트리거 생성 완료')

    // 6. 초기 데이터 삽입 (테이블이 비어있을 때만)
    const menuCount = await appClient.query('SELECT COUNT(*) FROM menus')
    if (parseInt(menuCount.rows[0].count) === 0) {
      console.log('📝 초기 메뉴 데이터 삽입 중...')
      
      await appClient.query(`
        INSERT INTO menus (name, description, price, image_url, stock) VALUES
        ('아메리카노(ICE)', '시원한 아이스 아메리카노', 4000, 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=300&fit=crop&q=80', 10),
        ('아메리카노(HOT)', '따뜻한 핫 아메리카노', 4000, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&q=80', 10),
        ('카페라떼', '부드러운 우유와 에스프레소의 조화', 5000, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop&q=80', 10),
        ('카푸치노', '우유 거품이 올라간 카푸치노', 5000, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop&q=80', 10),
        ('바닐라라떼', '바닐라 시럽이 들어간 달콤한 라떼', 5500, 'https://images.unsplash.com/photo-1570968914863-9a7b11898539?w=400&h=300&fit=crop&q=80', 10),
        ('카라멜마키아토', '카라멜 시럽과 우유의 달콤한 조합', 6000, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop&q=80', 10)
      `)
      console.log('✅ 초기 메뉴 데이터 삽입 완료')
    } else {
      console.log('ℹ️  메뉴 데이터가 이미 존재합니다.')
    }

    const optionCount = await appClient.query('SELECT COUNT(*) FROM options')
    if (parseInt(optionCount.rows[0].count) === 0) {
      console.log('📝 초기 옵션 데이터 삽입 중...')
      
      await appClient.query(`
        INSERT INTO options (name, price, menu_id) VALUES
        ('샷 추가', 500, NULL),
        ('시럽 추가', 0, NULL)
      `)
      console.log('✅ 초기 옵션 데이터 삽입 완료')
    } else {
      console.log('ℹ️  옵션 데이터가 이미 존재합니다.')
    }

    await appClient.end()
    console.log('🎉 데이터베이스 초기화가 완료되었습니다!')
    
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 중 오류 발생:', error.message)
    console.error(error)
    process.exit(1)
  }
}

// 스크립트 실행
initDatabase()

