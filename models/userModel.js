"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = __importStar(require("crypto"));
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please insert your name']
    },
    password: {
        type: String,
        required: [true, 'Please insert your password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: true,
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: `Passwords don't match.`
        }
    },
    email: {
        type: String,
        required: [true, 'Please insert your email address'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please insert a valid email']
    },
    photo: String,
    passwordChangedAt: Date,
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    passwordResetToken: String,
    passwordResetExpires: Date
});
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified('password')) {
            return next();
        }
        this.password = yield bcrypt.hash(this.password, 12);
        this.passwordConfirm = '';
        next();
    });
});
userSchema.methods.passwordChangedAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        var value = this.this.passwordChangedAt;
        const changedTimestamp = parseInt(value, 10);
        return JWTTimestamp <= changedTimestamp;
    }
    return false;
};
userSchema.methods.correctPassword = function (insertedPassword, receivedFromDBPAssword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt.compare(insertedPassword, receivedFromDBPAssword);
    });
};
userSchema.methods.createResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
};
const userModel = mongoose.model('User', userSchema);
module.exports = userModel;
