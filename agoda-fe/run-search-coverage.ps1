$env:NODE_PATH = "D:\SQA\agoda-fe\node_modules"

node ../../SQA/agoda-fe/node_modules/jest/bin/jest.js `
  --config jest.config.js `
  tests/components/Search `
  --runInBand `
  --coverage
