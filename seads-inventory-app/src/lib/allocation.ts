import type { Projects, Workshops, Workshop } from './types';

export interface PartAlloc {
  need: number;
  allocated: number;
  shortage: number;
}

export interface AllocationResult {
  byWorkshop: Record<string, Record<string, PartAlloc>>;
  remaining: Record<string, number>;
}

/** 開催日を過ぎているか（当日は「これから」扱い） */
export function isPast(ws: Workshop): boolean {
  if (!ws.date) return false;
  const today = new Date().toISOString().slice(0, 10);
  return ws.date < today;
}

/**
 * 割り振り計算エンジン。
 * 企画の現在在庫を、開催予定ワークショップへ日付が近い順に割り振る。
 */
export function computeProjectAllocation(
  pid: string,
  projects: Projects,
  workshops: Workshops,
): AllocationResult {
  const parts = projects[pid]?.parts ?? {};
  const remaining: Record<string, number> = {};
  for (const [partId, p] of Object.entries(parts)) {
    remaining[partId] = Math.max(0, p.stock || 0);
  }

  const upcoming = Object.entries(workshops)
    .filter(([, ws]) => ws.projectId === pid && !isPast(ws))
    .sort(
      (a, b) =>
        (a[1].date || '').localeCompare(b[1].date || '') ||
        (a[1].createdAt || 0) - (b[1].createdAt || 0),
    );

  const byWorkshop: Record<string, Record<string, PartAlloc>> = {};
  for (const [wid, ws] of upcoming) {
    const alloc: Record<string, PartAlloc> = {};
    const participants = ws.participants || 0;
    for (const [partId, p] of Object.entries(parts)) {
      const need = (p.perParticipant || 0) * participants;
      const allocated = Math.min(need, Math.max(0, remaining[partId]));
      alloc[partId] = { need, allocated, shortage: need - allocated };
      remaining[partId] -= allocated;
    }
    byWorkshop[wid] = alloc;
  }
  return { byWorkshop, remaining };
}

export interface Shortage {
  name: string;
  unit: string;
  deficit: number;
}

/** ワークショップ単体の不足リスト（開催済みは空） */
export function computeShortage(
  wid: string,
  ws: Workshop,
  projects: Projects,
  workshops: Workshops,
): Shortage[] {
  if (isPast(ws)) return [];
  const { byWorkshop } = computeProjectAllocation(ws.projectId, projects, workshops);
  const alloc = byWorkshop[wid] ?? {};
  const parts = projects[ws.projectId]?.parts ?? {};
  const shortages: Shortage[] = [];
  for (const [partId, a] of Object.entries(alloc)) {
    if (a.shortage > 0) {
      const p = parts[partId];
      shortages.push({ name: p?.name ?? '', unit: p?.unit ?? '', deficit: a.shortage });
    }
  }
  return shortages;
}

/** 企画内のどこかに不足があるか */
export function projectHasShortage(
  pid: string,
  projects: Projects,
  workshops: Workshops,
): boolean {
  const { byWorkshop } = computeProjectAllocation(pid, projects, workshops);
  return Object.values(byWorkshop).some((alloc) =>
    Object.values(alloc).some((a) => a.shortage > 0),
  );
}
