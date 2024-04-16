import './App.css';

import MainCanvas from './components/MainCanvas';
import ControlPanel from './components/ControlPanel';
import RasterEditor from './components/RasterEditor';

function App() {
  return (
    <>
      <h1>Marching Squares</h1>
      <ControlPanel />
      <main>
        <MainCanvas />
        <RasterEditor />
      </main>
    </>
  );
}

export default App;
