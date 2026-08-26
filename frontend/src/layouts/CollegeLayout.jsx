import { Outlet } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

function CollegeLayout() {
  return (
    <div>
      <h2>College Portal</h2>

      <LogoutButton />

      <Outlet />
    </div>
  );
}

export default CollegeLayout;