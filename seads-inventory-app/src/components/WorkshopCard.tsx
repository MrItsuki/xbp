import { MapPin, Calendar, Users, TriangleAlert, Check, Clock, ChevronRight, Folder } from 'lucide-react';
import { Badge, Gauge } from './ui';
import { computeProjectAllocation, computeShortage, isPast } from '../lib/allocation';
import type { Projects, Workshops, Workshop } from '../lib/types';

export function WorkshopCard({
  wid,
  ws,
  index,
  showProjectName,
  projects,
  workshops,
  onOpen,
}: {
  wid: string;
  ws: Workshop;
  index: number;
  showProjectName: boolean;
  projects: Projects;
  workshops: Workshops;
  onOpen: () => void;
}) {
  const past = isPast(ws);
  const shortages = computeShortage(wid, ws, projects, workshops);
  const projectName = projects[ws.projectId]?.name ?? '(企画削除済み)';

  let gauge: { pct: number; allocated: number; need: number } | null = null;
  if (!past) {
    const { byWorkshop } = computeProjectAllocation(ws.projectId, projects, workshops);
    const alloc = byWorkshop[wid] ?? {};
    let need = 0;
    let allocated = 0;
    for (const a of Object.values(alloc)) {
      need += a.need;
      allocated += a.allocated;
    }
    if (need > 0) gauge = { pct: Math.round((allocated / need) * 100), allocated, need };
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      style={{ '--i': index } as React.CSSProperties}
      className="card-in mb-3 block w-full cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.985] touch-manipulation"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-display text-base font-bold">{ws.name}</div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-slate-600">
            {showProjectName && (
              <Badge tone="info">
                <Folder size={12} aria-hidden />
                {projectName}
              </Badge>
            )}
            <span className="inline-flex items-center gap-1">
              <MapPin size={13} aria-hidden />
              {ws.location || '未設定'}
            </span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Calendar size={13} aria-hidden />
              {ws.date || '未設定'}
            </span>
          </div>
        </div>
        {shortages.length > 0 ? (
          <Badge tone="alert">
            <TriangleAlert size={13} aria-hidden />
            部品不足 {shortages.length}件
          </Badge>
        ) : (
          <Badge tone="ok">
            <Check size={13} aria-hidden />
            材料OK
          </Badge>
        )}
      </div>

      {shortages.length > 0 && (
        <p className="mt-2 text-[13px] font-medium text-accent-dark">
          {shortages.map((s) => `${s.name} ${s.deficit}${s.unit}不足`).join('、')}
        </p>
      )}

      {gauge && (
        <div className="mt-2.5">
          <Gauge pct={gauge.pct} />
          <span className="mt-1 block text-[11px] text-slate-600 tabular-nums">
            材料の確保 {gauge.pct}%（{gauge.allocated}/{gauge.need}）
          </span>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-1.5 border-t border-slate-100 pt-2.5">
        <Badge tone="info">
          <Users size={13} aria-hidden />
          参加 {ws.participants || 0}人
        </Badge>
        <Badge tone={past ? 'past' : 'upcoming'}>
          {past ? <Check size={13} aria-hidden /> : <Clock size={13} aria-hidden />}
          {past ? '開催済み' : '開催予定'}
        </Badge>
        <span className="inline-flex items-center gap-0.5 text-xs text-slate-500">
          タップして詳細を見る
          <ChevronRight size={14} aria-hidden />
        </span>
      </div>
    </button>
  );
}
