import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Standalone apps
import { Terminal } from './components/Terminal';
import { Settings } from './components/Settings';
import { Browser } from './components/Browser';
import { FileManager } from './components/FileManager';
import { TrashBin } from './components/TrashBin';
import { TextEditor } from './components/TextEditor';
import { EmailApp } from './components/EmailApp';
import { KidLogin } from './components/KidLogin';
import { PlayStore, Minecraft2D, PianoKids, SpaceExplorer, ColoringBook, YTKids } from './components/PlayStore';
import { ApkInstaller } from './components/ApkInstaller';
import { IsoInstaller } from './components/IsoInstaller';
import { SahaApp } from './components/SahaApp';
import { LiveChat } from './components/LiveChat';
import { Blender3D } from './components/Blender3D';
import { TvLauncher } from './components/TvLauncher';
import { TabletView } from './components/TabletView';
import { MediaPlayer } from './components/MediaPlayer';
import { CameraApp } from './components/CameraApp';
import { VoiceRecorder } from './components/VoiceRecorder';
import { SmartView } from './components/SmartView';
import { NearbyChat } from './components/NearbyChat';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('Service Worker registered', reg))
      .catch((err) => console.error('Service Worker registration failed', err));
  });
}

// Global PWA installation event listener
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome from automatically showing the mini-infobar on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  (window as any).deferredPrompt = e;
  // Dispatch custom event to notify components that the install prompt is available
  window.dispatchEvent(new CustomEvent('pwa-install-prompt-available'));
});

const StandaloneApp = ({ Component, additionalProps = {} }: { Component: any, additionalProps?: any }) => {
  const navigate = useNavigate();
  return <Component onClose={() => navigate('/')} {...additionalProps} />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/Terminal" element={<StandaloneApp Component={Terminal} />} />
          <Route path="/Settings" element={<StandaloneApp Component={Settings} />} />
          <Route path="/Browser" element={<StandaloneApp Component={Browser} />} />
          <Route path="/FileManager" element={<StandaloneApp Component={FileManager} />} />
          <Route path="/TrashBin" element={<StandaloneApp Component={TrashBin} />} />
          <Route path="/TextEditor" element={<StandaloneApp Component={TextEditor} additionalProps={{ initialContent: '' }} />} />
          <Route path="/EmailApp" element={<StandaloneApp Component={EmailApp} />} />
          <Route path="/KidLogin" element={<StandaloneApp Component={KidLogin} additionalProps={{ onComplete: () => {}, onBack: () => {} }} />} />
          <Route path="/PlayStore" element={<StandaloneApp Component={PlayStore} />} />
          <Route path="/Minecraft2D" element={<StandaloneApp Component={Minecraft2D} />} />
          <Route path="/PianoKids" element={<StandaloneApp Component={PianoKids} />} />
          <Route path="/SpaceExplorer" element={<StandaloneApp Component={SpaceExplorer} />} />
          <Route path="/ColoringBook" element={<StandaloneApp Component={ColoringBook} />} />
          <Route path="/YTKids" element={<StandaloneApp Component={YTKids} />} />
          <Route path="/ApkInstaller" element={<StandaloneApp Component={ApkInstaller} />} />
          <Route path="/IsoInstaller" element={<StandaloneApp Component={IsoInstaller} />} />
          <Route path="/SahaApp" element={<StandaloneApp Component={SahaApp} />} />
          <Route path="/LiveChat" element={<StandaloneApp Component={LiveChat} />} />
          <Route path="/Blender3D" element={<StandaloneApp Component={Blender3D} />} />
          <Route path="/TvLauncher" element={<StandaloneApp Component={TvLauncher} />} />
          <Route path="/TabletView" element={<StandaloneApp Component={TabletView} />} />
          <Route path="/MediaPlayer" element={<StandaloneApp Component={MediaPlayer} />} />
          <Route path="/Camera" element={<StandaloneApp Component={CameraApp} />} />
          <Route path="/CameraApp" element={<StandaloneApp Component={CameraApp} />} />
          <Route path="/VoiceRecorder" element={<StandaloneApp Component={VoiceRecorder} />} />
          <Route path="/SmartView" element={<StandaloneApp Component={SmartView} />} />
          <Route path="/NearbyChat" element={<StandaloneApp Component={NearbyChat} />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
