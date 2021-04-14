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
    teamName: {
      type: String,
      maxlength: 50,
      trim: true,
      required: true
    },
    number: {
      type: Number,
      required: true,
    },
    position: {
      type: String,
      required: true,
      maxlength: 50,
      lowercase: true,
    },
    playsOffense: {
      type: Boolean,
      default: false
    },
    yearsPlayed: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true
  },
);

const playerSchema = mongoose.model("players", schema);

const playerRepository = {
  createPlayer: async(player, userId) => {
    player.userId = userId;
    const doc = new playerSchema(player);
    return await doc.save();
  },

  readAllPlayers: async(userId) => {
    return await playerSchema.find({ userId });
  },

  readOnePlayer: async (playerId, userId) => {
    return await playerSchema.findOne({ _id: playerId, userId});
  },

  updatePlayer: async (playerId, userId, callback) => {
    const item = await playerRepository.readOnePlayer(playerId, userId);
    if (!item) {
      return null;
    }

    callback(item);

    await item.save();

    return item;
  },

  deletePlayer: async (playerId, userId) => {
    const result = await playerSchema.deleteOne({ _id: playerId, userId });
    return (result && result.deletedCount) || 0;
  }
};

module.exports = {
  playerSchema,
  playerRepository
};
