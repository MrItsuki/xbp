import { Plus, Boxes, Palette, Wrench } from 'lucide-react';
import { Btn, EmptyState } from './ui';
import { WorkshopCard } from './WorkshopCard';
import { isPast, projectHasShortage } from '../lib/allocation';
import type { Projects, Workshops } from '../lib/types';

export function Dashboard({
  projects,
  workshops,
  tab,
  onSelectTab,
  onNewProject,
  onOpenProject,
  onNewWorkshop,
  onOpenWorkshop,
}: {
  projects: Projects;
  workshops: Workshops;
  tab: string | null;
  onSelectTab: (pid: string | null) => void;
  onNewProject: () => void;
  onOpenProject: (pid: string) => void;
  onNewWorkshop: (pid: string) => void;
  onOpenWorkshop: (wid: string) => void;
}) {
  const entries = Object.entries(workshops).filter(
    ([, ws]) => tab === null || ws.projectId === tab,
  );
  const upcoming = entries
    .filter(([, ws]) => !isPast(ws))
    .sort((a, b) => (a[1].date || '').localeCompare(b[1].date || ''));
  const past = entries
    .filter(([, ws]) => isPast(ws))
    .sort((a, b) => (b[1].date || '').localeCompare(a[1].date || ''));
  const ordered = [...upcoming, ...past];

  const tabCls = (active: boolean) =>
    `inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-all duration-200 touch-manipulation active:scale-95 ${
      active
        ? 'scale-105 border-primary bg-primary text-white shadow-md'
        : 'border-slate-300 bg-white text-primary hover:bg-sub'
    }`;

  return (
    <div>
      {/* 企画タブ（横スライド） */}
      <div role="tablist" aria-label="企画で絞り込み" className="mb-3.5 flex gap-2 overflow-x-auto pb-2">
        <button
          type="button"
          role="tab"
          aria-selected={tab === null}
          className={tabCls(tab === null)}
          onClick={() => onSelectTab(null)}
        >
          すべて
        </button>
        {Object.entries(projects).map(([pid, proj]) => {
          const hasShortage = projectHasShortage(pid, projects, workshops);
          return (
            <button
              key={pid}
              type="button"
              role="tab"
              aria-selected={tab === pid}
              className={tabCls(tab === pid)}
              onClick={() => onSelectTab(pid)}
            >
              {hasShortage && (
                <span
                  className={`h-1.5 w-1.5 rounded-full ${tab === pid ? 'bg-white' : 'bg-accent'}`}
                  title="在庫不足あり"
                />
              )}
              {proj.name}
            </button>
          );
        })}
        <button
          type="button"
          className={`${tabCls(false)} min-w-11 justify-center border-dashed !text-slate-500`}
          onClick={onNewProject}
          aria-label="新しい企画を追加"
        >
          <Plus size={16} aria-hidden />
        </button>
      </div>

      {/* 選択中の企画アクション */}
      {tab && projects[tab] && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl bg-sub px-3.5 py-2.5">
          <strong className="mr-1 font-display text-primary-dark">{projects[tab].name}</strong>
          <Btn variant="secondary" className="bg-white" onClick={() => onOpenProject(tab)}>
            <Boxes size={15} aria-hidden />
            部品在庫を管理
          </Btn>
          <Btn onClick={() => onNewWorkshop(tab)}>
            <Plus size={15} aria-hidden />
            ワークショップを追加
          </Btn>
        </div>
      )}

      {/* ワークショップ一覧 */}
      {Object.keys(projects).length === 0 ? (
        <EmptyState icon={<Palette size={34} aria-hidden />}>
          まだ企画がありません。
          <br />
          上のタブの「＋」から最初の企画を作ってみよう！
        </EmptyState>
      ) : ordered.length === 0 ? (
        <EmptyState icon={<Wrench size={34} aria-hidden />}>
          {tab === null ? (
            <>
              ワークショップはこれから！
              <br />
              企画タブを選んで最初の1件を追加しよう。
            </>
          ) : (
            <>
              この企画のワークショップはまだ0件。
              <br />
              「ワークショップを追加」から登録してみよう！
            </>
          )}
        </EmptyState>
      ) : (
        ordered.map(([wid, ws], i) => (
          <WorkshopCard
            key={wid}
            wid={wid}
            ws={ws}
            index={i}
            showProjectName={tab === null}
            projects={projects}
            workshops={workshops}
            onOpen={() => onOpenWorkshop(wid)}
          />
        ))
      )}
    </div>
  );
}
