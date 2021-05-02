const mongoose = require("mongoose");
const { getAvatar } = require("js-avatar");
const bcrypt = require("bcryptjs");
const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    confirmPassword: {
      type: String,
      required: true,
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: "Confirm Password Must Be same as Password",
      },
    },
    profilePicture: { type: String, required: false, default: "" },
    bookmarks: [{ type: mongoose.Schema.ObjectId, ref: "Anime" }],
  },
  { timestamps: true }
);

/**
 * MIDDLEWARE
 */
userSchema.pre("save", function (next) {
  if (!this.isNew) return next();
  this.profilePicture = getAvatar(this.email).initials;
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

/**
 * Methods
 */

userSchema.methods.checkPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = User = mongoose.model("User", userSchema);
