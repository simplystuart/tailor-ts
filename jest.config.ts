import * as Jest from "jest";

const config: Jest.Config = {
  clearMocks: true,
  preset: "ts-jest/presets/default-esm",
  roots: ["<rootDir>/tests"],
  testEnvironment: "jsdom",
};

module.exports = config;
