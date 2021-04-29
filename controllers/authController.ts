import { Request } from "express";

const { promisify } = require('util');
const sendEmail = require('../utils/email');
const UserModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
// import AppError from '../utils/appError';
const AppErrorAuth = require('../utils/appError');
// import AppErrorAuth from '../utils/'
import {roles} from './enum';
const catchAsync = require("../utils/catchAsync");

const signToken = (id: number) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWE_EXPIRES_IN});
}

export const signup = catchAsync(async(req: {body: object}, res: {status: Function}, next: Function) => {
    const newUser = await UserModel.create(req.body);

    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            newUser
        }
    })
});

export  const login = catchAsync(async (req: {body: object}, res: {status: Function}, next: Function) => {
    const body = Object.create(req.body);
    const { email, password } = body;
    if(!email || !password) {
        return next(new AppErrorAuth('Please provide the email and the password!', 400));
    } 

    const user = await UserModel.findOne({ email }).select('+password');

    if(!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppErrorAuth('Email or password is in correct!', 401));
    }

    const token = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token
    });
});

export const protect = catchAsync(async(req: {user: object, headers: {authorization: string}}, res: {status: Function}, next: Function) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if(!token) {
        return next(new AppErrorAuth('Please login first', 401));
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id);
    if(!user) {

        return next(new AppErrorAuth('User belong to that Token does not exist anymore', 401));
    }
    if(user.passwordChangedAfter(decoded.iat)) {
        return next(new AppErrorAuth('Recently changed password! login again', 401));
    }
    req.user = user;
    next();
});

// enum roles {"ADMIN", "AMR"};

export const restrictTo = (...roles: roles[]) => {
    return (req: Request, res: object, next: Function) => {
        // if(!roles.includes(req.user.role)) {
            return next(new AppErrorAuth('Unauthorized user! Yo do not have permission', 403));
        // }
        next();
    }
};


// exports.restrictTo = (...roles: string[]) => {
//     return (req: {user: {role: string}}, res: object, next: Function) => {
//         if(!roles.includes(req.user.role)) {
//             return next(new AppErrorAuth('Unauthorized user! Yo do not have permission', 403));
//         }
//         next();
//     }
// };

export const forgotPassword = catchAsync(async(req: {protocol: string, get: Function, body:{email: string}}, res: {status: Function}, next: Function) => {
    const user = await UserModel.findOne({ email: req.body.email });
    if(!user) {
        return next(new AppErrorAuth('Please provide your email!', 404));
    }
    const resetToken = user.createResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a new patch request using your new password
    and passwordConfirm to ${resetURL}\n If you didn't forget your password, please ignore this email`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset and onlu valid for 10 minutes!',
            message: message
        });
        res.status(200).json({
            status: 'Success',
            message: 'Token sent to your email!'
        })
    } catch(err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppErrorAuth('Resetting your password failed! Please try again', 500));
    }
});

export const resetPassword = (req: object, res: object, next: Function) => {
    console.log("RESET PASSWORD");
}