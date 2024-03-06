import axios, { InternalAxiosRequestConfig } from "axios";

interface UserDetailsRegister {
  name: string;
  email: string;
  password: string;
}

interface UserDetailsLogin {
  email: string;
  password: string;
}

interface CreateProject {
  name: string;
  gitURL: string;
}

const base_url = "http://localhost:9000";

const config = {
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
};

const API = axios.create({ baseURL: base_url, withCredentials: true });
API.interceptors.request.use(
  (req: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const item = localStorage.getItem("user_info");
    if (item) {
      const userInfo = JSON.parse(item);
      req.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return req;
  }
);

export const signInGoogle = async (accessToken: string) => {
  try {
    const { data } = await API.post("/api/v1/login", {
      googleAccessToken: accessToken,
    });
    return { result: data.success, message: "Login success" };
  } catch (error) {
    console.log(error);
    return { result: false, message: "Login Failed" };
  }
};

export const signUpGoogle = async (accessToken: string) => {
  try {
    const { data } = await API.post("/api/v1/register", {
      googleAccessToken: accessToken,
    });
    return { result: data.success, message: "Registration success" };
  } catch (error) {
    console.log(error);
    return {
      result: false,
      message:
        "Registration Failed, account already exist with the given email",
    };
  }
};

export async function register({ name, email, password }: UserDetailsRegister) {
  try {
    const { data } = await axios.post(
      `${base_url}/api/v1/register`,
      { name, email, password },
      config
    );
    return { result: data.success, message: "Registration Success " };
  } catch (error) {
    console.log(error);
    return {
      result: false,
      message:
        "Registration Failed, account already exist with the given email ",
    };
  }
}

export async function login({ email, password }: UserDetailsLogin) {
  try {
    console.log(email);
    const { data } = await axios.post(
      `${base_url}/api/v1/login`,
      { email, password },
      config
    );
    return { result: data.success, message: "Login Success " };
  } catch (error) {
    console.log(error);
    return { result: false, message: "Login Failed" };
  }
}

export async function userDetails() {
  try {
    const { data } = await axios.get(`${base_url}/api/v1/user`, config);
    return data.success;
  } catch (error) {
    console.log(error);
  }
}

export async function logout() {
  try {
    const { data } = await axios.get(`${base_url}/api/v1/logout`, config);
    return data.success;
  } catch (error) {
    console.log(error);
  }
}

export async function getUserProjects() {
  try {
    const { data } = await axios.get(`${base_url}/api/v1/projects`, config);
    return data.userProjects;
  } catch (error) {
    console.log(error);
  }
}

export async function createProject({ name, gitURL }: CreateProject) {
  try {
    const { data } = await axios.post(
      `${base_url}/api/v1/create-project`,
      { name, gitURL },
      config
    );
    return data;
  } catch (error) {
    console.log(error);
  }
}

export async function getProjectDetails(projectId: string | string[]) {
  try {
    const { data } = await axios.get(
      `${base_url}/api/v1/project/${projectId}`,
      config
    );
    return data.project;
  } catch (error) {
    console.log(error);
  }
}

export async function getProjectDeployments(projectId: string | string[]) {
  try {
    const { data } = await axios.get(
      `${base_url}/api/v1/project/${projectId}/deployments`,
      config
    );
    return data.deployments;
  } catch (error) {
    console.log(error);
  }
}

export async function projectDeploy(projectId: string | string[]) {
  try {
    const { data } = await axios.get(
      `${base_url}/api/v1/project/${projectId}/deploy`,
      config
    );
    return data.data.deploymentId;
  } catch (error) {
    console.log(error);
  }
}

export async function getDeploymentDetails(deploymentId: string | string[]) {
  try {
    const { data } = await axios.get(
      `${base_url}/api/v1/deployment/${deploymentId}`,
      config
    );
    return data.deployment;
  } catch (error) {
    console.log(error);
  }
}
export async function getDeploymentLogs(deploymentId: string | string[]) {
  try {
    const { data } = await axios.get(
      `${base_url}/api/v1/deployment/${deploymentId}/logs`,
      config
    );
    const logsList = data?.logs;
    if (logsList.length) {
      const lstStr = logsList[logsList.length - 1].log;
      const lstSecStr = logsList[logsList.length - 2].log;
      if (
        lstStr === "Done..." ||
        lstStr.slice(0, 8) === "uploaded" ||
        lstSecStr === "Done..." ||
        lstSecStr.slice(0, 8) === "uploaded"
      ) {
        const resp = await axios.put(
          `${base_url}/api/v1/deployment/${deploymentId}`,
          { status: "READY" },
          config
        );
        await axios.put(
          `${base_url}/api/v1/project/${resp.data.deployment.projectId}`,
          { status: "LIVE" },
          config
        );
        return { logs: data.logs, deployment: resp.data.deployment };
      }
    }
    return { logs: data.logs, deployment: null };
  } catch (error) {
    console.log(error);
  }
}
export async function setDeploymentFailed(deploymentId: string | string[]) {
  try {
    const resp = await axios.put(
      `${base_url}/api/v1/deployment/${deploymentId}`,
      { status: "FAIL" },
      config
    );
    await axios.put(
      `${base_url}/api/v1/project/${resp.data.deployment.projectId}`,
      { status: "NOT_LIVE" },
      config
    );
    return { deployment: resp.data.deployment };
  } catch (error) {
    console.log(error);
  }
}

export async function deploymentOff(projectId: string | string[]) {
  try {
    const resp = await axios.get(
      `${base_url}/api/v1/project/deployment/off/${projectId}`,
      config
    );
    const resp2 = await axios.get(
      `${base_url}/api/v1/project/${projectId}/deployments`,
      config
    );
    return { project: resp.data.project, deployments: resp2.data.deployments };
  } catch (error) {
    console.log(error);
  }
}

export async function deleteProject(projectId: string | string[]) {
  try {
    const resp = await axios.delete(
      `${base_url}/api/v1/project/${projectId}`,
      config
    );

    return {success: resp.data.success};
  } catch (error) {
    console.log(error);
  }
}
