const express = require("express");
const router = express.Router();

const { getAllStudents, getOneStudent, postStudent, putStudent, deleteStudent } = require("../controllers/students.ctrl");

router.get("/v1/students", getAllStudents);
router.get("/v1/students/:id", getOneStudent);
router.post("/v1/students", postStudent);
router.put("/v1/students/:id", putStudent);
router.delete("/v1/students/:id", deleteStudent);

module.exports = router;

