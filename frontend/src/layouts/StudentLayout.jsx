import { Outlet } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

function StudentLayout() {
  return (
    <div>
      <h2>Student Portal</h2>

      <LogoutButton />

      <Outlet />
    </div>
  );
}

export default StudentLayout;