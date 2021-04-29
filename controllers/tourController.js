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
const TourModel = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppErrorTour = require('../utils/appError');
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = 5;
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,summary,ratingsAverage,difficulty';
    next();
};
exports.getTour = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const tour = yield TourModel.findById(req.params.id);
    if (!tour) {
        return next(new AppErrorTour(`No tour found with the given ID: ${req.params.id}`, 404));
    }
    res.status(200).json({
        status: 'success',
        responseTime: Date.now() - req.requestTime,
        data: {
            tour
        }
    });
}));
exports.createTour = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const newTour = yield TourModel.create(req.body);
    res.status(201).json({
        status: 'success',
        responseTime: Date.now() - req.requestTime,
        results: 1,
        data: {
            newTour
        }
    });
}));
exports.getAllTours = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //await the "query" variable to get executes, i.e. execute the query variable by making the required
    //query and return the results to the tours variable
    const features = new APIFeatures(TourModel.find(), req.query).filter().sort().limitFields().paginate();
    const tours = yield features.query;
    res.status(200).json({
        status: 'success',
        responseTime: Date.now() - req.requestTime,
        requestTime: req.requestTime,
        results: tours.length,
        data: {
            tours
        }
    });
}));
exports.updateTour = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedTour = yield TourModel.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!updatedTour) {
        return next(new AppErrorTour(`No tour found with the given ID: ${req.params.id}`, 404));
    }
    res.status(200).json({
        status: 'success',
        responseTime: Date.now() - req.requestTime,
        results: 1,
        data: {
            updatedTour
        }
    });
}));
exports.deleteTour = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const tour = yield TourModel.findByIdAndDelete(req.params.id);
    if (!tour) {
        return next(new AppErrorTour(`No tour found with the given ID: ${req.params.id}`, 404));
    }
    res.status(204).json({
        status: 'success',
        responseTime: Date.now() - req.requestTime,
        results: 0,
        data: null
    });
}));
exports.getTourStats = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const stats = yield TourModel.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 }
        }
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    });
}));
exports.getMonthlyPlan = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const year = req.params.year * 1;
    const plan = yield TourModel.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numToursStart: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: { numToursStart: -1 }
        },
        {
            $limit: 12
        }
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    });
}));
