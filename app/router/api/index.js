const homeController = require('../../http/controllers/api/home.controller');
const { VerifyAccessToken } = require('../../http/middlewares/verifyAccessToken');
const router = require('express').Router();
/**
 * @swagger
 * tags:
 *  name: IndexPage
 *  description: Index page route and data
 */
/**
 * @swagger
 * /:
 *  get:
 *      summary: index of routes
 *      tags: [IndexPage]
 *      description: get all data for index page
 *      parameters:
 *          -   in: header
 *              name: accessç-token
 *              example: Bearer YourToken...
 *      responses:
 *          200:
 *              description: Success
 *          404:
 *              description: Not Found
 */
router.get("/", VerifyAccessToken,homeController.indexPage);
module.exports = {
    HomeRoutes: router
}