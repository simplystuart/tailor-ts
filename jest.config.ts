import * as Jest from "jest";

const config: Jest.Config = {
  clearMocks: true,
  // TODO: fix test module resolution (only for src/* files)
  moduleNameMapper: {
    "^./queue.js$": "<rootDir>/src/queue.ts",
  },
  preset: "ts-jest/presets/default-esm",
  roots: ["<rootDir>/tests"],
  testEnvironment: "jsdom",
};

module.exports = config;
