'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { toast } from 'sonner';
import { Domain } from '@/lib/db/schema';
import { useAuth } from '@/lib/auth';
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Textarea } from "@/components/ui/textarea";

interface RatingDialogProps {
  domain: Domain | null;
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

const scores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const scoringCriteria = {
  relevance: [
    { range: '10', description: '内容与目标学科领域高度相关、主题完全一致、覆盖核心知识点。' },
    { range: '8-9', description: '内容与目标学科领域相关，但可能包含少量无关信息或边缘话题。' },
    { range: '6-7', description: '内容部分相关，但主题不够聚焦，可能涉及较多无关信息。' },
    { range: '4-5', description: '内容与目标学科领域相关性较弱，主题偏离核心，无关信息占比较大。' },
    { range: '1-3', description: '内容与目标学科领域完全无关，主题偏离或错误。' },
  ],
  popularity: [
    { range: '10', description: '内容通俗易懂，术语解释清晰，适合大众阅读，语言表达流畅。' },
    { range: '8-9', description: '内容较为易懂，但部分术语未解释，可能需要一定背景知识。' },
    { range: '6-7', description: '内容有一定专业性，术语较多且未充分解释，适合有一定基础的读者。' },
    { range: '4-5', description: '内容较为晦涩，术语未解释，语言表达不够清晰，适合专业读者。' },
    { range: '1-3', description: '内容过于专业，术语密集且未解释，难以理解，不适合非专业读者。' },
  ],
  professionalism: [
    { range: '10', description: '内容由权威机构或专家撰写，领域知名度高。' },
    { range: '8-9', description: '内容具有较高专业性，但知名度不高。' },
    { range: '6-7', description: '内容有一定专业性，但缺乏深度。' },
    { range: '4-5', description: '内容专业性较弱，可能存在错误或误导性信息，来源不可靠。' },
    { range: '1-3', description: '内容缺乏专业性，完全不符合学科要求，可能存在严重错误或虚假信息。' },
  ],
};

export default function RatingDialog({ domain, onClose, onSubmitSuccess }: RatingDialogProps) {
  const [relevance, setRelevance] = useState('');
  const [popularity, setPopularity] = useState('');
  const [professionalism, setProfessionalism] = useState('');
  const [remark, setRemark] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRating = async () => {
      if (!domain || !user) return;

      try {
        const response = await fetch(`/api/ratings/${domain.domain}?userId=${user.id}`);
        if (response.ok) {
          const rating = await response.json();
          if (rating) {
            setRelevance(rating.relevance.toString());
            setPopularity(rating.popularity.toString());
            setProfessionalism(rating.professionalism.toString());
            setRemark(rating.remark || '');
          } else {
            setRelevance('');
            setPopularity('');
            setProfessionalism('');
            setRemark('');
          }
        }
      } catch (error) {
        console.error('Error fetching rating:', error);
      }
    };

    fetchRating();
  }, [domain, user]);

  const handleSubmit = async () => {
    if (!domain || !user) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain_id: domain.domain,
          user_id: user.id,
          relevance: parseInt(relevance),
          popularity: parseInt(popularity),
          professionalism: parseInt(professionalism),
          remark: remark,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      toast.success('评分成功', {
        description: '您的评分已保存',
      });
      onSubmitSuccess?.();
      onClose();
    } catch (error) {
      toast.error('评分失败', {
        description: '请稍后重试',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!domain) return null;

  return (
    <Dialog open={!!domain} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[1200px] [&>button]:hidden">
        <DialogHeader className="pb-2">
          <DialogTitle className='text-center'>
            <a 
              href={`https://${domain.domain}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {domain.domain}
            </a>
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>相关性</Label>
            </div>
            <RadioGroup value={relevance} onValueChange={setRelevance} className="space-y-1" autoFocus={false}>
              {scoringCriteria.relevance.map((criteria) => (
                <div key={criteria.range} className={`flex h-auto min-h-[60px] items-start rounded-sm border p-2 ${
                  (criteria.range.includes('-') ? 
                    criteria.range.split('-').some(score => score === relevance) : 
                    criteria.range === relevance) ? 'border-green-600 bg-green-50' : ''
                }`}>
                  <div className="flex-1 pr-4">
                    <div className="text-sm text-muted-foreground h-[40px] line-clamp-2">{criteria.description}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {criteria.range.includes('-') ? (
                      criteria.range.split('-').reverse().map((score) => (
                        <div key={score} className="flex items-center space-x-2 cursor-pointer" onClick={() => setRelevance(score)}>
                          <RadioGroupItem value={score} id={`relevance-${score}`} />
                          <Label htmlFor={`relevance-${score}`} className={`w-[2em] cursor-pointer ${relevance === score ? 'font-bold text-green-600' : ''}`}>
                            {score}分
                          </Label>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setRelevance(criteria.range)}>
                        <RadioGroupItem value={criteria.range} id={`relevance-${criteria.range}`} />
                        <Label htmlFor={`relevance-${criteria.range}`} className={`cursor-pointer ${relevance === criteria.range ? 'font-bold text-green-600' : ''}`}>
                          {criteria.range}分
                        </Label>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>科普性</Label>
            </div>
            <RadioGroup value={popularity} onValueChange={setPopularity} className="space-y-1" autoFocus={false}>
              {scoringCriteria.popularity.map((criteria) => (
                <div key={criteria.range} className={`flex h-auto min-h-[60px] items-start rounded-sm border p-2 ${
                  (criteria.range.includes('-') ? 
                    criteria.range.split('-').some(score => score === popularity) : 
                    criteria.range === popularity) ? 'border-green-600 bg-green-50' : ''
                }`}>
                  <div className="flex-1 pr-4">
                    <div className="text-sm text-muted-foreground h-[40px] line-clamp-2">{criteria.description}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {criteria.range.includes('-') ? (
                      criteria.range.split('-').reverse().map((score) => (
                        <div key={score} className="flex items-center space-x-2 cursor-pointer" onClick={() => setPopularity(score)}>
                          <RadioGroupItem value={score} id={`popularity-${score}`} />
                          <Label htmlFor={`popularity-${score}`} className={`w-[2em] cursor-pointer ${popularity === score ? 'font-bold text-green-600' : ''}`}>
                            {score}分
                          </Label>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setPopularity(criteria.range)}>
                        <RadioGroupItem value={criteria.range} id={`popularity-${criteria.range}`} />
                        <Label htmlFor={`popularity-${criteria.range}`} className={`cursor-pointer ${popularity === criteria.range ? 'font-bold text-green-600' : ''}`}>
                          {criteria.range}分
                        </Label>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>专业性</Label>
            </div>
            <RadioGroup value={professionalism} onValueChange={setProfessionalism} className="space-y-1" autoFocus={false}>
              {scoringCriteria.professionalism.map((criteria) => (
                <div key={criteria.range} className={`flex h-auto min-h-[60px] items-start rounded-sm border p-2 ${
                  (criteria.range.includes('-') ? 
                    criteria.range.split('-').some(score => score === professionalism) : 
                    criteria.range === professionalism) ? 'border-green-600 bg-green-50' : ''
                }`}>
                  <div className="flex-1 pr-4">
                    <div className="text-sm text-muted-foreground h-[40px] line-clamp-2">{criteria.description}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {criteria.range.includes('-') ? (
                      criteria.range.split('-').reverse().map((score) => (
                        <div key={score} className="flex items-center space-x-2 cursor-pointer" onClick={() => setProfessionalism(score)}>
                          <RadioGroupItem value={score} id={`professionalism-${score}`} />
                          <Label htmlFor={`professionalism-${score}`} className={`w-[2em] cursor-pointer ${professionalism === score ? 'font-bold text-green-600' : ''}`}>
                            {score}分
                          </Label>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setProfessionalism(criteria.range)}>
                        <RadioGroupItem value={criteria.range} id={`professionalism-${criteria.range}`} />
                        <Label htmlFor={`professionalism-${criteria.range}`} className={`cursor-pointer ${professionalism === criteria.range ? 'font-bold text-green-600' : ''}`}>
                          {criteria.range}分
                        </Label>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Label>备注</Label>
          <Textarea
            value={remark}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRemark(e.target.value)}
            placeholder="请输入备注（选填）"
            className="resize-none"
            rows={2}
          />
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRemark("网页无法打开")}
              type="button"
              className="text-sm font-normal"
            >
              网页无法打开
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRemark("内容来源权威")}
              type="button"
              className="text-sm font-normal"
            >
              内容来源权威
            </Button>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} className='hover:cursor-pointer'>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className='hover:cursor-pointer'>
            {isLoading ? '提交中...' : '提交'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}