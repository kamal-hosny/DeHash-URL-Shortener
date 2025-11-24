import { Plus } from "@/assets/icons";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  userName?: string;
  onCreateClick: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName,
  onCreateClick,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          {getGreeting()}, {userName || "Guest"} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your links today.
        </p>
      </div>

      <Button
        onClick={onCreateClick}
        size="lg"
        className="shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        <Plus size={20} />
        Create New Link
      </Button>
    </div>
  );
};

export default DashboardHeader;
