import { App, Modal, Setting } from "obsidian";
import { AFFILIATION_STATUSES, CONSENT_STATUSES, NARRATIVE_STATUSES, RIGHTS_STATUSES, type ProvenanceRecord } from "./types";

type SaveHandler = (record: ProvenanceRecord) => Promise<void>;

export class ProvenanceModal extends Modal {
  private record: ProvenanceRecord;
  private readonly onSave: SaveHandler;

  constructor(app: App, record: ProvenanceRecord, onSave: SaveHandler) {
    super(app);
    this.record = { ...record, authors: [...record.authors], sources: [...record.sources] };
    this.onSave = onSave;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.addClass("narrative-provenance-modal");
    contentEl.createEl("h2", { text: "Narrative provenance" });
    contentEl.createEl("p", { text: "Record what this note is, where it came from, and what may be done with it.", cls: "setting-item-description" });

    this.addDropdown("Narrative status", "Separate verified facts, interpretation, fiction, or mixed material.", NARRATIVE_STATUSES, this.record.status, (value) => this.record.status = value as ProvenanceRecord["status"]);
    this.addText("Authors or creators", "Comma-separated names.", this.record.authors.join(", "), (value) => this.record.authors = split(value));
    this.addText("Creation date", "Use YYYY-MM-DD when known.", this.record.created, (value) => this.record.created = value.trim(), "2026-09-10");
    this.addTextArea("Sources", "One URL, citation, interview, or archive reference per line.", this.record.sources.join("\n"), (value) => this.record.sources = lines(value));
    this.addDropdown("Rights status", "A record of your current rights assessment, not legal advice.", RIGHTS_STATUSES, this.record.rights, (value) => this.record.rights = value as ProvenanceRecord["rights"]);
    this.addDropdown("Consent status", "Track permission separately from copyright or ownership.", CONSENT_STATUSES, this.record.consent, (value) => this.record.consent = value as ProvenanceRecord["consent"]);
    this.addDropdown("Affiliation", "Whether the note belongs to an independent, official, or unclear project.", AFFILIATION_STATUSES, this.record.affiliation, (value) => this.record.affiliation = value as ProvenanceRecord["affiliation"]);
    this.addTextArea("Notes", "Context, limitations, disputes, or follow-up needed.", this.record.notes, (value) => this.record.notes = value);

    new Setting(contentEl)
      .addButton((button) => button.setButtonText("Cancel").onClick(() => this.close()))
      .addButton((button) => button.setButtonText("Save provenance").setCta().onClick(() => {
        void this.saveAndClose();
      }));
  }

  onClose(): void { this.contentEl.empty(); }

  private async saveAndClose(): Promise<void> {
    this.record.reviewed = new Date().toISOString().slice(0, 10);
    await this.onSave(this.record);
    this.close();
  }

  private addText(name: string, description: string, value: string, onChange: (value: string) => void, placeholder = ""): void {
    new Setting(this.contentEl).setName(name).setDesc(description).addText((text) => text.setValue(value).setPlaceholder(placeholder).onChange(onChange));
  }

  private addTextArea(name: string, description: string, value: string, onChange: (value: string) => void): void {
    new Setting(this.contentEl).setName(name).setDesc(description).addTextArea((area) => area.setValue(value).onChange(onChange));
  }

  private addDropdown(name: string, description: string, options: readonly string[], value: string, onChange: (value: string) => void): void {
    new Setting(this.contentEl).setName(name).setDesc(description).addDropdown((dropdown) => {
      options.forEach((option) => { dropdown.addOption(option, label(option)); });
      dropdown.setValue(value).onChange(onChange);
    });
  }
}

const split = (value: string): string[] => value.split(",").map((item) => item.trim()).filter(Boolean);
const lines = (value: string): string[] => value.split("\n").map((item) => item.trim()).filter(Boolean);
const label = (value: string): string => value.replaceAll("-", " ").replace(/^./, (first) => first.toUpperCase());
