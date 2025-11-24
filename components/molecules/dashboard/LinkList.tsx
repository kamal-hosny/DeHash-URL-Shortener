import { useLinkStore } from "@/store/linkStore";
import {
  Copy,
  ExternalLink,
  Trash2,
  BarChart2,
  QrCode,
  Link2,
} from "@/assets/icons";
import { Button } from "@/components/ui/button";
import Link from "@/components/atoms/link";
import { useState } from "react";
import CreateQrModal from "./modals/CreateQrModal";

const LinkList = () => {
  const { links, removeLink } = useLinkStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Recent Links
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your latest short links.
          </p>
        </div>
        <Button variant="link" className="text-sm font-medium">
          View All
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Short Link
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Original URL
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground text-center">
                Clicks
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground text-center">
                Status
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground text-center">
                Date
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {links.map((link) => (
              <tr
                key={link.id}
                className="group hover:bg-accent/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-md text-muted-foreground">
                      <Link2 size={16} className="rotate-45" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          /{link.shortCode}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() =>
                            copyToClipboard(
                              `${window.location.origin}/r/${link.shortCode}`
                            )
                          }
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-auto w-auto p-0"
                          title="Copy"
                        >
                          <Copy size={12} />
                        </Button>
                      </div>
                      <Link
                        href={`/r/${link.shortCode}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-0.5"
                      >
                        visit link <ExternalLink size={10} />
                      </Link>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 max-w-[200px]">
                  <p
                    className="truncate text-muted-foreground"
                    title={link.originalUrl}
                  >
                    {link.originalUrl}
                  </p>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="font-medium text-foreground">
                    {link.clicks.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`
                    inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                    ${
                      link.isActive
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }
                  `}
                  >
                    {link.isActive ? "Active" : "Archived"}
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-muted-foreground">
                  {new Date(link.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon-sm" className="p-2">
                      <BarChart2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setIsCreateModalOpen(true)}
                      size="icon-sm"
                      className="p-2"
                    >
                      <QrCode size={16} />
                    </Button>
                    <div className="w-px h-4 bg-border mx-1" />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeLink(link.id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {links.length === 0 && (
        <div className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
            <Link2 className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-medium text-foreground">
            No links created
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by creating your first short link.
          </p>
        </div>
      )}
      <CreateQrModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default LinkList;
