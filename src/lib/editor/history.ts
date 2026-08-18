/**
 * Generic snapshot-stack undo/redo, framework-agnostic so it's unit
 * testable without a real Fabric canvas. Snapshots are compared as
 * serialized strings so a no-op change (e.g. re-selecting the same object)
 * never pushes a duplicate entry. Capped so a long editing session can't
 * grow this unboundedly.
 */
const MAX_HISTORY = 50;

export type History = {
  past: string[];
  present: string;
  future: string[];
};

export function createHistory(initial: string): History {
  return { past: [], present: initial, future: [] };
}

export function pushHistory(history: History, next: string): History {
  if (next === history.present) return history;
  const past = [...history.past, history.present].slice(-MAX_HISTORY);
  return { past, present: next, future: [] };
}

export function undo(history: History): History {
  const previous = history.past.at(-1);
  if (previous === undefined) return history;
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  };
}

export function redo(history: History): History {
  const next = history.future[0];
  if (next === undefined) return history;
  return {
    past: [...history.past, history.present],
    present: next,
    future: history.future.slice(1),
  };
}

export function canUndo(history: History): boolean {
  return history.past.length > 0;
}

export function canRedo(history: History): boolean {
  return history.future.length > 0;
}
