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
const UserModel = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
exports.getAllUsers = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield UserModel.find();
    res.status(200).json({
        status: 'success',
        data: {
            users
        }
    });
}));
exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'Under development',
        responseTime: Date.now() - req.requestTime,
    });
};
exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'Under development',
        responseTime: Date.now() - req.requestTime,
    });
};
exports.updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'Under development',
        responseTime: Date.now() - req.requestTime,
    });
};
exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'Under development',
        responseTime: Date.now() - req.requestTime,
    });
};
