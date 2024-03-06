"use client";
import { useContext } from "react";
import { FaRegFolderOpen } from "react-icons/fa";
import { MdOutlineCreateNewFolder } from "react-icons/md";
import { IoLogOutOutline } from "react-icons/io5";
import Link from "next/link";
import { logout } from "@/actions";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <nav className="absolute bottom-16 right-10 bg-[#b1aebb] flex justify-center items-center h-17 w-[17vw] py-1 rounded-full gap-2 ">
      <Link
        href="/user/projects"
        className="hover:bg-[#969599] rounded-full p-4 group relative"
      >
        <FaRegFolderOpen className="text-secondary-foreground" size={30} />
        <span className="absolute bottom-[4.2rem] right-1 scale-0 rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100">
          Projects
        </span>
      </Link>
      <Link
        href="/user/create-project"
        className="hover:bg-[#969599] rounded-full p-4 group relative"
      >
        <MdOutlineCreateNewFolder
          className="text-secondary-foreground"
          size={30}
        />
        <span className="absolute bottom-[4.2rem] right-2 scale-0 rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100">
          Create
        </span>
      </Link>
      <button
        className="hover:bg-[#969599] rounded-full p-4 group relative"
        onClick={handleLogout}
      >
        <IoLogOutOutline className="text-secondary-foreground" size={30} />
        <span className="absolute bottom-[4.2rem] right-2 scale-0 rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100">
          Logout
        </span>
      </button>
    </nav>
  );
}
