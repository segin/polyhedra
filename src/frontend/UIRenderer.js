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
        const objectName = object.name || 'Unnamed Object';
        const nameSpan = document.createElement('span');
        nameSpan.textContent = objectName;
        nameSpan.style.cursor = 'pointer';
        nameSpan.setAttribute('role', 'button');
        nameSpan.setAttribute('tabindex', '0');
        nameSpan.setAttribute('aria-label', `Select ${objectName}`);

        const selectObject = () => {
          this.eventBus.publish(Events.SELECTION_CHANGE, object);
        };

        nameSpan.addEventListener('click', selectObject);
        nameSpan.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectObject();
          }
        });
        li.appendChild(nameSpan);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.setAttribute('aria-label', `Delete ${objectName}`);
        deleteButton.onclick = () => {
          this.eventBus.publish(Events.DELETE_OBJECT, object);
        };
        li.appendChild(deleteButton);

        this.uiElement.appendChild(li);
      }
    });
  }
}
