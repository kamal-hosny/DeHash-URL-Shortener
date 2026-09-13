import { useLinkStore } from "@/store/linkStore";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";

export const useLinkActions = () => {
  const { removeLink } = useLinkStore();
  const { toast } = useToast();
  const router = useRouter();

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
    removeLink(linkId);
    toast({
      title: "Deleted",
      description: "Link has been deleted.",
      variant: "destructive",
    });
  };

  return {
    copyToClipboard,
    navigateToAnalytics,
    deleteLink,
  };
};
