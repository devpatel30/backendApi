const fs = require("fs");
const path = require("path");
// dynamic loading and exporting models in a centralized fashion
const loadModel = (modelName) => {
  const modelPath = path.join(__dirname, modelName);
  return require(modelPath);
};

const modelFiles = fs.readdirSync(__dirname);

const validModelNames = modelFiles
  .filter((file) => file.endsWith(".js") && file !== "index.js")
  .map((file) => file.replace(".js", ""));

const models = {};

for (const modelName of validModelNames) {
  const model = loadModel(modelName);
  const capitalizedModelName =
    modelName.charAt(0).toUpperCase() + modelName.slice(1);
  models[capitalizedModelName] = model;
}
module.exports = models;
