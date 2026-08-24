import { Outlet } from "react-router-dom";

function RecruiterLayout() {
  return (
    <div>
      <h2>Recruiter Portal</h2>
      <Outlet />
    </div>
  );
}

export default RecruiterLayout;