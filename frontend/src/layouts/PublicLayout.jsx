// import PublicNavbar from "../components/navigation/PublicNavbar";

// const PublicLayout = ({ children }) => {
//   return (
//     <div className="min-h-screen flex flex-col bg-gray-50">
//       {/* Public Navigation */}
//       <PublicNavbar />

//       {/* Page Content */}
//       <main className="flex-1">{children}</main>

//       {/* Footer will be added later */}
//     </div>
//   );
// };

// export default PublicLayout;

import { Outlet } from "react-router-dom";
import PublicNavbar from "../components/navigation/PublicNavbar";
import PublicFooter from "../components/navigation/PublicFooter";

function PublicLayout() {
  return (
    <div>
      <PublicNavbar />

      <main>
        <Outlet />
      </main>

      <PublicFooter />
    </div>
  );
}

export default PublicLayout;
