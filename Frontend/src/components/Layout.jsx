import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileBottomNav from "./MobileBottomNav";

const Layout = ({ children, showSidebar = false }) => {
  return (
    <div className="min-h-screen bg-base-100">
      <div className="flex min-h-screen">
        {showSidebar && <Sidebar />}

        <div className="flex-1 flex flex-col">
          <Navbar showSidebar={showSidebar} />

          <main className={`flex-1 overflow-y-auto bg-base-100 ${showSidebar ? "pb-16 lg:pb-0" : ""}`}>
            {children}
          </main>
        </div>
      </div>
      {showSidebar && <MobileBottomNav />}
    </div>
  );
};
export default Layout;