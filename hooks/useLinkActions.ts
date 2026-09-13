import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import { useDeleteLinkMutation, usePrefetchLink } from "@/hooks/queries/useLinksQuery";

export const useLinkActions = () => {
  const { toast } = useToast();
  const router = useRouter();
  const prefetchLink = usePrefetchLink();
  const deleteMutation = useDeleteLinkMutation();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard.",
    });
  };

  const navigateToAnalytics = (linkId: string) => {
    router.push(`/dashboard/links/${linkId}`);
  };

  const deleteLink = (linkId: string) => {
    deleteMutation.mutate(linkId, {
      onSuccess: () => {
        toast({
          title: "Deleted",
          description: "Link has been deleted.",
          variant: "destructive",
        });
      },
      onError: (err: Error) => {
        toast({
          title: "Error",
          description: err?.message || "Failed to delete link.",
          variant: "destructive",
        });
      },
    });
  };

  return {
    copyToClipboard,
    navigateToAnalytics,
    deleteLink,
    prefetchLink,
    isDeleting: deleteMutation.isPending,
  };
};
