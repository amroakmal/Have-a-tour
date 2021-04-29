"use strict";
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
exports.resetPassword = exports.forgotPassword = exports.restrictTo = exports.protect = exports.login = exports.signup = void 0;
const { promisify } = require('util');
const sendEmail = require('../utils/email');
const UserModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
// import AppError from '../utils/appError';
const AppErrorAuth = require('../utils/appError');
const catchAsync = require("../utils/catchAsync");
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWE_EXPIRES_IN
    });
};
exports.signup = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const newUser = yield UserModel.create(req.body);
    const token = signToken(newUser._id);
    res.status(201).json({
        status: 'success',
        token,
        data: {
            newUser
        }
    });
}));
exports.login = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const body = Object.create(req.body);
    const { email, password } = body;
    if (!email || !password) {
        return next(new AppErrorAuth('Please provide the email and the password!', 400));
    }
    const user = yield UserModel.findOne({ email }).select('+password');
    if (!user || !(yield user.correctPassword(password, user.password))) {
        return next(new AppErrorAuth('Email or password is in correct!', 401));
    }
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token
    });
}));
exports.protect = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new AppErrorAuth('Please login first', 401));
    }
    const decoded = yield promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const user = yield UserModel.findById(decoded.id);
    if (!user) {
        return next(new AppErrorAuth('User belong to that Token does not exist anymore', 401));
    }
    if (user.passwordChangedAfter(decoded.iat)) {
        return next(new AppErrorAuth('Recently changed password! login again', 401));
    }
    req.user = user;
    next();
}));
// enum roles {"ADMIN", "AMR"};
const restrictTo = (...roles) => {
    return (req, res, next) => {
        // if(!roles.includes(req.user.role)) {
        return next(new AppErrorAuth('Unauthorized user! Yo do not have permission', 403));
        // }
        next();
    };
};
exports.restrictTo = restrictTo;
// exports.restrictTo = (...roles: string[]) => {
//     return (req: {user: {role: string}}, res: object, next: Function) => {
//         if(!roles.includes(req.user.role)) {
//             return next(new AppErrorAuth('Unauthorized user! Yo do not have permission', 403));
//         }
//         next();
//     }
// };
exports.forgotPassword = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield UserModel.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppErrorAuth('Please provide your email!', 404));
    }
    const resetToken = user.createResetPasswordToken();
    yield user.save({ validateBeforeSave: false });
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a new patch request using your new password
    and passwordConfirm to ${resetURL}\n If you didn't forget your password, please ignore this email`;
    try {
        yield sendEmail({
            email: user.email,
            subject: 'Your password reset and onlu valid for 10 minutes!',
            message: message
        });
        res.status(200).json({
            status: 'Success',
            message: 'Token sent to your email!'
        });
    }
    catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        yield user.save({ validateBeforeSave: false });
        return next(new AppErrorAuth('Resetting your password failed! Please try again', 500));
    }
}));
const resetPassword = (req, res, next) => {
    console.log("RESET PASSWORD");
};
exports.resetPassword = resetPassword;
