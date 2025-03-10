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
    domain TEXT PRIMARY KEY,
    subject_code TEXT NOT NULL,
    url TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    relevance INTEGER CHECK (relevance BETWEEN 1 AND 10),
    popularity INTEGER CHECK (popularity BETWEEN 1 AND 10),
    professionalism INTEGER CHECK (professionalism BETWEEN 1 AND 10),
    remark TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (domain) REFERENCES domains(domain),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

export default db;

// 用户相关
export const getUser = db.prepare('SELECT * FROM users WHERE username = ?');
export const createUser = db.prepare('INSERT INTO users (username, password, subject_code) VALUES (?, ?, ?)');
export const updateUserSubject = db.prepare('UPDATE users SET subject_code = ? WHERE id = ?');

// 域名相关
export const getAllDomains = db.prepare('SELECT * FROM domains ORDER BY domain');
export const getDomainsBySubject = db.prepare(`
  SELECT * FROM domains
  WHERE subject_code = ?
  ORDER BY domain
`);
export const getDomainByName = db.prepare('SELECT * FROM domains WHERE domain = ?');
export const createDomain = db.prepare('INSERT INTO domains (domain, subject_code, url) VALUES (?, ?, ?)');
export const updateDomain = db.prepare('UPDATE domains SET url = ? WHERE domain = ?');
export const deleteDomain = db.prepare('DELETE FROM domains WHERE domain = ?');

// 评分相关
export const getRatingByDomain = db.prepare(`
  SELECT 
    id,
    domain,
    user_id,
    relevance,
    popularity,
    professionalism,
    remark,
    created_at,
    updated_at
  FROM ratings
  WHERE domain = ? AND user_id = ?
`);
export const createRating = db.prepare(`
  INSERT INTO ratings (domain, user_id, relevance, popularity, professionalism, remark)
  VALUES (?, ?, ?, ?, ?, ?)
`);
export const updateRating = db.prepare(`
  UPDATE ratings 
  SET relevance = ?, popularity = ?, professionalism = ?, remark = ?, updated_at = CURRENT_TIMESTAMP
  WHERE domain = ? AND user_id = ?
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
  LEFT JOIN ratings r ON d.domain = r.domain AND r.user_id = ?
  WHERE d.subject_code = ?
  ORDER BY d.domain
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
  LEFT JOIN ratings r ON d.domain = r.domain
  WHERE d.domain = ?
  GROUP BY d.domain
`);