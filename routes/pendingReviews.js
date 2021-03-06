const express = require('express');
const router = express();
router.use(express.json());

const auth = require('../middleware/authorizationMiddleware.js');
const isOwner = require('../middleware/checkIfOwnerMiddleware');
const findRestaurant = require('../middleware/findRestaurantOfOwnerMiddleware.js');
const updateRating = require('../middleware/updateRatingMiddleware.js');


const Restaurant = require('../models/restaurant.js');
const Menu = require('../models/menu.js');
const MenuReview = require('../models/menuReview.js');
const ItemReview = require('../models/itemReview.js');
const MenuItem = require('../models/menuItem.js');


const PENDING='Pending';
const APPROVED='Approved';
const DISAPPROVED='Disapproved';

const AWS_IMAGE_STORAGE = "https://the-spoon.s3.eu-central-1.amazonaws.com/";


//Return pending reviews
router.get('/', auth, isOwner, findRestaurant, async (req, res) => {
//     console.log('In GET /api/user/owner/restaurant/review')

    try {
        const username = req.username;

        const reviews = await MenuReview.findAll({
            where: {
                Status: PENDING
            },
            include: [{
                model: Menu,
                include: [{
                    model: Restaurant,
                    where: {
                        Owner: username
                    }
                },
                    {
                        model: MenuItem
                    }]
            }]
        })

        //build response
        let response = formatReviews(reviews);

        res.status(200).send(response);
    }catch (error) {
        res.status(500).send('Internal server error');
    }
});

//Approve or disapprove pending review
router.post('/:reviewID', auth, isOwner, findRestaurant, async (req, res) => {
    try {
        const username = req.username;
        const reviewID = req.params.reviewID;
        const status = req.body.isApproved? 'Approved' : 'Disapproved';

        //check if the review is regarding to logged in owner's restaurant
        const ownerReviewCheck= await MenuReview.findOne({
            where: {
                Review_ID: reviewID,
                Status: PENDING
            },
            include: [{
                model: Menu,
                include: [{
                    model: Restaurant
                }]
            }]
        });

        if(!ownerReviewCheck) res.status(404).send('Review with given reviewID not found');

        const reviewRestaurantOwner = ownerReviewCheck.Menu.Restaurant.Owner;
        if(reviewRestaurantOwner != username) res.status(403).send('Forbidden request');

        await MenuReview.update({
                Status: status},
            {
                where: {
                    Review_ID: reviewID
                }
            });

        let itemReviews = await ItemReview.findAll({
            attributes: ['MI_ID', 'Review_ID'],
            where: {
                MenuReview_ID: ownerReviewCheck.Review_ID
            }
        });
        console.log('itemreviews[0]: ' + itemReviews[0]);
        for (let i = 0; i < itemReviews.length; i++) {
            await ItemReview.update({
                Status: status
            },
                {
                    where: {
                        Review_ID: itemReviews[i].Review_ID
                    }
                })
        }
        itemReviews = await itemReviews.map(async r => {
            return {menuItemID: r.MI_ID}
        });

        if (status === APPROVED) {
            const menuID = {Menu_ID: ownerReviewCheck.Menu_ID}
            await updateRating(itemReviews, menuID)
        }

        //get pending reviews
        const reviews = await MenuReview.findAll({
            where: {
                Status: PENDING
            },
            include: [{
                model: Menu,
                include: [{
                    model: Restaurant,
                    where: {
                        Owner: username
                    }
                },
                    {
                        model: MenuItem
                    }]
            }]
        });

        //build response
        let response = formatReviews(reviews);

        res.status(201).send(response);
    }catch (error) {
        res.status(500).send('Internal server error');
    }
});

const formatReviews = (reviewArr) => {
    let reviews=[];
    for (let i = 0; i < reviewArr.length; i++) {
        //skip menus that don't belong to the owner
        if(!reviewArr[i].Menu){
            continue;
        }

        let reviewID = reviewArr[i].Review_ID;
        let menuName = reviewArr[i].Menu.Name;
        let receiptPhotoLink = AWS_IMAGE_STORAGE + reviewArr[i].Image_ID;
        let menuItemNames = [];

        for (let j = 0; j < reviewArr[i].Menu.MenuItems.length; j++) {
            let menuItemName = reviewArr[i].Menu.MenuItems[j].Name;

            let itemName = {
                menuItemName: menuItemName
            }
            menuItemNames.push(itemName);
        }

        let review = {
            reviewID: reviewID,
            receiptPhotoLink: receiptPhotoLink,
            menuName: menuName,
            menuItemNames: menuItemNames
        };
        reviews.push(review);

    }
    return reviews;
};

module.exports = router;