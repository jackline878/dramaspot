const Validator = require('fastest-validator');
const models = require('../models');
const { Chat, User, ChatMetadata } = require('../models');
const { Op, Sequelize } = require('sequelize');
const { getIO, onlineUsers } = require('../socket');

const io = getIO();

async function send(req, res) {
  try {
    const data = await req.userData;
    const senderId = parseInt(data?.userId);

    const v = new Validator();

    const chatData = {
      sender_id: senderId,
      receiver_id: parseInt(req.body.receiver_id),
      message: req.body.message || "",
      status: "unread"
    };

    const schema = {
      sender_id: { type: "number", positive: true, integer: true },
      receiver_id: { type: "number", positive: true, integer: true },
      message: { type: "string", optional: true },
      status: { type: "string", enum: ["unread", "read"] }
    };

    const validationResponse = v.validate(chatData, schema);
    if (validationResponse !== true) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResponse,
      });
    }

    const transaction = await Chat.sequelize.transaction();

    try {
      // Create chat message
      const chat = await Chat.create(chatData, { transaction });

      // Create chat metadata for both sender and receiver
      await ChatMetadata.bulkCreate([
        { chat_id: chat.id, user_id: chat.sender_id, is_deleted: false },
        { chat_id: chat.id, user_id: chat.receiver_id, is_deleted: false }
      ], { transaction });

      await transaction.commit();

      // Fetch full chat with sender info
      const sentChat = await Chat.findOne({
        where: { id: chat.id },
        include: [
          {
            model: User,
            as: 'Sender',
            attributes: ['id', 'username', 'profile_pic']
          },
          {
            model: ChatMetadata,
            as: 'metadata',
            where: { is_deleted: false },
            required: false
          }
        ]
      });

      const otherUser = sentChat?.Sender;
      const receiverSocketId = onlineUsers[chat.receiver_id];

      // Emit real-time message to receiver if online
      if (receiverSocketId && otherUser) {
        io.to(receiverSocketId).emit('receiveMessage', {
          otherUser: {
            id: otherUser.id,
            username: otherUser.username,
            profile_pic: otherUser.profile_pic || 'https://i.pinimg.com/736x/cd/4b/d9/cd4bd9b0ea2807611ba3a67c331bff0b.jpg'
          },
          message: sentChat.message,
          createdAt: sentChat.createdAt,
          status: sentChat.status,
          isme: false
        });
      }

      return res.status(201).json({
        message: "Chat created successfully",
        chat: sentChat
      });

    } catch (err) {
      await transaction.rollback();
      console.error("Error creating chat:", err);
      return res.status(500).json({
        message: "Failed to send chat",
        error: err.message
      });
    }

  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({
      message: "Unexpected server error",
      error: err.message
    });
  }
}

module.exports = { send };



