import { createRoot } from 'react-dom/client';
import App from './App';
import './i18n';

window.addEventListener('error', (e) => {
  alert(`Error: ${e.message}\n\n${e.error?.stack ?? ''}`);
});

window.addEventListener('unhandledrejection', (e) => {
  const reason = (e as PromiseRejectionEvent).reason;
  alert(`Unhandled rejection: ${reason?.message ?? reason}`);
});

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<App />);

//
