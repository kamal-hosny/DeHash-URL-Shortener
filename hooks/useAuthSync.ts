import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAuthDispatch } from "@/store/authStore";
import type { User as SessionUser } from "@/types";

export const useAuthSync = () => {
    const { data: session, status: sessionStatus } = useSession();
    const dispatch = useAuthDispatch();

    useEffect(() => {
        if (sessionStatus === "loading") return;

        if (sessionStatus === "authenticated" && session?.user) {
            dispatch({ type: "HYDRATE", payload: session.user as SessionUser });
        } else if (sessionStatus === "unauthenticated") {
            dispatch({ type: "HYDRATE", payload: null });
        }
    }, [dispatch, session, sessionStatus]);

    return { sessionStatus };
};
