module.exports = {
  testEnvironment: "jsdom",
  setupFiles: ["jest-canvas-mock"],
  setupFilesAfterEnv: ["<rootDir>/jest.dom.cjs", "<rootDir>/jest.setup.cjs"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  transform: {
    "^.+\\.(js|ts)$": "babel-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!.*(three|three/examples/jsm|cannon-es|@exodus|html-encoding-sniffer|@asamuzakjp))",
  ],
};
