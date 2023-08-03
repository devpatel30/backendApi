const express = require("express");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");

const {
  Availability,
  Company,
  EmploymentType,
  Expertise,
  Interest,
  InvitationCode,
  JobTitle,
  Language,
  Major,
  MentorshipStyle,
  School,
  Skill,
} = require("../models");

const models = {
  Availability,
  Company,
  EmploymentType,
  Expertise,
  Interest,
  InvitationCode,
  JobTitle,
  Language,
  Major,
  MentorshipStyle,
  School,
  Skill,
};

// Function to fetch data for a specific model
const fetchData = async (Model) => {
  try {
    const data = await Model.find({});
    if (data.length > 0) {
      return {
        status: true,
        message: `${Model.modelName}s in the database:`,
        data: data,
      };
    } else {
      return {
        status: true,
        message: "Database is empty",
        data: [],
      };
    }
  } catch (e) {
    return {
      status: false,
      message: "Internal server error",
      error: e,
    };
  }
};

// Function to generate routes for a given model
const generateGetRoutesForModel = (modelName) => {
  router.get(
    `/${modelName.toLowerCase()}`,
    catchAsync(async (req, res, next) => {
      const Model = models[modelName];
      if (Model) {
        const result = await fetchData(Model);
        res.status(result.status ? 200 : 200).send(result);
      } else {
        res.status(404).json({
          status: false,
          message: `Model "${modelName}" not found`,
          data: [],
        });
      }
    })
  );
};

// Generate routes for all models
for (const modelName in models) {
  generateGetRoutesForModel(modelName);
}

// Function to add data to a specific model
const addData = async (Model, data) => {
  try {
    if (Object.keys(data).length === 0) {
      return {
        status: false,
        message: "No data to push",
        data: null,
      };
    }
    const newEntry = new Model(data);
    await newEntry.save();
    return {
      status: true,
      message: `${Model.modelName} added successfully`,
      data: newEntry,
    };
  } catch (e) {
    return {
      status: false,
      message: "Internal server error",
      error: e,
    };
  }
};

// Function to generate routes for adding data to a given model
const generatePostRoutesForModel = (modelName) => {
  router.post(
    `/${modelName.toLowerCase()}`,
    catchAsync(async (req, res, next) => {
      const Model = models[modelName];
      if (Model) {
        const result = await addData(Model, req.body);
        res.status(result.status ? 201 : 500).send(result);
      } else {
        res.status(404).json({
          status: false,
          message: `Model "${modelName}" not found`,
          data: [],
        });
      }
    })
  );
};

// Generate routes for adding data to all models
for (const modelName in models) {
  generatePostRoutesForModel(modelName);
}

// Function to update data for a specific model
const updateData = async (Model, id, data) => {
  try {
    if (Object.keys(data).length === 0) {
      return {
        status: false,
        message: "Data cannot be empty",
        data: null,
      };
    }

    const updatedEntry = await Model.findByIdAndUpdate(id, data, { new: true });
    if (!updatedEntry) {
      return {
        status: false,
        message: `${Model.modelName} not found with the given id`,
        data: null,
      };
    }

    return {
      status: true,
      message: `${Model.modelName} updated successfully`,
      data: updatedEntry,
    };
  } catch (e) {
    return {
      status: false,
      message: "Internal server error",
      error: e,
    };
  }
};

// Function to generate routes for updating data for a given model
const generatePutRoutesForModel = (modelName) => {
  router.put(
    `/${modelName.toLowerCase()}/:id`,
    catchAsync(async (req, res, next) => {
      const Model = models[modelName];
      if (Model) {
        const result = await updateData(Model, req.params.id, req.body);
        res.status(result.status ? 200 : 500).send(result);
      } else {
        res.status(404).json({
          status: false,
          message: `Model "${modelName}" not found`,
          data: null,
        });
      }
    })
  );
};

// Generate routes for updating data for all models
for (const modelName in models) {
  generatePutRoutesForModel(modelName);
}
// Function to delete data for a specific model
const deleteData = async (Model, id) => {
  try {
    const deletedEntry = await Model.findByIdAndDelete(id);
    if (!deletedEntry) {
      return {
        status: false,
        message: `${Model.modelName} not found with the given id`,
        data: null,
      };
    }

    return {
      status: true,
      message: `${Model.modelName} deleted successfully`,
      data: deletedEntry,
    };
  } catch (e) {
    return {
      status: false,
      message: "Internal server error",
      error: e,
    };
  }
};

// Function to generate routes for deleting data for a given model
const generateDeleteRoutesForModel = (modelName) => {
  router.delete(
    `/${modelName.toLowerCase()}/:id`,
    catchAsync(async (req, res, next) => {
      const Model = models[modelName];
      if (Model) {
        const result = await deleteData(Model, req.params.id);
        res.status(result.status ? 200 : 500).send(result);
      } else {
        res.status(404).json({
          status: false,
          message: `Model "${modelName}" not found`,
          data: null,
        });
      }
    })
  );
};

// Generate routes for deleting data for all models
for (const modelName in models) {
  generateDeleteRoutesForModel(modelName);
}

module.exports = router;
