import { ThirdwebProvider } from 'thirdweb/react';
import { BlockchainProvider } from './context/BlockchainContext' ;
import { contract } from './config/contract';
import Home from './pages/Home';

function App() {
  return (
    <ThirdwebProvider>
      <BlockchainProvider contract={contract}>
        <Home />
      </BlockchainProvider>
    </ThirdwebProvider>
  );
}

export default App;
