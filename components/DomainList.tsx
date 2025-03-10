'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import RatingDialog from './RatingDialog';
import { Domain } from '@/lib/db/schema';
import { useAuth } from '@/lib/auth';

interface DomainListProps {
  initialDomains: Domain[];
}

interface DomainWithRating extends Domain {
  rating?: {
    relevance: number;
    popularity: number;
    professionalism: number;
  };
}

interface PaginationData {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function DomainList({ initialDomains }: DomainListProps) {
  const [selectedDomain, setSelectedDomain] = useState<DomainWithRating | null>(null);
  const [domains, setDomains] = useState<DomainWithRating[]>(initialDomains);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    total: initialDomains.length,
    page: 1,
    pageSize: 50,
    totalPages: Math.ceil(initialDomains.length / 50)
  });
  const { user } = useAuth();

  const refreshDomains = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/domains?userId=${user.id}&page=${currentPage}&pageSize=50`);
      if (response.ok) {
        const data = await response.json();
        const domainsWithRatings = data.domains.map((d: any) => ({
          domain: d.domain,
          subject_code: d.subject_code,
          url: d.url,
          rating: d.relevance ? {
            relevance: d.relevance,
            popularity: d.popularity,
            professionalism: d.professionalism
          } : undefined
        }));
        setDomains(domainsWithRatings);
        setPagination(data.pagination);
        setSelectedDomain(null);
      }
    } catch (error) {
      console.error('Error refreshing domains:', error);
    }
  };

  // 当页码改变时刷新数据
  useEffect(() => {
    refreshDomains();
  }, [currentPage, user]);

  const handleRatingComplete = () => {
    refreshDomains();
    setSelectedDomain(null);
  };

  // 排序后的域名列表
  const sortedDomains = useMemo(() => {
    return [...domains].sort((a, b) => {
      // 如果一个有评分一个没有评分，没有评分的排在前面
      if (a.rating && !b.rating) return 1;
      if (!a.rating && b.rating) return -1;
      // 如果都有评分或都没有评分，按域名字母顺序排序
      return a.domain.localeCompare(b.domain);
    });
  }, [domains]);

  // 计算进度
  const progress = useMemo(() => {
    const total = pagination.total;
    const rated = domains.filter(d => d.rating).length;
    return {
      rated,
      total,
      percentage: total > 0 ? Math.round((rated / total) * 100) : 0
    };
  }, [domains, pagination.total]);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          总计: {progress.total} 个域名，
          已评分: {progress.rated} 个，
          完成度: {progress.percentage}%
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>域名</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>标注状态</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {domains.map((domain) => (
              <TableRow 
                key={domain.domain} 
                className={`${domain.rating ? 'bg-gray-50' : ''} cursor-pointer hover:bg-gray-100 transition-colors`}
                onClick={() => setSelectedDomain(domain)}
              >
                <TableCell>{domain.domain}</TableCell>
                <TableCell>
                  <a 
                    href={domain.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {domain.url}
                  </a>
                </TableCell>
                <TableCell>
                  {domain.rating ? (
                    <span className="text-green-600">已标注</span>
                  ) : (
                    <span className="text-red-600">未标注</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={setCurrentPage}
      />

      <RatingDialog
        domain={selectedDomain}
        onClose={handleRatingComplete}
        onSubmitSuccess={refreshDomains}
      />
    </>
  );
} 