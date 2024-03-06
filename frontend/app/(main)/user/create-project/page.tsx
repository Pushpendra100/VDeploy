"use client";
import { toast } from "react-toastify";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { createProject } from "@/actions";

export default function CreateProjectPage() {
  const router = useRouter();

  const [name, setName] = useState<string>("");
  const [gitURL, setGitURL] = useState<string>("");

  const handleCreateProject = async () => {
    if (!name || !gitURL) {
      toast.error("Please complete the fields !", {
        position: "top-center",
      });
      return;
    }
    var gitHubformat =
      /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)(?:\/)?$/;
    if (!gitURL.match(gitHubformat)) {
      toast.error("Incorrect GitHub Link !", {
        position: "top-center",
      });
      return;
    }
    const result = await createProject({ name, gitURL });

    router.push(`/project/${result.project.id}`);
  };

  return (
    <main className="flex flex-row w-[100vw] h-[100vh]">
      <div className="flex flex-auto py-7 px-10 ">
        <div className=" w-[70%] border-t border-b border-gray-700 py-2 flex flex-col gap-5 items-center justify-center">
          <input
            type="text"
            placeholder="Project's Name"
            className="bg-transparent broder-solid border-2 border-gray-700 py-3 px-3 w-[80%]"
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="url"
            placeholder="Githbub url"
            className="bg-transparent broder-solid border-2 border-gray-700 py-3 px-3 w-[80%]"
            onChange={(e) => setGitURL(e.target.value)}
          />
          <button
            className="bg-[#29154b] py-3 px-3 rounded-md w-[40%] mt-4 hover:bg-[#462a77] text-gray-400 hover:text-white font-medium"
            onClick={handleCreateProject}
          >
            Create
          </button>
        </div>
      </div>
      <div className="flex flex-col w-[35vw] h-[100vh] py-7 px-10">
        <h1 className="text-8xl italic w-[30vw] text-right font-semibold">
          Create Project
        </h1>
      </div>
    </main>
  );
}
