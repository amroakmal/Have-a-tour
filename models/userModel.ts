const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
import * as crypto from "crypto";

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
            validator: function(this: {password: string, }, el: string): boolean {
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

userSchema.pre('save', async function(this: {isModified: Function, password: string, passwordConfirm: string},next: Function) {
    if(!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = '';
    
    next();
});

userSchema.methods.passwordChangedAfter = function(JWTTimestamp: number) {
    if(this.passwordChangedAt) {
        var value: string = this.this.passwordChangedAt;
        const changedTimestamp = parseInt(value, 10);
        return JWTTimestamp <= changedTimestamp;
    }
    return false;
}

userSchema.methods.correctPassword = async function(insertedPassword: string, receivedFromDBPAssword: string) {
    return await bcrypt.compare(insertedPassword, receivedFromDBPAssword);
}

userSchema.methods.createResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;