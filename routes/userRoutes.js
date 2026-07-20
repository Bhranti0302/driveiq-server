const express = require("express");
const router = express.Router();

const {
  createDealer,
  updateUserProfile,
  deleteUserAccount,
  getAllDealers,
  getAllUsers,
  updateDealerByAdmin,
  deleteDealerByAdmin,
  updateOwnDealerProfile,
  deleteOwnDealerAccount
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const { restrictTo } = require("../middlewares/roleMiddleware");


// User

// ******************************************************//

// Role => Admin(can see all user) -> Get All User
router.get("/users", protect, restrictTo("admin"), getAllUsers);

// Role => User(can update own profile) -> User updates profile
router.put("/profile", protect, updateUserProfile);

// Role => User(can delete own account) -> User deletes account
router.delete("/delete-account", protect, deleteUserAccount);

// ******************************************************//

// Dealer create, update, delete by admin

// ******************************************************//

// Role => Admin(can see all dealers) -> Get All Dealer
router.get("/dealers", protect, restrictTo("admin"), getAllDealers);

// Role => Admin(can create dealers) -> Create Dealer
router.post("/create-dealer", protect, restrictTo("admin"), createDealer);

// Role => Admin(can update dealers) -> Update Dealer
router.put("/:id", protect, restrictTo("admin"), updateDealerByAdmin);

// Role => Admin(can delete dealers) -> Delete Dealer
router.delete("/:id", protect, restrictTo("admin"), deleteDealerByAdmin);

// ******************************************************//

// logged dealer can update own dealer profile

// ******************************************************//

// Role => Dealer(can update own profile) -> Dealer updates profile
router.put("/dealer/profile", protect, updateOwnDealerProfile);

// Role => Dealer(can delete own account) -> Dealer deletes account
router.delete("/dealer/delete-account", protect, deleteOwnDealerAccount);

module.exports = router;