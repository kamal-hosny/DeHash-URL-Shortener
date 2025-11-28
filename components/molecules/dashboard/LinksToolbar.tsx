import { Search, Filter, ArrowUpDown } from "@/assets/icons";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LinksToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

const LinksToolbar = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
}: LinksToolbarProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search links..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              <SelectValue placeholder="Sort by" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Date: Newest</SelectItem>
            <SelectItem value="date-asc">Date: Oldest</SelectItem>
            <SelectItem value="clicks-desc">Clicks: High to Low</SelectItem>
            <SelectItem value="clicks-asc">Clicks: Low to High</SelectItem>
            <SelectItem value="alpha-asc">Name: A-Z</SelectItem>
            <SelectItem value="alpha-desc">Name: Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default LinksToolbar;
