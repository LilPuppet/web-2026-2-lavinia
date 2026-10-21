import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './amplify'; // configura o AWS Amplify Auth (Cognito) antes do app
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
