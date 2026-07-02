import { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Box } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { ProjectScreen } from './components/ProjectScreen';
import { WorkshopScreen } from './components/WorkshopScreen';
import { ProjectModal, PartModal, WorkshopModal } from './components/modals';
import {
  subscribeProjects,
  subscribeWorkshops,
  subscribeConnection,
  createProject,
  updateProject,
  deleteProjectCascade,
  addPart,
  updatePart,
  setPartStock,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
} from './lib/firebase';
import { isPast, projectHasShortage } from './lib/allocation';
import { fireConfetti } from './lib/confetti';
import type { Projects, Workshops } from './lib/types';

type Screen =
  | { name: 'dashboard' }
  | { name: 'project'; pid: string }
  | { name: 'workshop'; wid: string };

type ModalState =
  | null
  | { kind: 'create-project' }
  | { kind: 'edit-project'; pid: string }
  | { kind: 'add-part'; pid: string }
  | { kind: 'edit-part'; pid: string; partId: string }
  | { kind: 'create-workshop'; pid: string }
  | { kind: 'edit-workshop'; wid: string };

export default function App() {
  const [projects, setProjects] = useState<Projects>({});
  const [workshops, setWorkshops] = useState<Workshops>({});
  const [online, setOnline] = useState(true);
  const [tab, setTab] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>({ name: 'dashboard' });
  const [modal, setModal] = useState<ModalState>(null);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<number>(0);

  // 反映後の充足判定用に最新値を参照できるようにする
  const latest = useRef({ projects, workshops });
  latest.current = { projects, workshops };

  useEffect(() => {
    const u1 = subscribeProjects(setProjects);
    const u2 = subscribeWorkshops(setWorkshops);
    const u3 = subscribeConnection(setOnline);
    return () => {
      u1();
      u2();
      u3();
    };
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 3200);
  }, []);

  // 画面遷移
  const goDashboard = (keepTab: boolean) => {
    if (!keepTab) setTab(null);
    setScreen({ name: 'dashboard' });
  };
  const openProject = (pid: string) => {
    setTab(pid);
    setScreen({ name: 'project', pid });
  };
  const openWorkshop = (wid: string) => {
    const ws = workshops[wid];
    if (ws) setTab(ws.projectId);
    setScreen({ name: 'workshop', wid });
  };

  // 削除された対象を表示中ならダッシュボードに戻す
  useEffect(() => {
    if (screen.name === 'project' && !projects[screen.pid]) goDashboard(false);
    if (screen.name === 'workshop' && !workshops[screen.wid]) setScreen({ name: 'dashboard' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, workshops]);

  // 在庫反映（全ワークショップ充足になった瞬間だけお祝い）
  const applyStock = async (pid: string, partId: string, value: number) => {
    const hadShortage = projectHasShortage(pid, latest.current.projects, latest.current.workshops);
    await setPartStock(pid, partId, value);
    window.setTimeout(() => {
      const { projects: p, workshops: w } = latest.current;
      if (hadShortage && !projectHasShortage(pid, p, w)) {
        fireConfetti();
        showToast('全ワークショップの材料が揃いました！');
      } else {
        showToast('在庫を反映し、割り振りを更新しました');
      }
    }, 350);
  };

  const deleteWs = async (wid: string) => {
    const ws = workshops[wid];
    if (!ws) return;
    if (!confirm(`ワークショップ「${ws.name}」を削除しますか？`)) return;
    await deleteWorkshop(wid);
    showToast('ワークショップを削除しました');
    goDashboard(true);
  };

  const deleteProj = async (pid: string) => {
    const proj = projects[pid];
    if (!proj) return;
    if (
      !confirm(
        `企画「${proj.name}」を削除しますか？部品在庫と、紐づくワークショップもすべて削除されます。`,
      )
    )
      return;
    await deleteProjectCascade(pid, workshops);
    showToast('企画を削除しました');
    goDashboard(false);
  };

  const openEditWorkshop = (wid: string) => {
    const ws = workshops[wid];
    if (!ws) return;
    if (isPast(ws)) {
      showToast('開催日を過ぎたワークショップは編集できません');
      return;
    }
    setModal({ kind: 'edit-workshop', wid });
  };

  return (
    <div className="min-h-dvh">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 bg-gradient-to-br from-primary to-[#0074D9] px-4 text-white shadow-md">
        {screen.name !== 'dashboard' && (
          <button
            type="button"
            onClick={() =>
              screen.name === 'workshop' ? goDashboard(true) : goDashboard(true)
            }
            aria-label="戻る"
            className="-ml-2 flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-white/15 touch-manipulation"
          >
            <ArrowLeft size={20} aria-hidden />
          </button>
        )}
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/25">
          <Box size={16} aria-hidden />
        </span>
        <h1 className="min-w-0 truncate font-display text-[17px] font-bold">
          {screen.name === 'project'
            ? projects[screen.pid]?.name ?? '企画詳細'
            : screen.name === 'workshop'
              ? workshops[screen.wid]?.name ?? 'ワークショップ詳細'
              : 'SEAds 在庫管理'}
        </h1>
        <span className="ml-auto flex items-center gap-1.5 text-xs opacity-90">
          <span
            className={`h-2 w-2 rounded-full ${online ? 'bg-green-400' : 'bg-red-400'}`}
            aria-hidden
          />
          {online ? 'オンライン' : 'オフライン'}
        </span>
      </header>

      <main className="mx-auto max-w-4xl p-4">
        {screen.name === 'dashboard' && (
          <Dashboard
            projects={projects}
            workshops={workshops}
            tab={tab}
            onSelectTab={setTab}
            onNewProject={() => setModal({ kind: 'create-project' })}
            onOpenProject={openProject}
            onNewWorkshop={(pid) => setModal({ kind: 'create-workshop', pid })}
            onOpenWorkshop={openWorkshop}
          />
        )}
        {screen.name === 'project' && (
          <ProjectScreen
            pid={screen.pid}
            projects={projects}
            workshops={workshops}
            onEditProject={() => setModal({ kind: 'edit-project', pid: screen.pid })}
            onDeleteProject={() => void deleteProj(screen.pid)}
            onAddPart={() => setModal({ kind: 'add-part', pid: screen.pid })}
            onEditPart={(partId) => setModal({ kind: 'edit-part', pid: screen.pid, partId })}
            onApplyStock={(partId, value) => void applyStock(screen.pid, partId, value)}
          />
        )}
        {screen.name === 'workshop' && (
          <WorkshopScreen
            wid={screen.wid}
            projects={projects}
            workshops={workshops}
            onEdit={() => openEditWorkshop(screen.wid)}
            onDelete={() => void deleteWs(screen.wid)}
          />
        )}
      </main>

      {/* モーダル */}
      {modal?.kind === 'create-project' && (
        <ProjectModal
          onClose={() => setModal(null)}
          onSubmit={async (name, description) => {
            await createProject(name, description);
            showToast('企画を作成しました');
          }}
        />
      )}
      {modal?.kind === 'edit-project' && projects[modal.pid] && (
        <ProjectModal
          initial={projects[modal.pid]}
          onClose={() => setModal(null)}
          onSubmit={async (name, description) => {
            await updateProject(modal.pid, { name, description });
            showToast('企画を更新しました');
          }}
        />
      )}
      {modal?.kind === 'add-part' && (
        <PartModal
          onClose={() => setModal(null)}
          onSubmit={async (v) => {
            await addPart(modal.pid, v);
            showToast('部品を追加しました');
          }}
        />
      )}
      {modal?.kind === 'edit-part' && projects[modal.pid]?.parts?.[modal.partId] && (
        <PartModal
          initial={projects[modal.pid].parts![modal.partId]}
          onClose={() => setModal(null)}
          onSubmit={async (v) => {
            await updatePart(modal.pid, modal.partId, {
              name: v.name,
              unit: v.unit,
              minStock: v.minStock,
              perParticipant: v.perParticipant,
            });
            showToast('部品を更新しました');
          }}
        />
      )}
      {modal?.kind === 'create-workshop' && (
        <WorkshopModal
          projectId={modal.pid}
          projects={projects}
          onClose={() => setModal(null)}
          onSubmit={async (v) => {
            await createWorkshop({ projectId: modal.pid, ...v });
            showToast('ワークショップを作成しました');
          }}
        />
      )}
      {modal?.kind === 'edit-workshop' && workshops[modal.wid] && (
        <WorkshopModal
          projectId={workshops[modal.wid].projectId}
          projects={projects}
          initial={workshops[modal.wid]}
          onClose={() => setModal(null)}
          onSubmit={async (v) => {
            await updateWorkshop(modal.wid, v);
            showToast('ワークショップを更新しました');
          }}
        />
      )}

      {/* トースト */}
      <div
        aria-live="polite"
        className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-800 px-5 py-2.5 text-sm text-white shadow-lg transition-all duration-300 ${
          toast ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-16 opacity-0'
        }`}
      >
        {toast}
      </div>
    </div>
  );
}
