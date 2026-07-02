import {
  MapPin,
  Calendar,
  Users,
  NotebookPen,
  Check,
  Clock,
  Trash2,
  Pencil,
  TriangleAlert,
  PackageOpen,
} from 'lucide-react';
import { Btn, Badge, Gauge, EmptyState } from './ui';
import { computeProjectAllocation, isPast } from '../lib/allocation';
import type { Projects, Workshops } from '../lib/types';

export function WorkshopScreen({
  wid,
  projects,
  workshops,
  onEdit,
  onDelete,
}: {
  wid: string;
  projects: Projects;
  workshops: Workshops;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const ws = workshops[wid];
  if (!ws) return null;
  const past = isPast(ws);
  const parts = projects[ws.projectId]?.parts ?? {};
  const { byWorkshop } = computeProjectAllocation(ws.projectId, projects, workshops);
  const alloc = byWorkshop[wid] ?? {};

  const infoItem = (icon: React.ReactNode, text: React.ReactNode) =>
    past ? (
      <span className="inline-flex items-center gap-1.5 text-sm text-primary-dark">
        {icon}
        {text}
      </span>
    ) : (
      <button
        type="button"
        onClick={onEdit}
        className="group inline-flex min-h-11 cursor-pointer items-center gap-1.5 text-sm text-primary-dark"
        title="タップして編集"
      >
        {icon}
        {text}
        <Pencil size={12} className="opacity-30 transition-opacity group-hover:opacity-100" aria-hidden />
      </button>
    );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-bold text-primary">{ws.name}</h2>
        <Btn variant="danger" onClick={onDelete}>
          <Trash2 size={15} aria-hidden />
          削除
        </Btn>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl bg-sub px-4 py-3">
        {infoItem(<MapPin size={14} className="opacity-70" aria-hidden />, ws.location || '未設定')}
        {infoItem(
          <Calendar size={14} className="opacity-70" aria-hidden />,
          <span className="tabular-nums">{ws.date || '未設定'}</span>,
        )}
        {infoItem(
          <Users size={14} className="opacity-70" aria-hidden />,
          <span className="tabular-nums">参加 {ws.participants || 0}人</span>,
        )}
        {infoItem(<NotebookPen size={14} className="opacity-70" aria-hidden />, ws.description || '説明なし')}
        <Badge tone={past ? 'past' : 'upcoming'}>
          {past ? <Check size={13} aria-hidden /> : <Clock size={13} aria-hidden />}
          {past ? '開催済み（消費確定）' : '開催予定'}
        </Badge>
      </div>

      <h3 className="mb-3.5 font-display text-base font-bold text-primary">割り振られた部品</h3>

      {Object.keys(parts).length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <EmptyState icon={<PackageOpen size={34} aria-hidden />}>
            この企画にはまだ部品が登録されていません。
            <br />
            企画ページの「部品を追加」から登録すると、ここに自動で割り振られます。
          </EmptyState>
        </div>
      ) : (
        <>
          {Object.entries(parts).map(([partId, p], i) => {
            const need = past
              ? (p.perParticipant || 0) * (ws.participants || 0)
              : (alloc[partId]?.need ?? 0);
            const allocated = past ? need : (alloc[partId]?.allocated ?? 0);
            const shortage = past ? 0 : (alloc[partId]?.shortage ?? 0);
            const pct = need > 0 ? Math.round((allocated / need) * 100) : 100;

            return (
              <div
                key={partId}
                style={{ '--i': i } as React.CSSProperties}
                className={`card-in mb-2.5 rounded-2xl border bg-white p-4 shadow-sm ${
                  shortage > 0 ? 'border-orange-200 bg-orange-50/40' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold">{p.name}</span>
                  {past ? (
                    <span className="text-sm text-slate-600 tabular-nums">
                      使用 {need}
                      {p.unit}
                    </span>
                  ) : shortage > 0 ? (
                    <Badge tone="alert">
                      <TriangleAlert size={12} aria-hidden />
                      {shortage}
                      {p.unit}不足
                    </Badge>
                  ) : (
                    <Badge tone="ok">
                      <Check size={12} aria-hidden />
                      確保済み
                    </Badge>
                  )}
                </div>
                {!past && (
                  <div className="mt-2.5">
                    <Gauge pct={pct} />
                    <span className="mt-1 block text-xs text-slate-600 tabular-nums">
                      必要 {need}
                      {p.unit} のうち {allocated}
                      {p.unit} 確保できる
                    </span>
                  </div>
                )}
              </div>
            );
          })}
          {!past && (
            <p className="mt-1 text-xs leading-5 text-slate-600">
              在庫は開催日が近いワークショップから順に割り振られます。
            </p>
          )}
        </>
      )}
    </div>
  );
}
