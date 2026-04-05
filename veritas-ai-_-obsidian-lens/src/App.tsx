import Header from './components/Header';
import Hero from './components/Hero';
import Analyzer from './components/Analyzer';
import ForensicAnalysis from './components/ForensicAnalysis';
import BottomNav from './components/BottomNav';

export default function App() {
  return (
    <div className="min-h-screen bg-background selection:bg-white selection:text-black">
      <Header />
      
      <main className="pt-32 pb-40 px-6 max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <Hero />
          </div>
          
          <div className="lg:col-span-8">
            <Analyzer />
          </div>
        </div>
        
        <ForensicAnalysis />
      </main>

      <BottomNav />
    </div>
  );
}
