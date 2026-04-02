let messageModel = require("../schemas/messages");
let mongoose = require("mongoose");

module.exports = {
  getMessagesBetweenUsers: async (currentUserId, partnerId) => {
    return await messageModel.find({
      $or: [
        { from: currentUserId, to: partnerId },
        { from: partnerId, to: currentUserId }
      ]
    }).sort({ createdAt: 1 });
  },
  
  createMessage: async (fromId, toId, type, text) => {
    let newMessage = await messageModel.create({
      from: fromId,
      to: toId,
      messageContent: { type, text }
    });
    return newMessage;
  },

  getLatestMessagesForUser: async (currentUserId) => {
    let objectIdCurrent = new mongoose.Types.ObjectId(currentUserId);
    
    return await messageModel.aggregate([
      {
        $match: {
          $or: [{ from: objectIdCurrent }, { to: objectIdCurrent }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$from", objectIdCurrent] },
              "$to",
              "$from"
            ]
          },
          latestMessage: { $first: "$$ROOT" }
        }
      },
      {
        $replaceRoot: { newRoot: "$latestMessage" }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);
  }
};
