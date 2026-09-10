import { ItemView, WorkspaceLeaf } from "obsidian";
import type NarrativeProvenancePlugin from "./main";

export const PROVENANCE_VIEW = "narrative-provenance-view";

export class ProvenanceView extends ItemView {
  constructor(leaf: WorkspaceLeaf, private readonly plugin: NarrativeProvenancePlugin) { super(leaf); }
  getViewType(): string { return PROVENANCE_VIEW; }
  getDisplayText(): string { return "Narrative provenance"; }
  getIcon(): string { return "file-check-2"; }

  async onOpen(): Promise<void> { await this.render(); }

  async render(): Promise<void> {
    const container = this.contentEl;
    container.empty();
    container.addClass("narrative-provenance-view");
    container.createEl("h3", { text: "Narrative provenance" });
    const file = this.app.workspace.getActiveFile();
    if (!file) {
      container.createEl("p", { text: "Open a Markdown note to review its provenance.", cls: "setting-item-description" });
      return;
    }
    container.createEl("div", { text: file.basename, cls: "narrative-provenance-file" });
    const record = this.plugin.readRecord(file);
    const audit = this.plugin.audit(record);
    const meter = container.createDiv({ cls: "narrative-provenance-meter" });
    meter.createDiv({ cls: "narrative-provenance-meter-fill" }).setCssProps({ "--provenance-score": `${audit.score}%` });
    container.createEl("p", { text: `${audit.score}% complete` });
    if (audit.missing.length) {
      container.createEl("h4", { text: "Needs attention" });
      const list = container.createEl("ul");
      audit.missing.forEach((item) => list.createEl("li", { text: item }));
    } else {
      container.createEl("p", { text: "All required provenance fields are recorded.", cls: "narrative-provenance-success" });
    }
    audit.cautions.forEach((caution) => container.createDiv({ text: caution, cls: "narrative-provenance-caution" }));
    const button = container.createEl("button", { text: "Edit provenance", cls: "mod-cta" });
    button.addEventListener("click", () => this.plugin.openEditor());
  }
}