const getChatList = async (req, res) => {
  try {
    const data = await req.userData;
    const currentUserId = parseInt(data.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    const latestChats = await Chat.findAll({
      where: {
        [Op.or]: [
          { sender_id: currentUserId },
          { receiver_id: currentUserId }
        ]
      },
      include: [
        {
          model: ChatMetadata,
          as: 'metadata',
          where: { is_deleted: false },
          required: false
        },
        {
          model: User,
          as: 'Sender',
          attributes: ['id', 'username', 'profile_pic']
        },
        {
          model: User,
          as: 'Receiver',
          attributes: ['id', 'username', 'profile_pic']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const chatMap = new Map();

    latestChats.forEach(chat => {
      // Determine the other user (not current user)
      const isSender = parseInt(chat.sender_id) === currentUserId;
      const otherUser = isSender ? chat.Receiver : chat.Sender;

      // Ensure otherUser exists and is not the current user
      if (!otherUser || otherUser.id === currentUserId) return;

      // Only keep one latest message per user
      if (!chatMap.has(otherUser.id)) {

        const isRecipientOnline = !!onlineUsers[otherUser.id];
        chatMap.set(otherUser.id, {


          otherUser: {
            isOnline: isRecipientOnline,
            id: otherUser.id,
            username: otherUser.username,
            profile_pic: otherUser.profile_pic || 'https://i.pinimg.com/736x/cd/4b/d9/cd4bd9b0ea2807611ba3a67c331bff0b.jpg'
          },
          message: chat.message,
          createdAt: chat.createdAt,
          status: chat.status,
          isme: isSender
        });
      }
    });

    const chatsArray = Array.from(chatMap.values());
    const paginatedChats = chatsArray.slice(offset, offset + limit);
    const totalPages = Math.ceil(chatsArray.length / limit);

    return res.status(200).json({
      user_id: currentUserId,
      currentPage: page,
      totalPages,
      chats: paginatedChats
    });

  } catch (error) {
    console.error('Error fetching chat list:', error);
    return res.status(500).json({ message: 'Failed to load chat list' });
  }
};





// Show a specific chat
function show(req, res) {
  const id = req.params.id;
  const userId = req.userData?.userId || 2;

  models.Chat.findOne({
    where: { id, '$metadata.is_deleted$': false },
    include: [
      { model: models.User, as: 'Sender' },
      { model: models.User, as: 'Receiver' },
      {
        model: models.ChatMetadata,
        as: 'metadata',
        where: { user_id: userId },
      },
    ],
  })
    .then(result => {
      if (result) {

        res.status(200).json(result);
      } else {
        res.status(404).json({ message: "Chat not found!" });
      }
    })
    .catch(error => {
      console.error("Error fetching chat:", error);
      res.status(500).json({ message: "Something went wrong!" });
    });
}

const markAllFromSenderAsRead = async (req, res) => {
  try {
    const data = await req.userData;
    const currentUserId = parseInt(data.userId);
    const senderId = parseInt(req.body.senderId); // ID of the sender whose messages to mark as read

    if (!senderId) {
      return res.status(400).json({ message: 'Sender ID is required' });
    }

    const updated = await Chat.update(
      { status: 'read' },
      {
        where: {
          sender_id: senderId,
          receiver_id: currentUserId,
          status: { [Op.ne]: 'read' }
        },
        include: [
          {
            model: ChatMetadata,
            as: 'metadata',
            where: { is_deleted: false },
            required: false
          }
        ]
      }
    );

    // Emit socket event to notify sender that their messages were read
    const senderSocket = onlineUsers[senderId];
    if (senderSocket) {
      io.to(senderSocket).emit('messagesRead', {
        sender_id: senderId,
        reader_id: currentUserId
      });
    }

    return res.status(200).json({
      message: 'All messages marked as read',
      updatedCount: updated[0]
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return res.status(500).json({ message: 'Failed to mark messages as read' });
  }
};


// Group chats by contact
async function group(req, res) {
  try {
    const data = await req.userData;
    const user_id = data.userId || 2;
    const page = parseInt(req.query.page) || 1;
    const limit = 15;
    const offset = (page - 1) * limit;

    const [sentChats, receivedChats] = await Promise.all([
      models.Chat.findAll({
        where: { sender_id: user_id },
        include: [
          {
            model: models.ChatMetadata,
            as: 'metadata',
            where: { user_id, is_deleted: false },
          },
          {
            model: models.User,
            as: 'Receiver',
          }
        ],
        order: [['createdAt', 'DESC']],
      }),
      models.Chat.findAll({
        where: { receiver_id: user_id },
        include: [
          {
            model: models.ChatMetadata,
            as: 'metadata',
            where: { user_id, is_deleted: false },
          },
          {
            model: models.User,
            as: 'Sender',
          }
        ],
        order: [['createdAt', 'DESC']],
      }),
    ]);

    // Combine all chats
    const allChats = [...sentChats, ...receivedChats];

    // Map to group chats by contact
    const groupedChatsMap = new Map();

    allChats.forEach(chat => {
      const contactId = chat.sender_id === user_id ? chat.receiver_id : chat.sender_id;

      if (!groupedChatsMap.has(contactId)) {
        const myChats = allChats
          .filter(c =>
            (c.sender_id === contactId && c.receiver_id === user_id) ||
            (c.receiver_id === contactId && c.sender_id === user_id)
          )
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const unread = myChats.filter(c => !c.is_read && c.receiver_id === user_id).length;

        groupedChatsMap.set(contactId, {
          recipient: contactId,
          message: myChats[0], // Most recent
          unread,
        });
      }
    });

    const groupedChats = Array.from(groupedChatsMap.values());
    const paginatedChats = groupedChats.slice(offset, offset + limit);

    return res.status(200).json({
      message: "Chats retrieved successfully",
      chats: paginatedChats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(groupedChats.length / limit),
        totalChats: groupedChats.length,
      },
    });
  } catch (error) {
    console.error("Error retrieving chats:", error);
    return res.status(500).json({
      message: "An error occurred while retrieving chats",
      error: error.message,
    });
  }
}



// List chats between authenticated user and recipient
async function index(req, res) {
  try {
    const data = await req.userData;
    const user_id = parseInt(data.userId);
    const recipient = parseInt(req.query.recipient);
    const page = parseInt(req.query.page) || 1;
    const limit = 15;
    const offset = (page - 1) * limit;

    if (!recipient) {
      return res.status(400).json({ message: "Recipient ID is required" });
    }

    const me = await models.User.findByPk(user_id);
    const otherUser = await models.User.findByPk(recipient);

    if (!otherUser) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    const chats = await models.Chat.findAndCountAll({
      where: {
        [Sequelize.Op.or]: [
          { sender_id: user_id, receiver_id: recipient },
          { sender_id: recipient, receiver_id: user_id },
        ],
      },
      include: [
        {
          model: models.ChatMetadata,
          as: 'metadata',
          where: { user_id, is_deleted: false },
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    chats.rows.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));


    // Add "isMe" flag
    const chatsWithIsMe = chats.rows.map(chat => ({
      ...chat.dataValues,
      isMe: parseInt(chat.sender_id) === user_id,
    }));

    // Find IDs of chats sent by recipient and received by user in the current page
    const unreadChatIds = chats.rows
      .filter(chat => parseInt(chat.sender_id) === recipient && parseInt(chat.receiver_id) === user_id && chat.status !== 'read')
      .map(chat => chat.id);

    // Update status to 'read' only for those chats
    if (unreadChatIds.length > 0) {
      await models.Chat.update(
        { status: 'read' },
        { where: { id: { [Sequelize.Op.in]: unreadChatIds } } }
      );

      // Emit socket event to notify sender that their messages were read
      const senderSocket = onlineUsers[recipient];
      if (senderSocket) {
        io.to(senderSocket).emit('messagesRead', {
          sender_id: recipient,
          reader_id: user_id,
          chatIds: unreadChatIds,
        });
      }
    }

    return res.status(200).json({
      message: "Chats retrieved successfully",
      user: {
        id: me.id,
        name: me.username,
        email: me.email,
        picture: me.profile_pic || 'https://i.pinimg.com/736x/24/77/4a/24774aa16ced7cb60f5d8c715c7537cf.jpg',
      },
      recipient: {
        id: otherUser.id,
        name: otherUser.username,
        email: otherUser.email,
        picture: otherUser.profile_pic || 'https://i.pinimg.com/736x/68/22/cf/6822cf1838dc99b9821091d1212bc37a.jpg',
      },
      chats: chatsWithIsMe,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(chats.count / limit),
        totalChats: chats.count,
      },
    });
  } catch (error) {
    console.error("Error retrieving chats:", error);
    return res.status(500).json({
      message: "An error occurred while retrieving chats",
      error: error.message,
    });
  }
}


// Soft-delete a chat for the current user
async function destroy(req, res) {
  try {
    const chatId = req.params.id;
    const data = await req.userData;
    const userId = data.userId;

    const metadata = await models.ChatMetadata.findOne({
      where: { chat_id: chatId, user_id: userId },
    });

    if (!metadata) {
      return res.status(404).json({ message: "Chat not found for user" });
    }

    metadata.is_deleted = true;
    await metadata.save();

    return res.status(200).json({ message: "Chat deleted successfully for the user" });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
}

module.exports = {
  send,
  show,
  group,
  index,
  destroy,
  getChatList,
  markAllFromSenderAsRead
};
