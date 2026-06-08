import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { fetchCurrentUser, selectToken } from './store/slices/authSlice';
import { router } from './routes';

/**
 * Root application component.
 * Handles global session rehydration and injects the router provider.
 */
export default function App() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectToken);

  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token]);

  return <RouterProvider router={router} />;
}
