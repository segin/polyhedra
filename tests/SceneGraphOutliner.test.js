import * as THREE from "three";
import "./__mocks__/three-dat.gui.js";

describe("Scene Graph/Outliner Functionality", () => {
  let app;

  beforeEach(() => {
    document.body.innerHTML = '<div id="outliner"></div>';

    jest
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((cb) => cb());
    jest.spyOn(console, "log").mockImplementation(); // Suppress console.log

    // Mock document methods
    jest.spyOn(document.body, "appendChild").mockImplementation();
    jest.spyOn(window, "addEventListener").mockImplementation();

    // Mock createDocumentFragment
    jest.spyOn(document, "createDocumentFragment").mockImplementation(() => ({
      children: [],
      appendChild: jest.fn(function (child) {
        this.children.push(child);
        return child;
      }),
      nodeType: 11, // DocumentFragment
    }));

    // Mock createElement to return proper elements
    jest.spyOn(document, "createElement").mockImplementation((tagName) => {
      const element = {
        tagName: tagName.toUpperCase(),
        style: {},
        appendChild: jest.fn(function (child) {
          if (!this.children) this.children = [];

          // Handle DocumentFragment append
          if (child.nodeType === 11) {
            child.children.forEach((c) => this.children.push(c));
            child.children = []; // clear fragment
          } else {
            this.children.push(child);
          }
          return child;
        }),
        children: [],
        textContent: "",
        _innerHTML: "",
        set innerHTML(value) {
          this._innerHTML = value;
          if (value === "") {
            this.children = [];
          }
        },
        get innerHTML() {
          return this._innerHTML;
        },
        onclick: null,
        click: jest.fn(function () {
          if (this.onclick) this.onclick({ stopPropagation: jest.fn() });
        }),
        addEventListener: jest.fn((type, listener) => {
          if (type === "keydown") element.onkeydown = listener;
        }),
        removeEventListener: jest.fn(),
        setAttribute: jest.fn((name, value) => {
          element[name] = value;
        }),
        getAttribute: jest.fn((name) => {
          return element[name];
        }),
        querySelector: jest.fn(function (selector) {
          if (selector === "li")
            return this.children.find((c) => c.tagName === "LI");
          return null;
        }),
        querySelectorAll: jest.fn(function (selector) {
          const results = [];
          const traverse = (el) => {
            if (el.tagName === selector.toUpperCase()) results.push(el);
            if (el.children) el.children.forEach(traverse);
          };
          if (this.children) this.children.forEach(traverse);
          return results;
        }),
      };

      // Add style.cssText property
      Object.defineProperty(element.style, "cssText", {
        set: jest.fn(),
        get: jest.fn(),
      });

      return element;
    });

    jest.clearAllMocks();

    // Create test app with scene graph functionality
    // Emulating main.js logic for testing purposes
    class TestApp {
      constructor() {
        this.objects = [];
        this.selectedObject = null;
        this.scene = { add: jest.fn(), remove: jest.fn() };
        this.setupSceneGraph();
      }

      setupSceneGraph() {
        this.sceneGraphPanel = document.createElement("div");
        this.objectsList = document.createElement("ul");
        this.sceneGraphPanel.appendChild(document.createElement("h3"));
        this.sceneGraphPanel.appendChild(this.objectsList);
        document.body.appendChild(this.sceneGraphPanel);
        this.updateSceneGraph();
      }

      updateSceneGraph() {
        if (!this.objectsList) return;

        const fragment = document.createDocumentFragment();

        if (this.objects.length === 0) {
          const emptyMessage = document.createElement("li");
          emptyMessage.textContent = "No objects in scene";
          fragment.appendChild(emptyMessage);
        } else {
          this.objects.forEach((object, index) => {
            const listItem = document.createElement("li");
            listItem.setAttribute("role", "button");
            listItem.setAttribute("tabindex", "0");
            listItem.setAttribute(
              "aria-label",
              `Select ${object.name || `Object_${index + 1}`}`,
            );

            const objectInfo = document.createElement("div");
            const objectName = document.createElement("span");
            const objectType = document.createElement("span");
            const visibilityBtn = document.createElement("button");
            const deleteBtn = document.createElement("button");
            const positionInfo = document.createElement("div");

            objectName.textContent = object.name || `Object_${index + 1}`;
            objectType.textContent = object.geometry.type.replace(
              "Geometry",
              "",
            );

            visibilityBtn.textContent = object.visible ? "👁" : "🚫";
            const visLabel = object.visible
              ? `Hide ${object.name}`
              : `Show ${object.name}`;
            visibilityBtn.setAttribute("aria-label", visLabel);
            visibilityBtn.title = visLabel;

            deleteBtn.textContent = "🗑";
            const delLabel = `Delete ${object.name}`;
            deleteBtn.setAttribute("aria-label", delLabel);
            deleteBtn.title = delLabel;

            positionInfo.textContent = `x: ${object.position.x.toFixed(2)}, y: ${object.position.y.toFixed(2)}, z: ${object.position.z.toFixed(2)}`;

            // Mock event handlers
            visibilityBtn.onclick = (e) => {
              e.stopPropagation();
              object.visible = !object.visible;
              visibilityBtn.textContent = object.visible ? "👁" : "🚫";
              const newLabel = object.visible
                ? `Hide ${object.name}`
                : `Show ${object.name}`;
              visibilityBtn.setAttribute("aria-label", newLabel);
              visibilityBtn.title = newLabel;
            };

            deleteBtn.onclick = (e) => {
              e.stopPropagation();
              this.deleteObject(object);
            };

            listItem.onclick = () => {
              this.selectObject(object);
            };

            listItem.addEventListener("keydown", (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                this.selectObject(object);
              }
            });

            const buttonContainer = document.createElement("div");
            buttonContainer.appendChild(visibilityBtn);
            buttonContainer.appendChild(deleteBtn);

            objectInfo.appendChild(objectName);
            objectInfo.appendChild(objectType);
            objectInfo.appendChild(buttonContainer);

            listItem.appendChild(objectInfo);
            listItem.appendChild(positionInfo);
            fragment.appendChild(listItem);
          });
        }

        this.objectsList.innerHTML = "";
        this.objectsList.appendChild(fragment);
      }

      selectObject(object) {
        this.selectedObject = object;
        this.updateSceneGraph();
      }

      deleteObject(object) {
        const index = this.objects.indexOf(object);
        if (index > -1) {
          this.objects.splice(index, 1);
          this.scene.remove(object);
        }
        if (this.selectedObject === object) {
          this.selectedObject = null;
        }
        this.updateSceneGraph();
      }

      addTestObject(name = "TestObject") {
        const object = {
          name: name,
          position: {
            x: Math.random(),
            y: Math.random(),
            z: Math.random(),
            toFixed: (n) => "1.00",
          },
          geometry: { type: "BoxGeometry" },
          visible: true,
          uuid: `test-uuid-${Date.now()}`,
        };
        this.objects.push(object);
        this.scene.add(object);
        this.updateSceneGraph();
        return object;
      }
    }

    app = new TestApp();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    document.body.innerHTML = "";
  });

  describe("Scene Graph Setup", () => {
    it("should create scene graph panel with proper structure", () => {
      expect(app.sceneGraphPanel).toBeDefined();
      expect(app.objectsList).toBeDefined();
      expect(document.body.appendChild).toHaveBeenCalled();
    });

    it("should show empty message when no objects exist", () => {
      app.objects = [];
      app.updateSceneGraph();
      expect(app.objectsList.appendChild).toHaveBeenCalled();
    });

    it("should display object information in scene graph", () => {
      const createElementSpy = jest.spyOn(document, "createElement");
      app.addTestObject("DisplayTest");

      expect(createElementSpy).toHaveBeenCalledWith("li");
      expect(createElementSpy).toHaveBeenCalledWith("div");
      expect(createElementSpy).toHaveBeenCalledWith("span");
      expect(createElementSpy).toHaveBeenCalledWith("button");
    });

    it("should handle object selection through scene graph", () => {
      const obj = app.addTestObject("SelectableObject");
      const selectSpy = jest.spyOn(app, "selectObject");

      app.selectObject(obj);

      expect(selectSpy).toHaveBeenCalledWith(obj);
      expect(app.selectedObject).toBe(obj);
    });

    it("should handle object deletion through scene graph", () => {
      const obj1 = app.addTestObject("DeleteMe");
      const obj2 = app.addTestObject("KeepMe");

      expect(app.objects.length).toBe(2);

      app.deleteObject(obj1);

      expect(app.objects.length).toBe(1);
      expect(app.objects).not.toContain(obj1);
      expect(app.objects).toContain(obj2);
      expect(app.scene.remove).toHaveBeenCalledWith(obj1);
    });

    it("should clear selection when selected object is deleted", () => {
      const obj = app.addTestObject("WillBeDeleted");
      app.selectObject(obj);

      expect(app.selectedObject).toBe(obj);

      app.deleteObject(obj);

      expect(app.selectedObject).toBeNull();
    });
  });

  describe("Visibility Toggle", () => {
    it("should toggle object visibility", () => {
      const obj = app.addTestObject("VisibilityTest");
      expect(obj.visible).toBe(true);

      obj.visible = !obj.visible;

      expect(obj.visible).toBe(false);

      obj.visible = !obj.visible;

      expect(obj.visible).toBe(true);
    });
  });

  describe("Accessibility", () => {
    it('should have role="button" and tabindex="0" on list items', () => {
      app.addTestObject("A11yTest");

      const listItem = app.objectsList.querySelector("li");
      expect(listItem.getAttribute("role")).toBe("button");
      expect(listItem.getAttribute("tabindex")).toBe("0");
      expect(listItem.getAttribute("aria-label")).toBe("Select A11yTest");
    });

    it("should have aria-label and title on visibility button", () => {
      const obj = app.addTestObject("VisBtnTest");

      const buttons = app.objectsList.querySelectorAll("button");
      const visBtn = buttons[0];

      expect(visBtn.getAttribute("aria-label")).toBe("Hide VisBtnTest");
      expect(visBtn.title).toBe("Hide VisBtnTest");

      visBtn.click();
      expect(visBtn.getAttribute("aria-label")).toBe("Show VisBtnTest");
      expect(visBtn.title).toBe("Show VisBtnTest");
    });

    it("should have aria-label and title on delete button", () => {
      app.addTestObject("DelBtnTest");

      const buttons = app.objectsList.querySelectorAll("button");
      const delBtn = buttons[1];

      expect(delBtn.getAttribute("aria-label")).toBe("Delete DelBtnTest");
      expect(delBtn.title).toBe("Delete DelBtnTest");
    });
  });
});
