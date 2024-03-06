"use client";
import { getUserProjects } from "@/actions";
import Link from "next/link";
import { useEffect, useState } from "react";

type projectType = {
  id: string;
  name: string;
  gitURL: string;
  subdomain: string;
  customDomain: null;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<projectType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const get_user_projects = async () => {
      const result = await getUserProjects();
      setProjects(result);
      setLoading(false);
    };
    get_user_projects();
  }, []);

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
              {projects && projects.length ? (
                <>
                  {projects.map((project, i) => (
                    <Link href={`/user/project/${project.id}`} key={i}>
                      <div className="bg-gradient-to-r from-gray-900 p-2 my-2 hover:from-gray-800">
                        <h5 className="font-medium">{project.name}</h5>
                        <p className="text-gray-500 w-[70%] truncate">
                          Github url: {project.gitURL}
                        </p>
                        <p className="text-gray-500 w-[70%] truncate">
                          Last updated on: {project.updatedAt.split("T")[0]}
                        </p>
                      </div>
                    </Link>
                  ))}
                </>
              ) : (
                <>
                  <div className="w-[100%] h-[100%] flex justify-center items-center text-gray-500 ">
                    No Projects
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col w-[35vw] h-[100vh] py-7 px-10">
        <h1 className="text-8xl italic font-semibold text-right">Projects</h1>
      </div>
    </main>
  );
}
