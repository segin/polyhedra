import { Command } from "./Command.js";

export class AddObjectCommand extends Command {
  constructor(scene, object) {
    super();
    this.scene = scene;
    this.object = object;
  }

  execute() {
    this.scene.add(this.object);
  }

  undo() {
    this.scene.remove(this.object);
  }
}
