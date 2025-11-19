"use client"
import { useAuthUser } from "@/store/authStore";

const page = () => {
  const user = useAuthUser();
  console.log("Dashboard page", user);
  
  return (
    <div>page , {user?.name ?? "guest"}</div>
  )
}

export default page