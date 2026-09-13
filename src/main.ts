import { Notice, normalizePath, Plugin, PluginSettingTab, TFile, WorkspaceLeaf, type SettingDefinitionItem } from "obsidian";
import { CollaborationProjectModal } from "./collaboration-modal";
import { auditForSharing, buildCollaborationProject, type ProjectFile } from "./collaboration";
import { ProvenanceModal } from "./modal";
import { auditRecord, recordFromFrontmatter, writeRecordToFrontmatter } from "./provenance";
import type { AuditResult, ProvenanceRecord, ProvenanceSettings } from "./types";
import { PROVENANCE_VIEW, ProvenanceView } from "./view";

const DEFAULT_SETTINGS: ProvenanceSettings = { defaultAuthor: "", warnBeforeOverwrite: true, collaborationRoot: "Collaborations" };

export default class NarrativeProvenancePlugin extends Plugin {
  settings: ProvenanceSettings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    await this.loadSettings();
    this.registerView(PROVENANCE_VIEW, (leaf) => new ProvenanceView(leaf, this));
    this.addRibbonIcon("file-check-2", "Review narrative provenance", () => { void this.activateView(); });
    this.addCommand({ id: "edit-current-note-provenance", name: "Edit current note provenance", callback: () => this.openEditor() });
    this.addCommand({ id: "audit-current-note-provenance", name: "Audit current note provenance", callback: () => this.showAudit() });
    this.addCommand({ id: "open-provenance-sidebar", name: "Open provenance sidebar", callback: () => { void this.activateView(); } });
    this.addCommand({ id: "start-guarded-collaboration-project", name: "Start guarded collaboration project", callback: () => this.openCollaborationProject() });
    this.addCommand({ id: "audit-current-note-for-sharing", name: "Audit current note for sharing", callback: () => { void this.showShareAudit(); } });
    this.addSettingTab(new ProvenanceSettingTab(this.app, this));
    this.app.workspace.onLayoutReady(() => {
      this.registerEvent(this.app.workspace.on("active-leaf-change", () => this.refreshViews()));
      this.registerEvent(this.app.metadataCache.on("changed", (file) => {
        if (file === this.app.workspace.getActiveFile()) void this.refreshViews();
      }));
    });
  }

  readRecord(file: TFile): ProvenanceRecord {
    return recordFromFrontmatter(this.app.metadataCache.getFileCache(file)?.frontmatter, this.settings.defaultAuthor);
  }

  audit(record: ProvenanceRecord): AuditResult { return auditRecord(record); }

  openEditor(): void {
    const file = this.app.workspace.getActiveFile();
    if (!file || file.extension !== "md") { new Notice("Open a Markdown note first."); return; }
    new ProvenanceModal(this.app, this.readRecord(file), async (record) => {
      await this.app.fileManager.processFrontMatter(file, (frontmatter) => writeRecordToFrontmatter(frontmatter, record));
      new Notice("Narrative provenance saved.");
      await this.refreshViews();
    }).open();
  }

  showAudit(): void {
    const file = this.app.workspace.getActiveFile();
    if (!file || file.extension !== "md") { new Notice("Open a Markdown note first."); return; }
    const result = this.audit(this.readRecord(file));
    const detail = result.missing.length ? ` Missing: ${result.missing.join(", ")}.` : " All required fields are recorded.";
    new Notice(`Provenance is ${result.score}% complete.${detail}`, 8000);
  }

  openCollaborationProject(): void {
    new CollaborationProjectModal(this.app, this.settings.collaborationRoot, this.settings.defaultAuthor, async (input) => {
      const files = buildCollaborationProject(input, new Date().toISOString().slice(0, 10));
      for (const file of files) await this.createProjectFile(file);
      new Notice(`Guarded collaboration project created in ${input.rootFolder}.`, 7000);
    }).open();
  }

  async showShareAudit(): Promise<void> {
    const file = this.app.workspace.getActiveFile();
    if (!file || file.extension !== "md") { new Notice("Open a Markdown note first."); return; }
    const content = await this.app.vault.cachedRead(file);
    const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
    const result = auditForSharing(file.path, content, this.readRecord(file), frontmatter);
    const details = [...result.blockers.map((item) => `BLOCK: ${item}`), ...result.cautions.map((item) => `CHECK: ${item}`)];
    const message = result.allowed ? "Share audit passed. Manual review is still required." : "Share audit blocked.";
    new Notice(`${message} Zone: ${result.zone}.${details.length ? ` ${details.join(" ")}` : ""}`, 12000);
  }

  private async createProjectFile(file: ProjectFile): Promise<void> {
    const path = normalizePath(file.path);
    const parts = path.split("/").slice(0, -1);
    let folder = "";
    for (const part of parts) {
      folder = folder ? `${folder}/${part}` : part;
      if (!this.app.vault.getAbstractFileByPath(folder)) await this.app.vault.createFolder(folder);
    }
    if (this.app.vault.getAbstractFileByPath(path)) throw new Error(`File already exists: ${path}`);
    await this.app.vault.create(path, file.content);
  }

  async activateView(): Promise<void> {
    let leaf: WorkspaceLeaf | null = this.app.workspace.getLeavesOfType(PROVENANCE_VIEW)[0] ?? null;
    if (!leaf) {
      leaf = this.app.workspace.getRightLeaf(false);
      if (!leaf) return;
      await leaf.setViewState({ type: PROVENANCE_VIEW, active: true });
    }
    await this.app.workspace.revealLeaf(leaf);
  }

  async refreshViews(): Promise<void> {
    for (const leaf of this.app.workspace.getLeavesOfType(PROVENANCE_VIEW)) {
      const view = leaf.view;
      if (view instanceof ProvenanceView) await view.render();
    }
  }

  async loadSettings(): Promise<void> {
    const data: unknown = await this.loadData();
    this.settings = { ...DEFAULT_SETTINGS, ...(isSettings(data) ? data : {}) };
  }
  async saveSettings(): Promise<void> { await this.saveData(this.settings); }
}

function isSettings(value: unknown): value is Partial<ProvenanceSettings> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

class ProvenanceSettingTab extends PluginSettingTab {
  constructor(app: NarrativeProvenancePlugin["app"], private readonly plugin: NarrativeProvenancePlugin) { super(app, plugin); }

  getSettingDefinitions(): SettingDefinitionItem[] {
    return [
      {
        name: "Default author",
        desc: "Pre-fill new provenance records with this creator name.",
        control: { type: "text", key: "defaultAuthor", defaultValue: "" },
      },
      {
        name: "Overwrite warning",
        desc: "Reserved for the guided import workflow in a future release.",
        control: { type: "toggle", key: "warnBeforeOverwrite", defaultValue: true },
      },
      {
        name: "Collaboration root folder",
        desc: "Vault-relative folder where guarded collaboration projects are created.",
        control: { type: "text", key: "collaborationRoot", defaultValue: "Collaborations" },
      },
    ];
  }

  async setControlValue(key: string, value: unknown): Promise<void> {
    if (key === "defaultAuthor" && typeof value === "string") {
      this.plugin.settings.defaultAuthor = value.trim();
    } else if (key === "warnBeforeOverwrite" && typeof value === "boolean") {
      this.plugin.settings.warnBeforeOverwrite = value;
    } else if (key === "collaborationRoot" && typeof value === "string" && value.trim()) {
      this.plugin.settings.collaborationRoot = value.trim();
    } else {
      return;
    }
    await this.plugin.saveSettings();
  }
}
