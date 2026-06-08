import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';

/**
 * Typed versions of the standard React-Redux hooks.
 *
 * Use these throughout the app instead of the plain `useDispatch` and
 * `useSelector` — they carry the correct RootState / AppDispatch types
 * so you get full autocomplete and type-checking without manual annotations.
 *
 * @see https://redux-toolkit.js.org/tutorials/typescript#define-typed-hooks
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
