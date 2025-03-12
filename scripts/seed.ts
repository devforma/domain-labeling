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

// 基础域名数据
const baseDomains = [
  { domain: 'mathworld.wolfram.com', subject_code: 'MATH', url: 'https://mathworld.wolfram.com,https://www.wolframalpha.com/examples/mathematics' },
  { domain: 'khanacademy.org', subject_code: 'MATH', url: 'https://www.khanacademy.org/math,https://www.khanacademy.org/math/algebra' },
  { domain: 'hyperphysics.phy-astr.gsu.edu', subject_code: 'PHYSICS', url: 'http://hyperphysics.phy-astr.gsu.edu,http://hyperphysics.phy-astr.gsu.edu/hbase/hframe.html' },
  { domain: 'physics.org', subject_code: 'PHYSICS', url: 'https://www.physics.org,https://www.physics.org/explore.asp' },
  { domain: 'chemguide.co.uk', subject_code: 'CHEMISTRY', url: 'https://www.chemguide.co.uk' },
  { domain: 'biology-online.org', subject_code: 'BIOLOGY', url: 'https://www.biology-online.org' }
];

// 生成随机域名的函数
function generateRandomDomain(index: number, subject: string) {
  const prefixes = ['learn', 'study', 'online', 'edu', 'academic', 'school', 'course'];
  const suffixes = ['.com', '.org', '.edu', '.net'];
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return {
    domain: `${randomPrefix}-${subject.toLowerCase()}-${index}${randomSuffix}`,
    subject_code: subject,
    url: `https://${randomPrefix}-${subject.toLowerCase()}-${index}${randomSuffix}`
  };
}

// 生成更多测试域名
const subjects = ['MATH', 'PHYSICS'];
const additionalDomains: { domain: string; subject_code: string; url: string }[] = [];
subjects.forEach(subject => {
  for (let i = 1; i <= 100; i++) {
    additionalDomains.push(generateRandomDomain(i, subject));
  }
});

const allDomains = [...baseDomains, ...additionalDomains];

// 创建所有域名
allDomains.forEach(domain => {
  createDomain.run(domain.domain, domain.subject_code, domain.url);
});

// 创建测试评分
const teacher1 = getUser.get('teacher1') as User;
const teacher2 = getUser.get('teacher2') as User;

// 基础评分数据
const baseRatings = [
  { domain: 'mathworld.wolfram.com', username: 'teacher1', relevance: 9, popularity: 8, professionalism: 9, remark: '内容来源权威' },
  { domain: 'khanacademy.org', username: 'teacher1', relevance: 8, popularity: 9, professionalism: 8, remark: '适合初学者' },
  { domain: 'hyperphysics.phy-astr.gsu.edu', username: 'teacher2', relevance: 9, popularity: 7, professionalism: 9, remark: '内容专业全面' },
  { domain: 'physics.org', username: 'teacher2', relevance: 7, popularity: 8, professionalism: 8, remark: '科普性强' }
];

// 为部分随机域名生成评分
const randomRatings: { domain: string; username: string; relevance: number; popularity: number; professionalism: number; remark: string }[] = [];
allDomains.forEach(domain => {
  // 随机决定是否为该域名生成评分（30%的概率）
  if (Math.random() < 0.3) {
    const user = domain.subject_code === 'MATH' ? teacher1 : teacher2;
    randomRatings.push({
      domain: domain.domain,
      username: user.username,
      relevance: Math.floor(Math.random() * 4) + 6, // 6-9的随机数
      popularity: Math.floor(Math.random() * 4) + 6,
      professionalism: Math.floor(Math.random() * 4) + 6,
      remark: '自动生成的评分'
    });
  }
});

const allRatings = [...baseRatings, ...randomRatings];

// 创建所有评分
allRatings.forEach(rating => {
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