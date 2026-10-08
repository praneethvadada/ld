import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import LuckyDrawPage from './pages/LuckyDrawPage.jsx';

export default function App() {
  return (
    <>
      <a className="skip-link" href="#lucky-draw">
        Skip to lucky draw
      </a>
      <Header />
      <LuckyDrawPage />
      <Footer />
    </>
  );
}
