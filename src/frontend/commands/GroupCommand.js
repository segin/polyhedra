import { Command } from "./Command.js";

export class GroupCommand extends Command {
  constructor(scene, groupManager, objects) {
    super();
    this.scene = scene;
    this.groupManager = groupManager;
    this.objects = objects;
    this.group = null;
  }

  execute() {
    this.group = this.groupManager.groupObjects(this.objects);
  }

  undo() {
    this.groupManager.ungroupObjects(this.group);
  }
}
