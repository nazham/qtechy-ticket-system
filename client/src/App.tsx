import { RouterProvider } from 'react-router-dom';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAppSelector } from './store/hooks';
import { selectToken } from './store/slices/authSlice';
import { useGetMeQuery } from './store/slices/authApi';
import { router } from './routes';

/**
 * Root application component.
 * Handles global session rehydration and injects the router provider.
 */
export default function App() {
  const token = useAppSelector(selectToken);

  // Triggers the session profile request if a token exists.
  // The hook's onQueryStarted lifecycle will dispatch state updates to authSlice.
  useGetMeQuery(undefined, { skip: !token });

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="dark"
        transition={Slide}
      />
    </>
  );
}
