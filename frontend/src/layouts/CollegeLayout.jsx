import { Outlet } from "react-router-dom";

function CollegeLayout() {
  return (
    <div>
      <h2>College Portal</h2>
      <Outlet />
    </div>
  );
}

export default CollegeLayout;