const { serviceWrapper, getResponse, postResponse, putResponse, deleteResponse } = require("../middleware/restFactory");
const { createMap } = require("../middleware/automapper");
const regex = require("../shared/regex");
const { handleMongoErrors, validateRequestBody } = require("../middleware/errorHandlers");

const { createStudent, readAllStudents, readOneStudent, updateStudent, deleteStudent, errorMessages } = require("../services/students.service");

const races = new Set(["caucasian", "black", "hispanic", "asian", "french", "texan", "other"]);

const studentInfoSchema = {
  firstName: {
    type: String,
    maxLength: 50,
    required: true
  },
  lastName: {
    type: String,
    maxLength: 50,
    required: true
  },
  studentId: {
    type: String,
    match: regex.studentId,
    required: true,
    maxLength: 8
  },
  gender: {
    type: String,
    required: true,
    maxLength: 6,
    validate: gender => gender === "male" || gender === "female"
  },
  race: {
    type: String,
    required: true,
    maxLength: 30,
    validate: race => races.has(race)
  },
  age: {
    type: Number,
    required: true,
  },
  isVeteran: {
    type: Boolean,
    required: false,
    default: false
  }
};

const validateStudentInfo = validateRequestBody(studentInfoSchema);

const mapAll = createMap([
  "firstName",
  "lastName",
  "studentId",
  "gender",
  "race",
  "age",
  "isVeteran",
  "createdAt",
  "updatedAt"
]);

module.exports = {
  getAllStudents: [
    serviceWrapper.callAsync(readAllStudents),
    handleMongoErrors(errorMessages.read),
    mapAll.mapArray,
    getResponse
  ],
  getOneStudent: [
    serviceWrapper.callAsync(readOneStudent),
    handleMongoErrors(errorMessages.read),
    mapAll.mapScalar,
    getResponse
  ],
  postStudent: [
    validateStudentInfo,
    serviceWrapper.callAsync(createStudent),
    handleMongoErrors(errorMessages.create),
    mapAll.mapScalar,
    postResponse
  ],
  putStudent: [
    validateStudentInfo,
    serviceWrapper.callAsync(updateStudent),
    handleMongoErrors(errorMessages.update),
    mapAll.mapScalar,
    putResponse
  ],
  deleteStudent: [
    serviceWrapper.callAsync(deleteStudent),
    handleMongoErrors(errorMessages.delete),
    deleteResponse
  ]
};
