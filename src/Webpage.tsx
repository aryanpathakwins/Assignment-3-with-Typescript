

import UsersModal from "./Pages/User/UsersModal";


const WelcomePage: React.FC = () => {
  

  return (
    <div className="min-h-screen flex flex-col bg-[url(./background.jpg)] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-white/20"></div>

      {/* Navbar */}
      {/* <Header /> */}

      {/* Sidebar + Content */}
      <div className="relative flex flex-1">
        {/* <Sidebaar /> */}
        <main className="flex-1 p-6">
          <UsersModal />
        </main>
      </div>

      {/* Footer */}
      {/* <Footer /> */}
    </div>
  );
};

export default WelcomePage;
