// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const {handleErrors} = require("../utilities")
const validate = require('../utilities/inventory-validation')

// Route to build inventory by classification view
router.get("/type/:classificationId", handleErrors(invController.buildByClassificationId));

// Route to build inventory by vehicle view
router.get("/detail/:invId", handleErrors(invController.buildByInvId));

// Route to build broken page
router.get("/inventory/broken", handleErrors(invController.buildBrokenPage));

// Route to build inventory index
router.get("/", handleErrors(invController.buildManagement));
  
// Route to build add classification view
router.get("/add-classification", handleErrors(invController.buildAddclass));
  
// Process the new classification data
router.post("/add-classification", validate.classRules(), validate.checkClassData, handleErrors(invController.addClass));
  
// Route to build add vehicle view
router.get("/add-inventory", handleErrors(invController.buildAddvehicle));
  
// Process the new vehicle data
router.post("/add-inventory", validate.vehicleRules(), validate.checkVehicleData, handleErrors(invController.addVehicle));
  
// Build inventory management table inventory view
router.get("/getInventory/:classification_id", handleErrors(invController.getInventoryJSON));
  
//Route to edit inventory by id
router.get("/edit/:inv_id", handleErrors(invController.buildVehicleEdit));

// Post route /update
router.post("/update", validate.vehicleRules(), validate.checkVehicleUpdateData, handleErrors(invController.updateVehicle));

// Build vehicle deletion confirmation view
router.get("/delete/:inv_id", handleErrors(invController.buildVehicleDeleteConfirm));
  
// Post route /delete
router.post("/delete", handleErrors(invController.deleteVehicle));

module.exports = router;