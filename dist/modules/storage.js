import { createProgress, parseProgress, parseActiveExam } from './core.js';
export const PROGRESS_KEY = 'gplx2026-progress-v1';
export const EXAM_KEY = 'gplx2026-active-exam-v1';
export function readProgress(data, storage) { try { return parseProgress((storage ?? globalThis.localStorage).getItem(PROGRESS_KEY), data); } catch { return createProgress(); } }
export function readExam(data, storage) { try { return parseActiveExam((storage ?? globalThis.localStorage).getItem(EXAM_KEY), data); } catch { return null; } }
export function writeProgress(progress, storage) { try { (storage ?? globalThis.localStorage).setItem(PROGRESS_KEY, JSON.stringify(progress)); return true; } catch { return false; } }
export function writeExam(exam, storage) { try { const target = storage ?? globalThis.localStorage; if (exam) target.setItem(EXAM_KEY, JSON.stringify(exam)); else target.removeItem(EXAM_KEY); return true; } catch { return false; } }
