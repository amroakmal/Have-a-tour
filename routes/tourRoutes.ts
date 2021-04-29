import express from "express";
import {roles} from '../controllers/enum';
const router = express.Router();
// const authController = require('../controllers/authController');
import {protect, restrictTo} from '../controllers/authController';

const tourController = require('../controllers/tourController');

router.route('/top-5-cheap')
    .get(
        tourController.aliasTopTours,
        tourController.getAllTours
    );

router.route('/tour-stats')
    .get(tourController.getTourStats);

router.route('/monthly-plan/:year')
    .get(tourController.getMonthlyPlan);

router.route('/')
    .get(
        protect, 
        tourController.getAllTours
    )
    .post(tourController.createTour);

router.route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(
        protect,
        restrictTo(roles.ADMIN, roles.AMR),
        tourController.deleteTour
    );

module.exports = router;