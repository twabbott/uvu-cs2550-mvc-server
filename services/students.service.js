const { studentRepository } = require("../models/students.model");

const { NotFoundError, BadRequestError } = require("../middleware/restFactory");

const errorMessages = {
  create: "Error creating new student.",
  read: "Error reading student(s).",
  update: "Error updating student.",
  delete: "Error deleting student"
};

async function createStudent(req, ctrl) {
  const { studentId, firstName, lastName, gender, race, age, isVeteran } = req.body;

  const all = await studentRepository.readAllStudents(req.userId);
  if (all.length >= 20) {
    throw new BadRequestError("Cannot have more than 20 students.");
  }

  const existingItem = all.find(student => student.studentId === studentId);
  if (existingItem) {
    throw new BadRequestError(`Student ${studentId} already exists.  Cannot create a duplicate.`);
  }

  let student = await studentRepository.createStudent({
    studentId,
    firstName,
    lastName,
    gender,
    race,
    age,
    isVeteran
  }, req.userId);

  // Give a location ID for the header
  ctrl.setLocationId(student.studentId.toString());

  return student;
}

async function readAllStudents(req) {
  return await studentRepository.readAllStudents(req.userId);
}

async function readOneStudent(req) {
  const studentId = req.params.id;

  const student = await studentRepository.readOneStudent(studentId, req.userId);
  if (!student) {
    throw new NotFoundError(`Student ${req.params.id} not found`);
  }

  return student;
}

async function updateStudent(req) {
  console.log("****", req.body);
  const updatedItem = await studentRepository.updateStudent(
    req.params.id,
    req.userId,
    item => {
      const { firstName, lastName, gender, race, age, isVeteran } = req.body;

      item.firstName = firstName;
      item.lastName = lastName;
      item.gender = gender;
      item.race = race;
      item.age = age;
      item.isVeteran = isVeteran;
    }
  );

  if (!updatedItem) {
    throw new NotFoundError(`Student not found; studentId=${req.params.id}`);
  }

  return updatedItem;
}

async function deleteStudent(req) {
  const studentId = req.params.id;

  const count = await studentRepository.deleteStudent(studentId, req.userId);
  if (!count) {
    throw new NotFoundError(`Student not found; studentId=${req.params.id}`);
  }
}

module.exports = {
  createStudent,
  readOneStudent,
  readAllStudents,
  updateStudent,
  deleteStudent,
  errorMessages,
};
