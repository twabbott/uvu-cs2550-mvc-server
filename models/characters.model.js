const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    userId: {
      type: String,
      indexed: true,
      required: true
    },
    name: {
      type: String,
      maxlength: 50,
      trim: true,
      required: true
    },
    race: {
      type: String,
      maxlength: 20,
      trim: true,
      required: true
    },
    class: {
      type: String,
      maxlength: 20,
      trim: true,
      required: true
    },
    gender: {
      type: String,
      maxlength: 6,
      trim: true,
      required: true
    },
    isRightHanded: {
      type: Boolean,
      default: false
    },
    strength: {
      type: Number,
      required: true,
      min: 3,
      max: 18
    },
    dexterity: {
      type: Number,
      required: true,
      min: 3,
      max: 18
    },
    constitution: {
      type: Number,
      required: true,
      min: 3,
      max: 18
    },
    intelligence: {
      type: Number,
      required: true,
      min: 3,
      max: 18
    },
    wisdom: {
      type: Number,
      required: true,
      min: 3,
      max: 18
    },
    charisma: {
      type: Number,
      required: true,
      min: 3,
      max: 18
    },
  },
  {
    timestamps: true
  },
);

const characterSchema = mongoose.model("characters", schema);

const characterRepository = {
  createCharacter: async(character, userId) => {
    character.userId = userId;
    const doc = new characterSchema(character);
    return await doc.save();
  },

  readAllCharacters: async(userId) => {
    return await characterSchema.find({ userId });
  },

  readOneCharacter: async (characterId, userId) => {
    return await characterSchema.findOne({ _id: characterId, userId});
  },

  updateCharacter: async (characterId, userId, callback) => {
    const item = await characterRepository.readOneCharacter(characterId, userId);
    if (!item) {
      return null;
    }

    callback(item);

    await item.save();

    return item;
  },

  deleteCharacter: async (characterId, userId) => {
    const result = await characterSchema.deleteOne({ _id: characterId, userId });
    return (result && result.deletedCount) || 0;
  }
};

module.exports = {
  characterSchema,
  characterRepository
};
