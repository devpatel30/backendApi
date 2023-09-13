const mongoose = require("mongoose")

const institutionPeople = new mongoose.Schema({
    
}, {
    timestamps: true
})

module.exports = mongoose.model("InstitutionPeople", institutionPeople)