import { useState } from 'react';
import { FolderPlus, Pencil, PackagePlus, CalendarPlus } from 'lucide-react';
import { Modal, Field, Btn, inputCls } from './ui';
import type { Project, Part, Workshop, Projects } from '../lib/types';

function focusFirstError(errors: Record<string, string>) {
  const first = Object.keys(errors)[0];
  if (first) document.getElementById(first)?.focus();
}

// ── 企画フォーム ──

export function ProjectModal({
  initial,
  onSubmit,
  onClose,
}: {
  initial?: Project;
  onSubmit: (name: string, description: string) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [desc, setDesc] = useState(initial?.description ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const editing = Boolean(initial);

  const submit = async () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs['proj-name'] = '企画名を入力してください';
    setErrors(errs);
    if (Object.keys(errs).length) {
      focusFirstError(errs);
      return;
    }
    setBusy(true);
    try {
      await onSubmit(name.trim(), desc.trim());
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={editing ? '企画を編集' : '企画を作成'}
      icon={editing ? <Pencil size={18} aria-hidden /> : <FolderPlus size={18} aria-hidden />}
      onClose={onClose}
    >
      <Field id="proj-name" label="企画名" required error={errors['proj-name']}>
        <input
          id="proj-name"
          className={inputCls}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: 段ボール工作教室"
          aria-invalid={Boolean(errors['proj-name'])}
        />
      </Field>
      <Field id="proj-desc" label="説明">
        <textarea
          id="proj-desc"
          className={inputCls}
          rows={2}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="内容の概要を入力"
        />
      </Field>
      <div className="mt-5 flex justify-end gap-2">
        <Btn variant="secondary" onClick={onClose}>キャンセル</Btn>
        <Btn onClick={submit} busy={busy}>{editing ? '保存' : '作成'}</Btn>
      </div>
    </Modal>
  );
}

// ── 部品フォーム ──

export interface PartFormValue {
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  perParticipant: number;
}

export function PartModal({
  initial,
  onSubmit,
  onClose,
}: {
  initial?: Part;
  onSubmit: (value: PartFormValue) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [unit, setUnit] = useState(initial?.unit ?? '');
  const [stock, setStock] = useState(String(initial?.stock ?? 0));
  const [minStock, setMinStock] = useState(String(initial?.minStock ?? 1));
  const [perParticipant, setPerParticipant] = useState(String(initial?.perParticipant ?? 1));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const editing = Boolean(initial);

  const submit = async () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs['part-name'] = '部品名を入力してください';
    if (!unit.trim()) errs['part-unit'] = '単位を入力してください（例: 個・m・g）';
    setErrors(errs);
    if (Object.keys(errs).length) {
      focusFirstError(errs);
      return;
    }
    setBusy(true);
    try {
      await onSubmit({
        name: name.trim(),
        unit: unit.trim(),
        stock: Math.max(0, parseInt(stock) || 0),
        minStock: Math.max(0, parseInt(minStock) || 0),
        perParticipant: Math.max(0, parseInt(perParticipant) || 0),
      });
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={editing ? '部品を編集' : '部品を追加'}
      icon={editing ? <Pencil size={18} aria-hidden /> : <PackagePlus size={18} aria-hidden />}
      onClose={onClose}
    >
      <Field id="part-name" label="部品名" required error={errors['part-name']}>
        <input
          id="part-name"
          className={inputCls}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: PLA フィラメント（白）"
          aria-invalid={Boolean(errors['part-name'])}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2.5">
        <Field id="part-unit" label="単位" required error={errors['part-unit']}>
          <input
            id="part-unit"
            className={inputCls}
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="例: 個・m・g"
            aria-invalid={Boolean(errors['part-unit'])}
          />
        </Field>
        {!editing && (
          <Field id="part-stock" label="初期在庫数">
            <input
              id="part-stock"
              className={inputCls}
              type="number"
              inputMode="numeric"
              min={0}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </Field>
        )}
        <Field id="part-min" label="最低在庫数" hint="下回ると警告">
          <input
            id="part-min"
            className={inputCls}
            type="number"
            inputMode="numeric"
            min={0}
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
          />
        </Field>
        <Field id="part-pp" label="1人あたり必要数" required hint="参加人数×この数を自動割り振り">
          <input
            id="part-pp"
            className={inputCls}
            type="number"
            inputMode="numeric"
            min={0}
            value={perParticipant}
            onChange={(e) => setPerParticipant(e.target.value)}
          />
        </Field>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Btn variant="secondary" onClick={onClose}>キャンセル</Btn>
        <Btn onClick={submit} busy={busy}>{editing ? '保存' : '追加'}</Btn>
      </div>
    </Modal>
  );
}

// ── ワークショップフォーム ──

export interface WorkshopFormValue {
  name: string;
  description: string;
  date: string;
  location: string;
  participants: number;
}

export function WorkshopModal({
  projectId,
  projects,
  initial,
  onSubmit,
  onClose,
}: {
  projectId: string;
  projects: Projects;
  initial?: Workshop;
  onSubmit: (value: WorkshopFormValue) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [desc, setDesc] = useState(initial?.description ?? '');
  const [date, setDate] = useState(initial?.date ?? '');
  const [location, setLocation] = useState(initial?.location ?? '');
  const [participants, setParticipants] = useState(String(initial?.participants ?? 0));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const editing = Boolean(initial);

  const parts = projects[projectId]?.parts ?? {};
  const count = Math.max(0, parseInt(participants) || 0);
  const preview = Object.values(parts)
    .map((p) => `${p.name} ${(p.perParticipant || 0) * count}${p.unit}`)
    .join('、');

  const submit = async () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs['ws-name'] = 'ワークショップ名を入力してください';
    if (!date) errs['ws-date'] = '開催日を選択してください';
    if (!location.trim()) errs['ws-location'] = '開催地を入力してください';
    setErrors(errs);
    if (Object.keys(errs).length) {
      focusFirstError(errs);
      return;
    }
    setBusy(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: desc.trim(),
        date,
        location: location.trim(),
        participants: count,
      });
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={editing ? 'ワークショップを編集' : 'ワークショップを追加'}
      icon={editing ? <Pencil size={18} aria-hidden /> : <CalendarPlus size={18} aria-hidden />}
      onClose={onClose}
    >
      <Field id="ws-name" label="ワークショップ名" required error={errors['ws-name']}>
        <input
          id="ws-name"
          className={inputCls}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: 夏のものづくり教室"
          aria-invalid={Boolean(errors['ws-name'])}
        />
      </Field>
      <Field id="ws-desc" label="説明">
        <textarea
          id="ws-desc"
          className={inputCls}
          rows={2}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="内容の概要を入力"
        />
      </Field>
      <div className="grid grid-cols-2 gap-2.5">
        <Field id="ws-date" label="開催日" required error={errors['ws-date']}>
          <input
            id="ws-date"
            className={inputCls}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-invalid={Boolean(errors['ws-date'])}
          />
        </Field>
        <Field id="ws-location" label="開催地" required error={errors['ws-location']}>
          <input
            id="ws-location"
            className={inputCls}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="例: 横浜市立〇〇小学校"
            aria-invalid={Boolean(errors['ws-location'])}
          />
        </Field>
      </div>
      <Field id="ws-participants" label="参加人数" required>
        <input
          id="ws-participants"
          className={inputCls}
          type="number"
          inputMode="numeric"
          min={0}
          value={participants}
          onChange={(e) => setParticipants(e.target.value)}
        />
      </Field>
      <p className="mb-3.5 text-xs leading-5 text-slate-600">
        {preview
          ? `必要部品: ${preview}（在庫は日付が近い順に自動割り振り）`
          : '部品が登録されていません。企画ページで部品を追加すると自動で割り振られます。'}
      </p>
      <div className="mt-2 flex justify-end gap-2">
        <Btn variant="secondary" onClick={onClose}>キャンセル</Btn>
        <Btn onClick={submit} busy={busy}>{editing ? '保存' : '作成'}</Btn>
      </div>
    </Modal>
  );
}
