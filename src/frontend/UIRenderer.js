import { Events } from './constants.js';

export class UIRenderer {
  constructor(uiElement, eventBus) {
    this.uiElement = uiElement;
    this.eventBus = eventBus;

    this.eventBus.subscribe(Events.SCENE_GRAPH_NEEDS_UPDATE, (scene) => this.render(scene));
  }

  render(scene) {
    this.uiElement.innerHTML = '';
    scene.children.forEach((object) => {
      if (object.isMesh || object.isLight) {
        const li = document.createElement('li');
        const nameSpan = document.createElement('span');
        nameSpan.textContent = object.name;
        nameSpan.style.cursor = 'pointer';
        nameSpan.addEventListener('click', () => {
          this.eventBus.publish(Events.SELECTION_CHANGE, object);
        });
        li.appendChild(nameSpan);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.setAttribute('aria-label', `Delete ${object.name}`);
        deleteButton.title = `Delete ${object.name}`;
        deleteButton.onclick = () => {
          this.eventBus.publish(Events.DELETE_OBJECT, object);
        };
        li.appendChild(deleteButton);

        this.uiElement.appendChild(li);
      }
    });
  }
}
