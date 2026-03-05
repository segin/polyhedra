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
        li.setAttribute('role', 'listitem');
        const nameSpan = document.createElement('span');
        nameSpan.textContent = object.name;
        nameSpan.style.cursor = 'pointer';
        nameSpan.setAttribute('role', 'button');
        nameSpan.tabIndex = 0;
        nameSpan.addEventListener('click', () => {
          this.eventBus.publish(Events.SELECTION_CHANGE, object);
        });
        nameSpan.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.eventBus.publish(Events.SELECTION_CHANGE, object);
          }
        });
        li.appendChild(nameSpan);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.setAttribute('aria-label', `Delete ${object.name}`);
        deleteButton.setAttribute('title', 'Delete object');
        deleteButton.onclick = () => {
          this.eventBus.publish(Events.DELETE_OBJECT, object);
        };
        li.appendChild(deleteButton);

        this.uiElement.appendChild(li);
      }
    });

    if (this.uiElement.children.length === 0) {
      const emptyLi = document.createElement('li');
      emptyLi.setAttribute('role', 'listitem');
      emptyLi.textContent = 'No objects in scene';
      emptyLi.style.color = '#888';
      emptyLi.style.fontStyle = 'italic';
      emptyLi.style.textAlign = 'center';
      emptyLi.style.padding = '10px';
      this.uiElement.appendChild(emptyLi);
    }
  }
}
