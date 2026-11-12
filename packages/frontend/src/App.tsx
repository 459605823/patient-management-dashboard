import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './styles/globals.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { PatientList } from './pages/PatientList';
import { PatientPage } from './pages/PatientDetail';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false, staleTime: 30_000 },
    mutations: { retry: false },
  },
});

export const patientRoutes = [
  { path: '/', element: <PatientList /> },
  { path: '/patients/:id', element: <PatientPage key="detail" /> },
  { path: '/patients/:id/edit', element: <PatientPage key="edit" editing /> },
];

const router = createBrowserRouter(patientRoutes);

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
