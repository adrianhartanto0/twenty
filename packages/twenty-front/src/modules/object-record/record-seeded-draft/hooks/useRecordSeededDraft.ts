import { useEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

const PERSIST_DEBOUNCE_MS = 500;
const PERSISTED_DRAFTS_HISTORY_SIZE = 10;

type UseRecordSeededDraftArgs<TDraft extends object> = {
  upstreamDraft: TDraft;
  onPersist: (draft: TDraft) => void;
  persistDebounceMs?: number;
  // Changing it reseeds the draft and drops any pending persist of the previous record.
  resetKey?: string;
};

type ScheduledPersist<TDraft> = {
  draftToPersist: TDraft;
  scheduledResetGeneration: number;
};

type PersistedDraft<TDraft> = {
  draft: TDraft;
  resetGeneration: number;
};

// Remote changes reach a pristine draft at once; a dirty draft wins on its debounced persist (last write wins).
// Our own persists echo back equal to the draft and only mark it pristine, never disrupting typing.
// Editors that debounce their own serialization call markDirty on raw changes so the gap never reads as pristine.
export const useRecordSeededDraft = <TDraft extends object>({
  upstreamDraft,
  onPersist,
  persistDebounceMs = PERSIST_DEBOUNCE_MS,
  resetKey,
}: UseRecordSeededDraftArgs<TDraft>) => {
  const [draft, setDraft] = useState<TDraft>(upstreamDraft);
  const [lastUpstreamDraft, setLastUpstreamDraft] =
    useState<TDraft>(upstreamDraft);
  const [lastResetKey, setLastResetKey] = useState(resetKey);
  const [resyncCount, setResyncCount] = useState(0);
  const [resetGeneration, setResetGeneration] = useState(0);
  const [hasUncommittedEdit, setHasUncommittedEdit] = useState(false);

  // A slow response can echo an older persist after newer typing; matching it here keeps it from reading as a remote edit.
  // oxlint-disable-next-line twenty/no-state-useref
  const persistedDraftsRef = useRef<PersistedDraft<TDraft>[]>([]);

  // Cancelling the timer during render is unsafe, so each persist carries its reset generation and is dropped once stale.
  // A counter rather than the key, so going A to B back to A still drops A's first pending persist.
  const persistDebounced = useDebouncedCallback(
    ({
      draftToPersist,
      scheduledResetGeneration,
    }: ScheduledPersist<TDraft>) => {
      if (scheduledResetGeneration !== resetGeneration) {
        return;
      }

      persistedDraftsRef.current = [
        ...persistedDraftsRef.current,
        { draft: draftToPersist, resetGeneration: scheduledResetGeneration },
      ].slice(-PERSISTED_DRAFTS_HISTORY_SIZE);

      onPersist(draftToPersist);
    },
    persistDebounceMs,
  );

  if (resetKey !== lastResetKey) {
    setLastResetKey(resetKey);
    setLastUpstreamDraft(upstreamDraft);
    setDraft(upstreamDraft);
    setResyncCount((count) => count + 1);
    setResetGeneration((generation) => generation + 1);
    setHasUncommittedEdit(false);
  } else if (!isDeeplyEqual(upstreamDraft, lastUpstreamDraft)) {
    const isDraftPristine =
      !hasUncommittedEdit &&
      !persistDebounced.isPending() &&
      isDeeplyEqual(draft, lastUpstreamDraft);

    const isOwnPersistedEcho = persistedDraftsRef.current.some(
      (persistedDraft) =>
        persistedDraft.resetGeneration === resetGeneration &&
        isDeeplyEqual(persistedDraft.draft, upstreamDraft),
    );

    setLastUpstreamDraft(upstreamDraft);

    if (isDraftPristine && !isOwnPersistedEcho) {
      setDraft(upstreamDraft);
      setResyncCount((count) => count + 1);
    }
  }

  // Trailing keystrokes must never be lost when the editor goes away.
  useEffect(() => () => persistDebounced.flush(), [persistDebounced]);

  const updateDraft = (partialDraft: Partial<TDraft>) => {
    const nextDraft = { ...draft, ...partialDraft };

    setDraft(nextDraft);
    setHasUncommittedEdit(false);
    persistDebounced({
      draftToPersist: nextDraft,
      scheduledResetGeneration: resetGeneration,
    });
  };

  // For editors whose serialized value arrives later: blocks adoption without scheduling a persist.
  const markDirty = () => {
    setHasUncommittedEdit(true);
  };

  return {
    draft,
    updateDraft,
    markDirty,
    flush: persistDebounced.flush,
    isDirty:
      hasUncommittedEdit ||
      persistDebounced.isPending() ||
      !isDeeplyEqual(draft, lastUpstreamDraft),
    draftResyncKey: resyncCount,
  };
};
