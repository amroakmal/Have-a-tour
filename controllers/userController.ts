const UserModel = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async(req: object, res: {status: Function}, next: Function) => {
    const users = await UserModel.find();

    res.status(200).json({
        status: 'success',
        data: {
            users
        }
    })
});

exports.createUser = (req: {requestTime: number}, res: {status: Function}) => {
    res.status(500).json({
        status: 'error',
        message: 'Under development',
        responseTime: Date.now() - req.requestTime,
    })
}

exports.getUser = (req: {requestTime: number}, res: {status: Function}) => {
    res.status(500).json({
        status: 'error',
        message: 'Under development',
        responseTime: Date.now() - req.requestTime,
    })
}

exports.updateUser = (req: {requestTime: number}, res: {status: Function}) => {
    res.status(500).json({
        status: 'error',
        message: 'Under development',
        responseTime: Date.now() - req.requestTime,
    })
}

exports.deleteUser = (req: {requestTime: number}, res: {status: Function}) => {
    res.status(500).json({
        status: 'error',
        message: 'Under development',
        responseTime: Date.now() - req.requestTime,
    })
}