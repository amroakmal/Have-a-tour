"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const enum_1 = require("../controllers/enum");
const router = express_1.default.Router();
// const authController = require('../controllers/authController');
const authController_1 = require("../controllers/authController");
const tourController = require('../controllers/tourController');
router.route('/top-5-cheap')
    .get(tourController.aliasTopTours, tourController.getAllTours);
router.route('/tour-stats')
    .get(tourController.getTourStats);
router.route('/monthly-plan/:year')
    .get(tourController.getMonthlyPlan);
router.route('/')
    .get(authController_1.protect, tourController.getAllTours)
    .post(tourController.createTour);
router.route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(authController_1.protect, authController_1.restrictTo(enum_1.roles.ADMIN, enum_1.roles.AMR), tourController.deleteTour);
module.exports = router;
