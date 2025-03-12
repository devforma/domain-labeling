import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';
import db, { createUser, createDomain } from '../lib/db';


// 定义接口
interface DomainRow {
  subject_code: string;
  domain: string;
  url: string;
}

interface AccountRow {
  username: string;
  password: string;
  subject_code: string;
}

// 导入账户数据
async function importAccounts(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const parser = parse({
      skip_empty_lines: true
    });

    const accounts: string[] = [];

    parser.on('readable', () => {
      let record;
      while ((record = parser.read()) !== null) {
        accounts.push(record);
      }
    });

    parser.on('error', (err) => {
      reject(err);
    });

    parser.on('end', () => {
      accounts.forEach(account => {
        createUser.run(account[0], account[1], account[2]);
      });
      console.log(`已导入 ${accounts.length} 个账户`);
      resolve();
    });

    fs.createReadStream(filePath).pipe(parser);
  });
}

// 导入域名数据
async function importDomains(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const parser = parse({
      skip_empty_lines: true
    });

    const domains: string[] = [];

    parser.on('readable', () => {
      let record;
      while ((record = parser.read()) !== null) {
        domains.push(record);
      }
    });

    parser.on('error', (err) => {
      reject(err);
    });

    parser.on('end', () => {
      domains.forEach(domain => {
        createDomain.run(domain[1], domain[0], domain[2]);
      });
      console.log(`已导入 ${domains.length} 个域名`);
      resolve();
    });

    fs.createReadStream(filePath).pipe(parser);
  });
}

// 主函数
async function main() {
  try {
    const accountsPath = path.join(__dirname, 'data/accounts.csv');
    const domainsPath = path.join(__dirname, 'data/hpj_54subject.csv');


    // 清空现有数据
    // db.exec(`
    //   DELETE FROM ratings;
    //   DELETE FROM domains;
    // `);
    // db.exec(`
    //   DELETE FROM ratings;
    //   DELETE FROM domains;
    //   DELETE FROM users;
    // `);

    console.log('开始导入数据...');
    
    // await importAccounts(accountsPath);
    await importDomains(domainsPath);

    // 显示导入后的统计信息
    const stats = db.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM users) as user_count,
        (SELECT COUNT(*) FROM domains) as domain_count,
        (SELECT COUNT(*) FROM ratings) as rating_count
    `).get();

    console.log('数据统计：', stats);
    console.log('数据导入完成！');
  } catch (error) {
    console.error('导入过程中发生错误：', error);
    process.exit(1);
  }
}

main(); 