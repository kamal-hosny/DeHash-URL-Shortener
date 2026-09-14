import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchBillingInfo,
  fetchCoupons,
  upgradeSubscription,
  cancelSubscription,
  createNewCoupon,
  removeCoupon,
  applyOrRedeemCoupon,
  topUpQuota,
} from "@/lib/api/billing";

export const billingKeys = {
  all: ["billing"] as const,
  info: () => [...billingKeys.all, "info"] as const,
  coupons: () => [...billingKeys.all, "coupons"] as const,
};

export function useBillingQuery() {
  return useQuery({
    queryKey: billingKeys.info(),
    queryFn: fetchBillingInfo,
    staleTime: 30 * 1000,
  });
}

export function useCouponsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: billingKeys.coupons(),
    queryFn: fetchCoupons,
    staleTime: 30 * 1000,
    enabled: options?.enabled ?? true,
  });
}

export function useUpgradeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      plan,
      couponCode,
      billingCycle,
    }: {
      plan: "PRO" | "ENTERPRISE";
      couponCode?: string;
      billingCycle?: "monthly" | "yearly";
    }) => upgradeSubscription(plan, couponCode, billingCycle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.all });
    },
  });
}

export function useTopUpMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (points?: number) => topUpQuota(points),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.all });
    },
  });
}

export function useCancelSubscriptionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.all });
    },
  });
}

export function useCreateCouponMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createNewCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.coupons() });
    },
  });
}

export function useDeleteCouponMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.coupons() });
    },
  });
}

export function useApplyCouponMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      code,
      redeemDirectly,
      billingCycle,
    }: {
      code: string;
      redeemDirectly?: boolean;
      billingCycle?: "monthly" | "yearly";
    }) => applyOrRedeemCoupon(code, redeemDirectly, billingCycle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.all });
    },
  });
}

