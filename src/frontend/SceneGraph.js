import { Events } from "./constants.js";

export class SceneGraph {
  constructor(scene, eventBus) {
    this.scene = scene;
    this.eventBus = eventBus;

    this.eventBus.subscribe(Events.OBJECT_ADDED, () => this.update());
    this.eventBus.subscribe(Events.OBJECT_REMOVED, () => this.update());
    this.eventBus.subscribe(Events.GROUP_ADDED, () => this.update());
    this.eventBus.subscribe(Events.GROUP_REMOVED, () => this.update());
  }

  update() {
    this.eventBus.publish(Events.SCENE_GRAPH_NEEDS_UPDATE, this.scene);
  }
}
