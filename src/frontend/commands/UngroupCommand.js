import { Command } from "./Command.js";

export class UngroupCommand extends Command {
  constructor(scene, groupManager, group) {
    super();
    this.scene = scene;
    this.groupManager = groupManager;
    this.group = group;
    this.objects = null;
  }

  execute() {
    this.objects = this.groupManager.ungroupObjects(this.group);
  }

  undo() {
    this.group = this.groupManager.groupObjects(this.objects);
  }
}
