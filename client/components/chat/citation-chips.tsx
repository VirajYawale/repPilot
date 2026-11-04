"use client";

import { FileText } from "lucide-react";
import type { Citation, Repository } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

export function CitationChips({
  repo,
  citations,
}: {
  repo: Repository;
  citations: Citation[];
}) {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-2">
      <span className="text-xs font-medium text-muted-foreground">Sources:</span>
      {citations.map((citation, idx) => {
        const lineText =
          citation.startLine && citation.endLine
            ? `#L${citation.startLine}-L${citation.endLine}`
            : citation.startLine
            ? `#L${citation.startLine}`
            : "";

        const label = `${citation.filePath}${lineText}`;
        const href = repo.htmlUrl
          ? `${repo.htmlUrl}/blob/${repo.defaultBranch || "main"}/${citation.filePath}${lineText}`
          : undefined;

        return href ? (
          <a
            key={idx}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <Badge
              variant="outline"
              className="gap-1 text-xs hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
            >
              <FileText className="size-3 text-muted-foreground" />
              <span>{label}</span>
            </Badge>
          </a>
        ) : (
          <Badge key={idx} variant="outline" className="gap-1 text-xs">
            <FileText className="size-3 text-muted-foreground" />
            <span>{label}</span>
          </Badge>
        );
      })}
    </div>
  );
}
