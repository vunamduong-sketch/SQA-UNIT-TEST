module.exports = {
  rootDir: ".",
  roots: [
    "<rootDir>/tests",
    "<rootDir>/src-under-test/components/Search",
    "<rootDir>/src-under-test/components/Activity"
  ],
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/tests/setupTests.js"],
  testMatch: ["<rootDir>/tests/**/*.test.jsx"],
  collectCoverageFrom: [
    "<rootDir>/src-under-test/components/Search/SearchBar.jsx",
    "<rootDir>/src-under-test/components/Search/HotelList.jsx",
    "<rootDir>/src-under-test/components/Search/HotelCard.jsx",
    "<rootDir>/src-under-test/components/Activity/BackgroundActivity.jsx",
    "<rootDir>/src-under-test/components/Activity/ExploreLocationNearby.jsx",
    "<rootDir>/src-under-test/components/Activity/index.jsx",
    "<rootDir>/src-under-test/components/Activity/TopActivity.jsx",
    "<rootDir>/src-under-test/components/Activity/WhyChooseAgoda.jsx"
  ],
  coverageDirectory: "<rootDir>/coverage",
  moduleDirectories: [
    "node_modules",
    "<rootDir>/../../SQA/agoda-fe/node_modules",
    "<rootDir>/src-under-test",
    "<rootDir>/../../SQA/agoda-fe/src",
  ],
  moduleNameMapper: {
    "^src-under-test/(.*)$": "<rootDir>/src-under-test/$1",
    "^config/(.*)$": "<rootDir>/../../SQA/agoda-fe/src/config/$1",
    "^utils/(.*)$": "<rootDir>/../../SQA/agoda-fe/src/utils/$1",
    "^components/(.*)$": "<rootDir>/../../SQA/agoda-fe/src/components/$1",
    "^redux/(.*)$": "<rootDir>/../../SQA/agoda-fe/src/redux/$1",
    "^contexts/(.*)$": "<rootDir>/../../SQA/agoda-fe/src/contexts/$1",
    "\\.(css|less|scss|sass)$": "<rootDir>/tests/mocks/styleMock.js",
    "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/tests/mocks/fileMock.js"
  },
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest"
  }
};
