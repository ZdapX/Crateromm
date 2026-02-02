import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: "" },
  image: { type: String, default: "" },
});

const MessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  senderName: String,
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null = public
  text: String,
  image: String,
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
