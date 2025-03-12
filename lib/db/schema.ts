export interface User {
  id: number;
  username: string;
  password: string;
  subject_code: string | null;
}

export interface Subject {
  id: number;
  name: string;
}

export interface Domain {
  id: number;
  domain: string;
  subject_code: string;
  url: string;
}

export interface Rating {
  id: number;
  domain: string;
  user_id: number;
  relevance: number;    // 相关性 1-10
  popularity: number;   // 科普性 1-10
  professionalism: number;  // 专业性 1-10
  remark: string | null;    // 备注
  created_at: string;
  updated_at: string;
} 