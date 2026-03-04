export class ServiceContainer {
  constructor() {
    this.services = new Map();
  }

  register(name, instance) {
    if (this.services.has(name)) {
      throw new Error(`Service '${name}' is already registered.`);
    }
    this.services.set(name, instance);
  }

  get(name) {
    if (!this.services.has(name)) {
      throw new Error(`Service '${name}' not found.`);
    }
    return this.services.get(name);
  }
}
