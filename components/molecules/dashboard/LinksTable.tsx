import { Link as LinkType } from "@/store/linkStore";
import {
  Copy,
  ExternalLink,
  Trash2,
  BarChart2,
  QrCode,
  Link2,
  MoreHorizontal,
  Search,
} from "@/assets/icons";
import { Button } from "@/components/ui/button";
import Link from "@/components/ui/Link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLinkActions } from "@/hooks/useLinkActions";
import { useState } from "react";
import CreateQrModal from "./modals/CreateQrModal";

interface LinksTableProps {
  links: LinkType[];
  showEmptyState?: boolean;
  onClearFilters?: () => void;
}

const LinksTable = ({
  links,
  showEmptyState = false,
  onClearFilters,
}: LinksTableProps) => {
  const { copyToClipboard, navigateToAnalytics, deleteLink } = useLinkActions();
  const [selectedLinkForQr, setSelectedLinkForQr] = useState<LinkType | null>(
    null
  );

  return (
    <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm overflow-hidden">
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
            {links.length > 0 ? (
              links.map((link) => (
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
                          <button
                            onClick={() => navigateToAnalytics(link.id)}
                            className="font-medium text-foreground hover:underline hover:text-primary transition-colors text-left"
                          >
                            /{link.shortCode}
                          </button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() =>
                              copyToClipboard(
                                `${window.location.origin}/r/${link.shortCode}`
                              )
                            }
                            className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity h-auto w-auto p-0"
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
                  <td
                    className="px-6 py-4 text-center text-muted-foreground"
                    suppressHydrationWarning
                  >
                    {new Date(link.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Desktop Actions */}
                      <div className="hidden md:flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="p-2"
                          title="Analytics"
                          onClick={() => navigateToAnalytics(link.id)}
                        >
                          <BarChart2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setSelectedLinkForQr(link)}
                          size="icon-sm"
                          className="p-2"
                          title="QR Code"
                        >
                          <QrCode size={16} />
                        </Button>
                        <div className="w-px h-4 bg-border mx-1" />
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => deleteLink(link.id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>

                      {/* Mobile Actions (Dropdown) */}
                      <div className="md:hidden">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                copyToClipboard(
                                  `${window.location.origin}/r/${link.shortCode}`
                                )
                              }
                            >
                              <Copy className="mr-2 h-4 w-4" /> Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setSelectedLinkForQr(link)}
                            >
                              <QrCode className="mr-2 h-4 w-4" /> QR Code
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigateToAnalytics(link.id)}
                            >
                              <BarChart2 className="mr-2 h-4 w-4" /> Analytics
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => deleteLink(link.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                    <Search className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-medium text-foreground">
                    No links found
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {showEmptyState
                      ? "Try adjusting your search or filters."
                      : "Get started by creating your first short link."}
                  </p>
                  {showEmptyState && onClearFilters && (
                    <Button
                      variant="link"
                      onClick={onClearFilters}
                      className="mt-2"
                    >
                      Clear filters
                    </Button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CreateQrModal
        isOpen={!!selectedLinkForQr}
        onClose={() => setSelectedLinkForQr(null)}
        url={
          selectedLinkForQr
            ? `${window.location.origin}/r/${selectedLinkForQr.shortCode}`
            : undefined
        }
      />
    </div>
  );
};

export default LinksTable;
