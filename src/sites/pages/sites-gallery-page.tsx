import { Globe, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { SITE_PRESETS, type SitePreset } from "../types";
import { useSiteProjects } from "../store";
import {
  WorkbenchPage,
  WorkbenchSectionHeader,
  WorkbenchStatusPill,
  WorkbenchTopbar,
} from "@/components/workbench-shell";

export function SitesGalleryPage() {
  const { projects, create } = useSiteProjects();
  const navigate = useNavigate();

  function handleCreate(preset: SitePreset) {
    const project = create(preset);
    navigate(`/sites/${project.id}`);
  }

  return (
    <WorkbenchPage>
      <WorkbenchTopbar
        backTo="/"
        icon={Globe}
        context="Creation Workspace"
        title="Site Studio"
        subtitle="Project library and scaffold presets"
        badge={
          <WorkbenchStatusPill>
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </WorkbenchStatusPill>
        }
      />

      <div className="mx-auto max-w-6xl px-6 py-8 max-sm:px-3">
        <WorkbenchSectionHeader
          title="Create"
          description="Preset scaffolds"
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(Object.entries(SITE_PRESETS) as Array<[SitePreset, (typeof SITE_PRESETS)[SitePreset]]>).map(
            ([preset, definition]) => (
              <button
                key={preset}
                onClick={() => handleCreate(preset)}
                className="workbench-card min-h-44 p-5 text-left"
              >
                <div className="flex items-center justify-between">
                  <WorkbenchStatusPill tone="accent">
                    {definition.label}
                  </WorkbenchStatusPill>
                  <Plus size={16} className="text-muted" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-text-strong">
                  {definition.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {definition.description}
                </p>
                <div className="mt-4 text-[11px] font-semibold uppercase text-muted/70">
                  {definition.template}
                </div>
              </button>
            ),
          )}
        </div>

        {projects.length > 0 && (
          <div className="mt-10">
            <WorkbenchSectionHeader
              title="Recent Sessions"
              description="Scaffolded site workspaces"
            />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/sites/${project.id}`}
                  className="workbench-card p-4"
                >
                  <div className="text-sm font-medium text-text-strong">{project.title}</div>
                  <div className="mt-1 text-xs text-muted">
                    {project.template} / {project.siteKind}
                  </div>
                  <div className="mt-3 text-[11px] text-muted/70">
                    Updated {new Date(project.updatedAt).toLocaleString()}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </WorkbenchPage>
  );
}
