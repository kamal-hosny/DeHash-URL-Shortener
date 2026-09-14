import { useLinkStore } from "@/store/linkStore";
import { useLinksQuery } from "@/hooks/queries/useLinksQuery";
import { Button } from "@/components/ui/button";
import Link from "@/components/ui/Link";
import LinksTable from "./LinksTable";

const LinkList = () => {
  const { links: localLinks } = useLinkStore();
  const { data: serverLinks } = useLinksQuery();
  const links = serverLinks || localLinks;

  return (
    <LinksTable
      links={links}
      emptyTitle="No links created"
      header={
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Recent Links</h2>
            <p className="text-sm text-muted-foreground">Manage your latest short links.</p>
          </div>
          <Link href="/dashboard/links">
            <Button variant="link" className="text-sm font-medium">View All</Button>
          </Link>
        </div>
      }
    />
  );
};

export default LinkList;
