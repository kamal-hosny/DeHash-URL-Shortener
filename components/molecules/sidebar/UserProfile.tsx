"use client";

import { useAuthUser } from "@/store/authStore";
import { getInitials } from "@/utils/getInitials";

const UserProfile = () => {
  const user = useAuthUser();

  const userName = user?.name ?? "Guest User";
  const userEmail = user?.email ?? "Not logged in";

  return (
    <div className="p-4 border-t border-border">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
          {getInitials(userName)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {userName}
          </p>
          <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
