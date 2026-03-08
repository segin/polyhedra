import { Command } from "./Command.js";

export class RemoveObjectCommand extends Command {
  constructor(scene, object) {
    super();
    this.scene = scene;
    this.object = object;
  }

  execute() {
    this.scene.remove(this.object);
  }

  undo() {
    this.scene.add(this.object);
  }
}
