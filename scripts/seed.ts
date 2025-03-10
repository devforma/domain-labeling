import db, {
  createUser,
  createDomain,
  createRating,
  getUser
} from '../lib/db';

// 清空现有数据
db.exec(`
  DELETE FROM ratings;
  DELETE FROM domains;
  DELETE FROM users;
`);

interface User {
  id: number;
  username: string;
  password: string;
  subject_code: string | null;
}

// 创建测试用户
const users = [
  { username: 'teacher1', password: 'password123', subject_code: 'MATH' },
  { username: 'teacher2', password: 'password123', subject_code: 'PHYSICS' }
];

users.forEach(user => {
  createUser.run(user.username, user.password, user.subject_code);
});

// 创建测试域名
const domains = [
  { domain: 'mathworld.wolfram.com', subject_code: 'MATH', url: 'https://mathworld.wolfram.com' },
  { domain: 'khanacademy.org', subject_code: 'MATH', url: 'https://www.khanacademy.org/math' },
  { domain: 'hyperphysics.phy-astr.gsu.edu', subject_code: 'PHYSICS', url: 'http://hyperphysics.phy-astr.gsu.edu' },
  { domain: 'physics.org', subject_code: 'PHYSICS', url: 'https://www.physics.org' },
  { domain: 'chemguide.co.uk', subject_code: 'CHEMISTRY', url: 'https://www.chemguide.co.uk' },
  { domain: 'biology-online.org', subject_code: 'BIOLOGY', url: 'https://www.biology-online.org' }
];

domains.forEach(domain => {
  createDomain.run(domain.domain, domain.subject_code, domain.url);
});

// 创建测试评分
const teacher1 = getUser.get('teacher1') as User;
const teacher2 = getUser.get('teacher2') as User;

const ratings = [
  { domain: 'mathworld.wolfram.com', username: 'teacher1', relevance: 9, popularity: 8, professionalism: 9, remark: '内容来源权威' },
  { domain: 'khanacademy.org', username: 'teacher1', relevance: 8, popularity: 9, professionalism: 8, remark: '适合初学者' },
  { domain: 'hyperphysics.phy-astr.gsu.edu', username: 'teacher2', relevance: 9, popularity: 7, professionalism: 9, remark: '内容专业全面' },
  { domain: 'physics.org', username: 'teacher2', relevance: 7, popularity: 8, professionalism: 8, remark: '科普性强' }
];

ratings.forEach(rating => {
  const user = rating.username === 'teacher1' ? teacher1 : teacher2;
  createRating.run(
    rating.domain,
    user.id,
    rating.relevance,
    rating.popularity,
    rating.professionalism,
    rating.remark
  );
});

console.log('测试数据已生成！');

// 显示一些统计信息
const stats = db.prepare(`
  SELECT 
    (SELECT COUNT(*) FROM users) as user_count,
    (SELECT COUNT(*) FROM domains) as domain_count,
    (SELECT COUNT(*) FROM ratings) as rating_count
`).get();

console.log('数据统计：', stats); 