
describe('Scene Graph Diff Benchmark', () => {
    let appMock;

    beforeEach(() => {
        document.body.innerHTML = '<ul id="objects-list"></ul>';

        // Helper to simulate the app structure
        appMock = {
            objectsList: document.getElementById('objects-list'),
            objects: [],
            selectedObject: null,
            sceneGraphItemMap: new Map(), // Store mapping from UUID to DOM Element

            // Current implementation (DocumentFragment rebuild)
            updateSceneGraph_Current: function() {
                if (!this.objectsList) return;

                const fragment = document.createDocumentFragment();

                if (this.objects.length === 0) {
                  const li = document.createElement('li');
                  li.textContent = 'No objects in scene';
                  fragment.appendChild(li);
                } else {
                  this.objects.forEach((obj, idx) => {
                    const li = document.createElement('li');
                    li.textContent = obj.name || `Object ${idx + 1}`;
                    fragment.appendChild(li);
                  });
                }

                this.objectsList.innerHTML = '';
                this.objectsList.appendChild(fragment);
            },

            // New implementation (Diffing)
            updateSceneGraph_Diff: function() {
                if (!this.objectsList) return;

                // Handle Empty List Case
                if (this.objects.length === 0) {
                    this.objectsList.innerHTML = '';
                    const li = document.createElement('li');
                    li.textContent = 'No objects in scene';
                    this.objectsList.appendChild(li);
                    this.sceneGraphItemMap.clear();
                    return;
                }

                // Clear "No objects" if present
                if (this.objectsList.children.length > 0 &&
                    this.objectsList.children[0].textContent === 'No objects in scene') {
                     this.objectsList.innerHTML = '';
                }

                let currentDom = this.objectsList.firstElementChild;

                this.objects.forEach((obj, idx) => {
                    let li = this.sceneGraphItemMap.get(obj.uuid);

                    // Check if stale (bound to old object instance)
                    // @ts-ignore
                    if (li && li._boundObject !== obj) {
                        li.remove(); // This might affect currentDom if it was currentDom!
                        if (li === currentDom) {
                            currentDom = currentDom.nextElementSibling;
                        }
                        this.sceneGraphItemMap.delete(obj.uuid);
                        li = undefined;
                    }

                    if (!li) {
                        li = document.createElement('li');
                        li.id = `object-${obj.uuid}`;
                        // @ts-ignore
                        li._boundObject = obj;

                        // Content (simplified for bench)
                        const nameSpan = document.createElement('span');
                        nameSpan.className = 'object-name';
                        li.appendChild(nameSpan);
                        // @ts-ignore
                        li._nameSpan = nameSpan; // Cache reference

                        this.sceneGraphItemMap.set(obj.uuid, li);
                    }

                    // Update Content using cached reference
                    // @ts-ignore
                    const nameSpan = li._nameSpan;
                    const expectedText = obj.name || `Object ${idx + 1}`;
                    if (nameSpan.textContent !== expectedText) {
                         nameSpan.textContent = expectedText;
                    }

                    // Placement
                    if (currentDom === li) {
                        // Already in correct place
                        currentDom = currentDom.nextElementSibling;
                    } else {
                        // Insert before currentDom (moves if already elsewhere)
                        this.objectsList.insertBefore(li, currentDom);
                        // currentDom remains the same (it was pushed back)
                    }
                });

                // Remove remaining (stale) nodes
                while (currentDom) {
                    const next = currentDom.nextElementSibling;
                    currentDom.remove();
                    currentDom = next;
                }

                // Cleanup Map
                if (this.sceneGraphItemMap.size > this.objects.length) {
                     const activeUuids = new Set(this.objects.map(o => o.uuid));
                     for (const uuid of this.sceneGraphItemMap.keys()) {
                         if (!activeUuids.has(uuid)) {
                             this.sceneGraphItemMap.delete(uuid);
                         }
                     }
                }
            }
        };
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('benchmarks Current (Rebuild) vs Diffing', () => {
        const objectCount = 5000;
        const objects = [];
        for (let i = 0; i < objectCount; i++) {
            objects.push({
                uuid: `uuid-${i}`,
                name: `Object ${i}`,
                visible: true
            });
        }

        appMock.objects = [...objects];

        // Rebuild Baseline
        const startRebuild = performance.now();
        appMock.updateSceneGraph_Current();
        const endRebuild = performance.now();

        // Diff Baseline (First render)
        appMock.sceneGraphItemMap.clear();
        document.getElementById('objects-list').innerHTML = '';
        appMock.updateSceneGraph_Diff();

        // Diff Update (1 change)
        appMock.objects[0].name = "Updated Object 0";
        appMock.selectedObject = appMock.objects[0];

        const startDiff = performance.now();
        appMock.updateSceneGraph_Diff();
        const endDiff = performance.now();

        console.log(`Rebuild Time (5000 objects): ${(endRebuild - startRebuild).toFixed(3)} ms`);
        console.log(`Diff Update Time (1 change): ${(endDiff - startDiff).toFixed(3)} ms`);
    });
});
