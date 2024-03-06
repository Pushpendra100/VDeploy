const express = require("express");
const router = express.Router();

const {
  createProject,
  getProjectDetails,
  projectDeploy,
  projectDeployments,
  getDeploymentDetails,
  getDeploymentLogs,
  setDeploymentStatus,
  setProjectStatus,
  setProjectDeploymentOff,
  deleteProject,
} = require("../controllers/projectController");
const { isAuthenticated } = require("../middleware/auth");

router.route("/create-project").post(isAuthenticated, createProject);
router.route("/project/:id").get(isAuthenticated, getProjectDetails);
router.route("/project/:id/deploy").get(isAuthenticated, projectDeploy);
router
  .route("/project/:id/deployments")
  .get(isAuthenticated, projectDeployments);
router.route("/deployment/:id").get(isAuthenticated, getDeploymentDetails);
router.route("/deployment/:id/logs").get(isAuthenticated, getDeploymentLogs);
router.route("/deployment/:id").put(isAuthenticated, setDeploymentStatus )
router.route("/project/:id").put(isAuthenticated, setProjectStatus )
router.route("/project/deployment/off/:projectId").get(isAuthenticated, setProjectDeploymentOff )
router.route("/project/:id").delete(isAuthenticated, deleteProject )

module.exports = router;
