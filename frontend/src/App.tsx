import { useState } from 'react';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';

function App() {
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return !!localStorage.getItem('userId');
  });

  if (!isOnboarded) {
    return <Onboarding onComplete={() => setIsOnboarded(true)} />;
  }

  return <Home />;
}

export default App;
