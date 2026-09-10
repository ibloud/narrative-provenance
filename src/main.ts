import { Notice, Plugin, PluginSettingTab, Setting, TFile, WorkspaceLeaf } from "obsidian";
import { ProvenanceModal } from "./modal";
import { auditRecord, recordFromFrontmatter, writeRecordToFrontmatter } from "./provenance";
import type { AuditResult, ProvenanceRecord, ProvenanceSettings } from "./types";
import { PROVENANCE_VIEW, ProvenanceView } from "./view";

const DEFAULT_SETTINGS: ProvenanceSettings = { defaultAuthor: "", warnBeforeOverwrite: true };

export default class NarrativeProvenancePlugin extends Plugin {
  settings: ProvenanceSettings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    await this.loadSettings();
    this.registerView(PROVENANCE_VIEW, (leaf) => new ProvenanceView(leaf, this));
    this.addRibbonIcon("file-check-2", "Review narrative provenance", () => this.activateView());
    this.addCommand({ id: "edit-current-note-provenance", name: "Edit current note provenance", callback: () => this.openEditor() });
    this.addCommand({ id: "audit-current-note-provenance", name: "Audit current note provenance", callback: () => this.showAudit() });
    this.addCommand({ id: "open-provenance-sidebar", name: "Open provenance sidebar", callback: () => this.activateView() });
    this.addSettingTab(new ProvenanceSettingTab(this.app, this));
    this.app.workspace.onLayoutReady(() => {
      this.registerEvent(this.app.workspace.on("active-leaf-change", () => this.refreshViews()));
      this.registerEvent(this.app.metadataCache.on("changed", (file) => {
        if (file === this.app.workspace.getActiveFile()) this.refreshViews();
      }));
    });
  }

  onunload(): void { this.app.workspace.detachLeavesOfType(PROVENANCE_VIEW); }

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

  async loadSettings(): Promise<void> { this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<ProvenanceSettings> | null); }
  async saveSettings(): Promise<void> { await this.saveData(this.settings); }
}

class ProvenanceSettingTab extends PluginSettingTab {
  constructor(app: NarrativeProvenancePlugin["app"], private readonly plugin: NarrativeProvenancePlugin) { super(app, plugin); }
  display(): void {
    this.containerEl.empty();
    new Setting(this.containerEl).setName("Default author").setDesc("Pre-fill new provenance records with this creator name.").addText((text) => text.setValue(this.plugin.settings.defaultAuthor).onChange(async (value) => { this.plugin.settings.defaultAuthor = value.trim(); await this.plugin.saveSettings(); }));
    new Setting(this.containerEl).setName("Overwrite warning").setDesc("Reserved for the guided import workflow in a future release.").addToggle((toggle) => toggle.setValue(this.plugin.settings.warnBeforeOverwrite).onChange(async (value) => { this.plugin.settings.warnBeforeOverwrite = value; await this.plugin.saveSettings(); }));
  }
}
