import { Outlet } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

function RecruiterLayout() {
  return (
    <div>
      <h2>Recruiter Portal</h2>

      <LogoutButton />

      <Outlet />
    </div>
  );
}

export default RecruiterLayout;