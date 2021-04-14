const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    userId: {
      type: String,
      indexed: true,
      required: true
    },
    firstName: {
      type: String,
      trim: true,
      required: true,
      maxlength: 50
    },
    lastName: {
      type: String,
      trim: true,
      required: true,
      maxlength: 50
    },
    studentId: {
      type: String,
      indexed: true,
      required: true,
      maxlength: 8
    },
    gender: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(gender) {
          return gender === "male" || gender === "female";
        },
        message: "Invalid gender"
      }
    },
    race: {
      type: String,
      trim: true,
      required: false,
      maxlength: 30
    },
    age: {
      type: Number
    },
    isVeteran: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  },
);

const studentSchema = mongoose.model("students", schema);

const studentRepository = {
  createStudent: async(student, userId) => {
    student.userId = userId;
    const doc = new studentSchema(student);
    return await doc.save();
  },

  readAllStudents: async(userId) => {
    return await studentSchema.find({ userId });
  },

  readOneStudent: async (studentId, userId) => {
    return await studentSchema.findOne({ studentId, userId});
  },

  updateStudent: async (studentId, userId, callback) => {
    const item = await studentRepository.readOneStudent(studentId, userId);
    if (!item) {
      return null;
    }

    callback(item);
    await item.save();

    return item;
  },

  deleteStudent: async (studentId, userId) => {
    const result = await studentSchema.deleteOne({ studentId, userId });
    return (result && result.deletedCount) || 0;
  }
};

module.exports = {
  studentSchema,
  studentRepository
};
