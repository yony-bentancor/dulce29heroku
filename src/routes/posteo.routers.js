const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const posteoController = require("../controllers/posteoController");

router.get("/posteo", posteoController.sPosteos);
router.get("/updateposteo:id", posteoController.posteoUpdate);
router.post("/refresh", posteoController.updatePosteo);

module.exports = router;
