import { Command } from "./Command.js";

export class TransformObjectCommand extends Command {
  constructor(object, newTransform, oldTransform) {
    super();
    this.object = object;
    this.newTransform = {
      position: newTransform.position.clone(),
      rotation: newTransform.rotation.clone(),
      scale: newTransform.scale.clone(),
    };
    this.oldTransform = {
      position: oldTransform.position.clone(),
      rotation: oldTransform.rotation.clone(),
      scale: oldTransform.scale.clone(),
    };
  }

  execute() {
    this.object.position.copy(this.newTransform.position);
    this.object.rotation.copy(this.newTransform.rotation);
    this.object.scale.copy(this.newTransform.scale);
  }

  undo() {
    this.object.position.copy(this.oldTransform.position);
    this.object.rotation.copy(this.oldTransform.rotation);
    this.object.scale.copy(this.oldTransform.scale);
  }
}
