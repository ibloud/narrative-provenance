import { App, Modal, Setting } from "obsidian";
import type { CollaborationProjectInput } from "./collaboration";

type CreateHandler = (input: CollaborationProjectInput) => Promise<void>;

export class CollaborationProjectModal extends Modal {
  private input: CollaborationProjectInput;

  constructor(app: App, rootFolder: string, defaultAuthor: string, private readonly onCreate: CreateHandler) {
    super(app);
    this.input = { name: "", founder: defaultAuthor, rootFolder, purpose: "" };
  }

  onOpen(): void {
    this.contentEl.addClass("narrative-provenance-modal");
    this.contentEl.createEl("h2", { text: "Start guarded collaboration project" });
    this.contentEl.createEl("p", { text: "Create local-first control, private, working, review, public, and archive zones. This does not encrypt or synchronize the vault.", cls: "setting-item-description" });
    this.addText("Project name", "Used for the local project folder and charter.", this.input.name, (value) => this.input.name = value);
    this.addText("Founder or steward", "The person who owns or stewards the pre-existing project.", this.input.founder, (value) => this.input.founder = value);
    this.addText("Root folder", "All project folders will be created beneath this vault-relative path.", this.input.rootFolder, (value) => this.input.rootFolder = value);
    new Setting(this.contentEl).setName("Purpose").setDesc("Describe what the collaboration is trying to make.").addTextArea((area) => area.setValue(this.input.purpose).onChange((value) => this.input.purpose = value));
    new Setting(this.contentEl)
      .addButton((button) => button.setButtonText("Cancel").onClick(() => this.close()))
      .addButton((button) => button.setButtonText("Create guarded project").setCta().onClick(() => { void this.create(); }));
  }

  onClose(): void { this.contentEl.empty(); }

  private addText(name: string, description: string, value: string, onChange: (value: string) => void): void {
    new Setting(this.contentEl).setName(name).setDesc(description).addText((text) => text.setValue(value).onChange(onChange));
  }

  private async create(): Promise<void> {
    if (!this.input.name.trim() || !this.input.rootFolder.trim()) return;
    await this.onCreate({ ...this.input, name: this.input.name.trim(), founder: this.input.founder.trim(), rootFolder: this.input.rootFolder.trim(), purpose: this.input.purpose.trim() });
    this.close();
  }
}
