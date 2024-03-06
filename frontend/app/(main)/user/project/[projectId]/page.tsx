"use client";
import { RiGithubLine } from "react-icons/ri";
import { FaLink } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

import {
  deleteProject,
  deploymentOff,
  getProjectDeployments,
  getProjectDetails,
  projectDeploy,
} from "@/actions";
import { AlertDialogComp } from "@/components/AlertDialogComp";

type deploymentCardType = {
  id: string;
  createdAt: string;
  status: string;
};

type projectDetailsType = {
  id: string;
  name: string;
  gitURL: string;
  subDomain: string;
  customDomain: null;
  status: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams();

  const [project, setProject] = useState<projectDetailsType | null>();
  const [deployments, setDeployments] = useState<deploymentCardType[] | null>();
  const [loading, setLoading] = useState<boolean>(true);
  const [deployLoading, setDeployLoading] = useState<boolean>(false);

  useEffect(() => {
    const get_data = async () => {
      const result1 = await getProjectDetails(params.projectId);
      setProject(result1);
      const result2 = await getProjectDeployments(params.projectId);
      setDeployments(result2);
      setLoading(false);
    };
    get_data();
  }, []);

  const handleDeploy = async () => {
    setDeployLoading(true);
    const deploymentId = await projectDeploy(params.projectId);
    if (deploymentId) router.push(`/user/deployment/${deploymentId}`);
  };
  const handleDeployOff = async () => {
    const result = await deploymentOff(params.projectId);
    setProject(result?.project);
    const result2 = await getProjectDeployments(params.projectId);
    setDeployments(result2);
  };
  const handleDelete = async () => {
    const result = await deleteProject(params.projectId);
    if (result?.success) router.push("/user/projects");
  };

  return (
    <main className="flex flex-row w-[100vw] h-[100vh]">
      <div className="flex flex-auto py-7 px-10  ">
        <div className=" w-[73%] border-t border-b border-gray-700 py-2 px-5 overflow-y-scroll no-scrollbar ">
          {loading ? (
            <>
              <div className="w-[100%] h-[100%] flex items-center justify-center text-gray-500 ">
                Loading...
              </div>
            </>
          ) : (
            <>
              {deployments && deployments.length ? (
                <>
                  {deployments.map((deployment, i) => (
                    <Link href={`/user/deployment/${deployment.id}`} key={i}>
                      <div className="bg-gradient-to-r from-gray-900 p-2 my-2 hover:from-gray-800">
                        <h5 className="font-medium">Id: {deployment.id}</h5>
                        <p className="text-gray-500 w-[70%] truncate">
                          Deployed on: {deployment.createdAt}
                        </p>
                        <p className="text-gray-500 w-[70%] truncate">
                          Status: {deployment.status}
                        </p>
                      </div>
                    </Link>
                  ))}
                </>
              ) : (
                <div className="w-[100%] h-[100%] flex justify-center items-center text-gray-500 ">
                  No Deployments
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col w-[35vw] h-[100vh] py-7 px-10 text-right">
        {project && (
          <>
            <h1 className="text-3xl italic font-semibold">{project.name}</h1>
            <Link href={project.gitURL} target="_blank">
              <div className=" flex flex-row items-center justify-end gap-3 mt-[2rem] cursor-pointer group">
                <p className="w-[80%] truncate  text-gray-400 group-hover:text-sky-500 ">
                  {project.gitURL}
                </p>
                <span className="text-gray-300 group-hover:text-sky-500">
                  <RiGithubLine className="text-2xl" />
                </span>
              </div>
            </Link>
            {project && project.status == "LIVE" ? (
              <>
                <Link
                  href={`http://${project.subDomain}.localhost:8000/`}
                  target="_blank"
                >
                  <div className=" flex flex-row items-center justify-end gap-3 mt-[1rem] cursor-pointer group">
                    <p className="w-[80%] truncate text-gray-400 group-hover:text-sky-500 ">{`http://${project.subDomain}.localhost:8000/`}</p>
                    <span className="text-gray-300 group-hover:text-sky-500">
                      <FaLink className="text-2xl" />
                    </span>
                  </div>
                </Link>
              </>
            ) : (
              <></>
            )}
            <p className=" text-gray-300 mt-[1rem] flex flex-row gap-3 justify-end items-center ">
              {" "}
              <span className="text-gray-400">
                {project.updatedAt.split("T")[0]}{" "}
                {project.updatedAt.split("T")[1].slice(0, 8)}
              </span>{" "}
              <span>Last updated</span>
            </p>
            <button
              className="mt-[1rem]  ml-auto text-gray-300 group-hover:text-gray-100 px-[0.8rem] py-[0.8rem] bg-emerald-700 rounded-md leading-none hover:bg-emerald-600 hover:text-white transition duration-200 disabled:bg-gray-700 disabled:text-gray-500 "
              onClick={handleDeploy}
              disabled={project.status == "LIVE" ? true : false}
            >
              DEPLOY
            </button>

            <div className="mt-[3rem] ml-auto text-gray-300 group-hover:text-gray-100 flex gap-3 ">
              {project && project.status == "LIVE" && (
                <AlertDialogComp
                  name="OFF"
                  desc="This will shutdown your current deployment!"
                  handleFunc={handleDeployOff}
                />
              )}
              <AlertDialogComp
                name="DELETE"
                desc="This action will delete your project"
                handleFunc={handleDelete}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
