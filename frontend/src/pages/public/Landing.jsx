import { useEffect } from "react";
import { supabase } from "../../services/supabase";

function Landing() {
  useEffect(() => {
    async function testSupabaseConnection() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Supabase connection error:", error.message);
      } else {
        console.log("Supabase connected successfully:", data);
      }
    }

    testSupabaseConnection();
  }, []);

  return <h1>SkillBridge Landing Page</h1>;
}

export default Landing;