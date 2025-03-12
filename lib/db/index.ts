import Database from 'better-sqlite3';
import path from 'path';

// 创建数据库连接
const db = new Database(path.join(process.cwd(), 'data.db'));

// 创建表
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    subject_code TEXT NULL
  );

  CREATE TABLE IF NOT EXISTS domains (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain TEXT NOT NULL,
    subject_code TEXT NOT NULL,
    url TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    relevance INTEGER CHECK (relevance BETWEEN 0 AND 10),
    popularity INTEGER CHECK (popularity BETWEEN 0 AND 10),
    professionalism INTEGER CHECK (professionalism BETWEEN 0 AND 10),
    remark TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (domain_id) REFERENCES domains(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

export default db;

// 用户相关
export const getUser = db.prepare('SELECT * FROM users WHERE username = ?');
export const createUser = db.prepare('INSERT INTO users (username, password, subject_code) VALUES (?, ?, ?)');
export const updateUserSubject = db.prepare('UPDATE users SET subject_code = ? WHERE id = ?');

// 域名相关
export const getAllDomains = db.prepare('SELECT * FROM domains ORDER BY id');
export const getDomainsBySubject = db.prepare(`
  SELECT * FROM domains
  WHERE subject_code = ?
  ORDER BY id
`);
export const getDomainByName = db.prepare('SELECT * FROM domains WHERE domain = ?');
export const createDomain = db.prepare('INSERT INTO domains (domain, subject_code, url) VALUES (?, ?, ?)');
export const updateDomain = db.prepare('UPDATE domains SET url = ? WHERE domain = ?');
export const deleteDomain = db.prepare('DELETE FROM domains WHERE domain = ?');

// 评分相关
export const getRatingByDomain = db.prepare(`
  SELECT 
    ratings.id,
    ratings.domain_id,
    domains.domain,
    ratings.user_id,
    ratings.relevance,
    ratings.popularity,
    ratings.professionalism,
    ratings.remark,
    ratings.created_at,
    ratings.updated_at
  FROM ratings INNER JOIN domains ON ratings.domain_id = domains.id
  WHERE ratings.domain_id = ? AND ratings.user_id = ?
`);
export const createRating = db.prepare(`
  INSERT INTO ratings (domain_id, user_id, relevance, popularity, professionalism, remark)
  VALUES (?, ?, ?, ?, ?, ?)
`);
export const updateRating = db.prepare(`
  UPDATE ratings 
  SET relevance = ?, popularity = ?, professionalism = ?, remark = ?, updated_at = CURRENT_TIMESTAMP
  WHERE domain_id = ? AND user_id = ?
`);

// 获取带评分的域名列表
export const getDomainsWithRatings = db.prepare(`
  SELECT 
    d.domain,
    d.subject_code,
    d.url,
    r.relevance,
    r.popularity,
    r.professionalism,
    r.created_at as rating_created_at,
    r.updated_at as rating_updated_at
  FROM domains d
  LEFT JOIN ratings r ON d.id = r.domain_id AND r.user_id = ?
  WHERE d.subject_code = ?
  ORDER BY d.id
`);

// 获取带评分的域名列表（分页）
export const getDomainsWithRatingsPaginated = db.prepare(`
  SELECT 
    d.domain,
    d.subject_code,
    d.url,
    r.relevance,
    r.popularity,
    r.professionalism,
    r.remark,
    r.created_at,
    r.updated_at,
    (
      SELECT COUNT(*) 
      FROM domains d2 
      WHERE d2.subject_code = ?
    ) as total_count
  FROM domains d
  LEFT JOIN ratings r ON d.id = r.domain_id AND r.user_id = ?
  WHERE d.subject_code = ?
  ORDER BY d.id
  LIMIT ? OFFSET ?
`);

// 统计相关
export const getDomainStats = db.prepare(`
  SELECT 
    d.domain,
    COUNT(r.id) as total_ratings,
    AVG(r.relevance) as avg_relevance,
    AVG(r.popularity) as avg_popularity,
    AVG(r.professionalism) as avg_professionalism
  FROM domains d
  LEFT JOIN ratings r ON d.id = r.domain_id
  WHERE d.domain = ?
  GROUP BY d.domain
`);