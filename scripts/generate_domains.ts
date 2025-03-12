import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';

interface Account {
  username: string;
  password: string;
  subject_code: string;
}

// 生成随机URL
function generateRandomUrl(subject: string, index: number): string {
  const domains = [
    `https://www.${subject.toLowerCase()}-journal-${index}.com`,
    `https://www.${subject.toLowerCase()}-research-${index}.org`,
    `https://www.${subject.toLowerCase()}-academic-${index}.edu`,
    `https://www.${subject.toLowerCase()}-science-${index}.net`,
    `https://www.${subject.toLowerCase()}-study-${index}.io`
  ];
  return domains[Math.floor(Math.random() * domains.length)];
}

// 生成随机域名
function generateRandomDomain(subject: string, index: number): string {
  const prefixes = ['Research', 'Journal', 'Review', 'Studies', 'Analysis', 'Insights', 'Perspectives', 'Advances'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  return `${prefix} in ${subject} ${index}`;
}

async function generateDomainData() {
  const accountsPath = path.join(__dirname, 'data/accounts.csv');
  const outputPath = path.join(__dirname, 'data/domains.csv');
  
  const accounts: Account[] = [];
  
  // 读取账户数据
  const parser = parse({
    skip_empty_lines: true
  });

  await new Promise((resolve, reject) => {
    parser.on('readable', () => {
      let record;
      while ((record = parser.read()) !== null) {
        accounts.push({
          username: record[0],
          password: record[1],
          subject_code: record[2]
        });
      }
    });

    parser.on('error', reject);
    parser.on('end', resolve);

    fs.createReadStream(accountsPath).pipe(parser);
  });

  // 为每个学科生成至少10条记录
  const domainRecords: string[] = [];
  
  accounts.forEach(account => {
    const subject = account.subject_code;
    // 为每个学科生成12-15条记录
    const recordCount = 12 + Math.floor(Math.random() * 4);
    
    for (let i = 1; i <= recordCount; i++) {
      const url1 = generateRandomUrl(subject, i);
      const url2 = generateRandomUrl(subject, i + recordCount);
      const domain = url1.split('//')[1];
      
      // 将两个URL合并到一列，用逗号分隔
      domainRecords.push(`${subject},${domain},"${url1},${url2}"`);
    }
  });

  // 写入CSV文件
  fs.writeFileSync(outputPath, domainRecords.join('\n'));
  console.log(`已生成 ${domainRecords.length} 条域名记录`);
}

generateDomainData().catch(console.error); 