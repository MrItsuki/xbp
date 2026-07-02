import { useState } from 'react';
import {
  Plus,
  Minus,
  Check,
  Trash2,
  Pencil,
  PackageOpen,
  TriangleAlert,
  NotebookPen,
} from 'lucide-react';
import { Btn, Badge, Gauge, EmptyState } from './ui';
import { computeProjectAllocation } from '../lib/allocation';
import { setPartStock, deletePart } from '../lib/firebase';
import type { Projects, Workshops } from '../lib/types';

export function ProjectScreen({
  pid,
  projects,
  workshops,
  onEditProject,
  onDeleteProject,
  onAddPart,
  onEditPart,
  onApplyStock,
}: {
  pid: string;
  projects: Projects;
  workshops: Workshops;
  onEditProject: () => void;
  onDeleteProject: () => void;
  onAddPart: () => void;
  onEditPart: (partId: string) => void;
  onApplyStock: (partId: string, value: number) => void;
}) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const proj = projects[pid];
  if (!proj) return null;

  const parts = proj.parts ?? {};
  const { byWorkshop, remaining } = computeProjectAllocation(pid, projects, workshops);

  // 部品ごとの必要合計・不足合計
  const totals: Record<string, { need: number; shortage: number }> = {};
  for (const alloc of Object.values(byWorkshop)) {
    for (const [partId, a] of Object.entries(alloc)) {
      totals[partId] ??= { need: 0, shortage: 0 };
      totals[partId].need += a.need;
      totals[partId].shortage += a.shortage;
    }
  }

  const adjust = async (partId: string, delta: number) => {
    const current = Math.max(0, parts[partId]?.stock || 0);
    setDrafts((d) => ({ ...d, [partId]: '' }));
    await setPartStock(pid, partId, current + delta);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onEditProject}
          className="group inline-flex cursor-pointer items-center gap-2 font-display text-lg font-bold text-primary"
          title="タップして編集"
        >
          {proj.name}
          <Pencil size={14} className="opacity-40 transition-opacity group-hover:opacity-100" aria-hidden />
        </button>
        {/* 破壊的操作は右端に分離 */}
        <Btn variant="danger" onClick={onDeleteProject}>
          <Trash2 size={15} aria-hidden />
          企画を削除
        </Btn>
      </div>

      <button
        type="button"
        onClick={onEditProject}
        className="mb-4 flex w-full cursor-pointer items-center gap-2 rounded-2xl bg-sub px-4 py-3 text-left text-sm text-primary-dark"
        title="タップして編集"
      >
        <NotebookPen size={15} className="shrink-0 opacity-70" aria-hidden />
        {proj.description || '説明なし'}
      </button>

      <div className="mb-3.5 flex items-center justify-between gap-2">
        <h2 className="font-display text-base font-bold text-primary">部品在庫</h2>
        <Btn onClick={onAddPart}>
          <Plus size={15} aria-hidden />
          部品を追加
        </Btn>
      </div>

      {Object.keys(parts).length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <EmptyState icon={<PackageOpen size={34} aria-hidden />}>
            部品箱はまだ空っぽ。
            <br />
            「部品を追加」から使う材料を登録しよう！
          </EmptyState>
        </div>
      ) : (
        <>
          {Object.entries(parts).map(([partId, p], i) => {
            const t = totals[partId] ?? { need: 0, shortage: 0 };
            const isShort = t.shortage > 0;
            const stock = Math.max(0, p.stock || 0);
            const stockPct = t.need > 0 ? Math.round((stock / t.need) * 100) : 100;
            const rest = Math.max(0, remaining[partId] ?? 0);
            const draft = drafts[partId] ?? '';
            const inputId = `stock-${partId}`;

            return (
              <div
                key={partId}
                style={{ '--i': i } as React.CSSProperties}
                className={`card-in mb-3 rounded-2xl border bg-white p-4 shadow-sm ${
                  isShort ? 'border-orange-200 bg-orange-50/40' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onEditPart(partId)}
                    className="group min-w-0 cursor-pointer text-left"
                    title="タップして編集"
                  >
                    <span className="inline-flex items-center gap-1.5 font-bold">
                      {p.name}
                      <Pencil size={13} className="opacity-40 transition-opacity group-hover:opacity-100" aria-hidden />
                    </span>
                    <span className="block text-xs text-slate-600 tabular-nums">
                      {p.perParticipant ?? 0}
                      {p.unit}/人・最低{p.minStock}
                      {p.unit}
                    </span>
                  </button>
                  <Btn
                    variant="danger"
                    className="min-w-11 !px-0"
                    onClick={() => {
                      if (confirm(`部品「${p.name}」を削除しますか？`)) void deletePart(pid, partId);
                    }}
                    aria-label={`${p.name}を削除`}
                  >
                    <Trash2 size={16} aria-hidden />
                  </Btn>
                </div>

                <div className="mt-3">
                  <Gauge pct={stockPct} />
                  <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1 text-xs text-slate-600 tabular-nums">
                    <span>
                      在庫 {stock}
                      {p.unit} / 予定必要 {t.need}
                      {p.unit}・割り振り後残り {rest}
                      {p.unit}
                    </span>
                    {isShort ? (
                      <Badge tone="alert">
                        <TriangleAlert size={12} aria-hidden />
                        {t.shortage}
                        {p.unit}不足
                      </Badge>
                    ) : (
                      <Badge tone="ok">
                        <Check size={12} aria-hidden />
                        充足
                      </Badge>
                    )}
                  </div>
                </div>

                {/* 在庫クイック入力（全ボタン44px以上） */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <Btn variant="secondary" className="min-w-11 !px-2 text-xs font-bold" onClick={() => void adjust(partId, -10)} aria-label="10減らす">
                    -10
                  </Btn>
                  <Btn variant="secondary" className="min-w-11 !px-0" onClick={() => void adjust(partId, -1)} aria-label="1減らす">
                    <Minus size={16} aria-hidden />
                  </Btn>
                  <label htmlFor={inputId} className="sr-only">
                    {p.name}の在庫数
                  </label>
                  <input
                    id={inputId}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    className="min-h-11 w-18 rounded-lg border border-slate-300 text-center text-base font-bold tabular-nums outline-none transition-colors focus:border-primary"
                    value={draft === '' ? String(stock) : draft}
                    onChange={(e) => setDrafts((d) => ({ ...d, [partId]: e.target.value }))}
                  />
                  <Btn variant="secondary" className="min-w-11 !px-0" onClick={() => void adjust(partId, 1)} aria-label="1増やす">
                    <Plus size={16} aria-hidden />
                  </Btn>
                  <Btn variant="secondary" className="min-w-11 !px-2 text-xs font-bold" onClick={() => void adjust(partId, 10)} aria-label="10増やす">
                    +10
                  </Btn>
                  <Btn
                    onClick={() => {
                      const val = draft === '' ? stock : Math.max(0, parseInt(draft) || 0);
                      setDrafts((d) => ({ ...d, [partId]: '' }));
                      onApplyStock(partId, val);
                    }}
                  >
                    <Check size={15} aria-hidden />
                    反映
                  </Btn>
                </div>
              </div>
            );
          })}
          <p className="mt-1 text-xs leading-5 text-slate-600">
            在庫数を変えて「反映」を押すと、開催日が近いワークショップから順に自動で割り振り直されます。
          </p>
        </>
      )}
    </div>
  );
}
