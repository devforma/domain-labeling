'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface DomainListProps {
  initialDomains: Domain[];
}

interface DomainWithRating extends Domain {
  rating?: {
    relevance: number;
    popularity: number;
    professionalism: number;
    remark: string;
    updated_at?: string;
  };
}

interface PaginationData {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const pageSize = 20;

export default function DomainList({ initialDomains }: DomainListProps) {
  const [selectedDomain, setSelectedDomain] = useState<DomainWithRating | null>(null);
  const [domains, setDomains] = useState<DomainWithRating[]>(initialDomains);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'status' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [pagination, setPagination] = useState<PaginationData>({
    total: initialDomains.length,
    page: 1,
    pageSize: pageSize,
    totalPages: Math.ceil(initialDomains.length / pageSize)
  });
  const [totalRatedCount, setTotalRatedCount] = useState(0);
  const { user, logout } = useAuth();
  const router = useRouter();

  const refreshDomains = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch(
        `/api/domains?userId=${user.id}&page=${currentPage}&pageSize=${pageSize}` +
        (sortBy ? `&sortBy=${sortBy}&sortOrder=${sortOrder}` : '')
      );
      if (response.ok) {
        const data = await response.json();
        const domainsWithRatings = data.domains.map((d: any) => ({
          domain: d.domain,
          subject_code: d.subject_code,
          url: d.url,
          rating: d.relevance ? {
            relevance: d.relevance,
            popularity: d.popularity,
            professionalism: d.professionalism,
            remark: d.remark,
            updated_at: d.updated_at
          } : undefined
        }));
        setDomains(domainsWithRatings);
        setPagination(data.pagination);
        setTotalRatedCount(data.totalRated || 0);
        // setSelectedDomain(null);
      }
    } catch (error) {
      console.error('Error refreshing domains:', error);
    }
  }, [currentPage, user, sortBy, sortOrder]);

  // 当页码或排序改变时刷新数据
  useEffect(() => {
    refreshDomains();
  }, [currentPage, user, sortBy, sortOrder, refreshDomains]);

  const handleRatingComplete = () => {
    refreshDomains();
    console.log('rating complete');
    setSelectedDomain(null);
  };

  // 移除本地排序逻辑，直接使用服务器返回的数据
  const sortedDomains = domains;

  const handleSort = (column: 'status') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // 计算进度
  const progress = useMemo(() => {
    const total = pagination.total;
    return {
      rated: totalRatedCount,
      total,
      percentage: total > 0 ? Math.round((totalRatedCount / total) * 100) : 0
    };
  }, [pagination.total, totalRatedCount]);

  // Get the current index of the selected domain
  const selectedDomainIndex = useMemo(() => {
    if (!selectedDomain) return -1;
    return sortedDomains.findIndex(domain => domain.domain === selectedDomain.domain);
  }, [selectedDomain, sortedDomains]);

  // Handle navigation between domains
  const handlePreviousDomain = () => {
    if (selectedDomainIndex > 0) {
      setSelectedDomain(sortedDomains[selectedDomainIndex - 1]);
    }
  };

  const handleNextDomain = () => {
    if (selectedDomainIndex < sortedDomains.length - 1) {
      setSelectedDomain(sortedDomains[selectedDomainIndex + 1]);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          总计: {progress.total} 个域名，
          已评分: {progress.rated} 个，
          完成度: {progress.percentage}%
        </div>
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="text-sm cursor-pointer"
        >
          退出登录
        </Button>
      </div>

      <div className="mx-auto">
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[300px] pl-6">域名</TableHead>
                <TableHead className="w-[400px]">URL</TableHead>
                <TableHead className="w-[180px] pr-6">标注时间</TableHead>
                <TableHead 
                  className="w-[120px] cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    标注状态
                    <span className="text-xs text-gray-400">
                      {sortBy === 'status' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDomains.map((domain) => (
                <TableRow 
                  key={domain.domain} 
                  className="cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setSelectedDomain(domain)}
                >
                  <TableCell className="w-[300px] pl-6 truncate">{domain.domain}</TableCell>
                  <TableCell className="w-[400px]">
                    <a 
                      href={domain.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {domain.url}
                    </a>
                  </TableCell>
                  <TableCell className="w-[180px] pr-6">
                    {domain.rating?.updated_at}
                  </TableCell>
                  <TableCell className="w-[120px]">
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
      </div>

      <div className="flex items-center justify-center">
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <RatingDialog
        domain={selectedDomain}
        onClose={handleRatingComplete}
        onSubmitSuccess={refreshDomains}
        onPrevious={handlePreviousDomain}
        onNext={handleNextDomain}
        hasPrevious={selectedDomainIndex > 0}
        hasNext={selectedDomainIndex < sortedDomains.length - 1}
      />
    </>
  );
} 