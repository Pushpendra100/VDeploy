"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  getDeploymentDetails,
  getDeploymentLogs,
  setDeploymentFailed,
} from "@/actions";

type deploymentDetailsType = {
  id: string;
  projectId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type logType = {
  event_id: string;
  deployment_id: string;
  log: string;
  timestamp: string;
};

export default function DeploymentPage() {
  const params = useParams();

  const [deploymentDetails, setDeploymentDetails] =
    useState<deploymentDetailsType | null>();
  const [logs, setLogs] = useState<logType[]>([]);

  useEffect(() => {
    const get_data = async () => {
      const result = await getDeploymentDetails(params.deploymentId);
      setDeploymentDetails(result);
    };
    get_data();
  }, []);

  useEffect(() => {
    const logLenMap = new Map();

    const intervalId = setInterval(get_data, 3000);

    async function get_data() {
      const data = await getDeploymentLogs(params.deploymentId);

      const len = data?.logs.length;
      if (logLenMap.get(len)) logLenMap.set(len, logLenMap.get(len) + 1);
      else logLenMap.set(len, 1);

      if (data && data.logs) setLogs(data.logs);
      if (data && data.deployment) {
        setDeploymentDetails(data.deployment);
        clearInterval(intervalId);
      }

      if (data && logLenMap.get(data.logs.length) > 20) {
        const data1 = await setDeploymentFailed(params.deploymentId);
        setDeploymentDetails(data1?.deployment);
        clearInterval(intervalId);
      }
    }

    return () => clearInterval(intervalId);
  }, []);

  return (
    <main className="flex flex-row w-[100vw] h-[100vh]">
      <div className="flex w-[65vw] py-7 px-10  ">
        <div className=" w-[73%] border-t border-b border-gray-700 py-2 px-5 overflow-y-scroll no-scrollbar ">
          {!logs.length && (
            <div className="w-[100%] h-[100%] flex items-center justify-center text-gray-500 ">
              Loading...
            </div>
          )}
          {logs &&
            logs.map((log, i) => (
              <div
                className="bg-gradient-to-r from-gray-900 p-2 my-2 hover:from-gray-800"
                key={i}
              >
                <p className="text-emerald-500 w-[100%]">
                  <span className="text-gray-300">Log:</span> {log.log}
                </p>
                <p className="text-emerald-500 w-[100%]">
                  <span className="text-gray-300">Timestamp: </span>
                  {log.timestamp}
                </p>
              </div>
            ))}
        </div>
      </div>
      <div className="flex flex-col w-[35vw] h-[100vh] py-7 px-10 text-right">
        {deploymentDetails && (
          <>
            <h1 className="text-3xl italic font-semibold">Deployment</h1>
            <div className=" flex flex-row items-center justify-end gap-3 mt-[2rem] cursor-pointer">
              <p className="w-[80%] truncate text-gray-400 ">
                {deploymentDetails.id}
              </p>
              <span className="text-gray-300">Id</span>
            </div>
            <p className=" text-gray-300 mt-[1rem] flex flex-row gap-3 justify-end items-center ">
              {" "}
              <span className="text-gray-400">
                {deploymentDetails.createdAt.split("T")[0]}{" "}
                {deploymentDetails.createdAt.split("T")[1].slice(0, 8)}
              </span>{" "}
              <span>Deployed on</span>
            </p>
            <p className=" text-gray-300 mt-[1rem] flex flex-row gap-3 justify-end items-center ">
              {" "}
              <span className="text-gray-400">
                {deploymentDetails.status}
              </span>{" "}
              <span>Status</span>
            </p>
            {deploymentDetails && deploymentDetails.status != "QUEUED" ? (
              <Link href={`/user/project/${deploymentDetails.projectId}`}>
                <p className=" text-sky-600 mt-[1rem] italic flex flex-row gap-3 justify-end items-center ">
                  Go to project &rarr;
                </p>
              </Link>
            ) : (
              <></>
            )}
          </>
        )}
      </div>
    </main>
  );
}
