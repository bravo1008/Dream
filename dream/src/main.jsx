// main.jsx
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

let root;

function renderApp() {
  const container = document.getElementById('root');
  if (!root) {
    root = createRoot(container);
  }
  root.render(<App />);
}

renderApp();