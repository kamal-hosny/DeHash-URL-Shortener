// store/authStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { User as SessionUser } from "@/types";


type AuthState = {
  user: SessionUser | null;
  status: "idle" | "loading" | "authenticated" | "error";
  error: string | null;
};

// AuthEvent = all possible auth actions:
// HYDRATE: load saved user (null or user)
// START_AUTH: start loading
// RESOLVE_AUTH: login success (set user)
// FAIL_AUTH: login failed (set error)
// SIGN_OUT: logout (clear user)

type AuthEvent =
  | { type: "HYDRATE"; payload: SessionUser | null }
  | { type: "START_AUTH" }
  | { type: "RESOLVE_AUTH"; payload: SessionUser }
  | { type: "FAIL_AUTH"; payload: string }
  | { type: "SIGN_OUT" };


type AuthStore = AuthState & {
  dispatch: (event: AuthEvent) => void;
};

const createAuthStore = () =>
  create<AuthStore>()(
    devtools(
      persist(
        immer((set) => ({
          user: null,
          status: "idle",
          error: null,
          dispatch: (event) =>
            set((state) => {
              switch (event.type) {
                case "HYDRATE": {
                  state.user = event.payload;
                  state.status = event.payload ? "authenticated" : "idle";
                  state.error = null;
                  break;
                }
                case "START_AUTH": {
                  state.status = "loading";
                  state.error = null;
                  break;
                }
                case "RESOLVE_AUTH": {
                  state.user = event.payload;
                  state.status = "authenticated";
                  state.error = null;
                  break;
                }
                case "FAIL_AUTH": {
                  state.status = "error";
                  state.error = event.payload;
                  break;
                }
                case "SIGN_OUT": {
                  state.user = null;
                  state.status = "idle";
                  state.error = null;
                  break;
                }
                default:
                  break;
              }
            }),
        })),
        { name: "auth-store" }
      ),
      { name: "AuthStore" }
    )
  );

/* Instance */
const useAuthBaseStore = createAuthStore();

/* Custom hooks  */
const selectUser = (state: AuthStore) => state.user;
const selectStatus = (state: AuthStore) => state.status;
const selectError = (state: AuthStore) => state.error;
const selectDispatch = (state: AuthStore) => state.dispatch;

export const useAuthUser = () => useAuthBaseStore(selectUser);
export const useAuthStatus = () => useAuthBaseStore(selectStatus);
export const useAuthError = () => useAuthBaseStore(selectError);
export const useAuthDispatch = () => useAuthBaseStore(selectDispatch);
