"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGoogleLogin, TokenResponse } from "@react-oauth/google";
import { FaGoogle } from "react-icons/fa";

import { register, signUpGoogle } from "@/actions";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  async function handleGoogleRegistrationSuccess(tokenResponse: TokenResponse) {
    const accessToken = tokenResponse.access_token;
    const { result, message } = await signUpGoogle(accessToken);
    if (result) {
      console.log(true);
      router.push("/user/projects");
    } else {
      toast.error(message, {
        position: "top-center",
      });
    }
  }

  const register_google = useGoogleLogin({
    onSuccess: handleGoogleRegistrationSuccess,
  });

  const handleRegister = async () => {
    if (!name || !email || !password) {
      toast.error("Please complete the fields !", {
        position: "top-center",
      });
      return;
    }
    if (name.length < 2) {
      toast.error("Name should be min. 2 characters long !", {
        position: "top-center",
      });
      return;
    }
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!email.match(mailformat)) {
      toast.error("Incorrect email format !", {
        position: "top-center",
      });
      return;
    }
    if (password.length < 8) {
      toast.error("Password should be min. 8 characters long !", {
        position: "top-center",
      });
      return;
    }
    const { result, message } = await register({ name, email, password });
    if (result) {
      router.push("/user/projects");
    } else {
      toast.error(message, {
        position: "top-center",
      });
    }
  };

  return (
    <main className="flex flex-row w-[100vw] h-[100vh]">
      <div className="flex flex-auto py-7 px-10 ">
        <div className=" w-[73%] border-t border-b border-gray-700 py-2 px-5 flex flex-col gap-5 items-center justify-center">
          <input
            type="text"
            placeholder="Full name"
            className="bg-transparent broder-solid border-2 border-gray-700 py-3 px-3 w-[80%]"
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="bg-transparent broder-solid border-2 border-gray-700 py-3 px-3 w-[80%]"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password min. 8 characters"
            className="bg-transparent broder-solid border-2 border-gray-700 py-3 px-3 w-[80%]"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="bg-[#29154b] py-3 px-3 rounded-md w-[40%] mt-4 hover:bg-[#462a77] text-gray-400 hover:text-white font-medium"
            onClick={handleRegister}
          >
            Register
          </button>
          <button
            className="bg-[#29154b] py-3 px-3 rounded-md w-[40%] mt-2 hover:bg-[#462a77] text-gray-400 hover:text-white font-medium flex flex-row items-center justify-center gap-2"
            onClick={() => register_google()}
          >
            Register with Google <FaGoogle />
          </button>
        </div>
      </div>
      <div className="flex flex-col w-[35vw] h-[100vh] py-7 px-10">
        <h1 className="text-8xl italic w-[30vw] text-right font-semibold border-b-2 border-pink-600">
          Register
        </h1>
        <p className="mt-8 text-right text-gray-300">
          Already have an account?{" "}
          <Link href="/login" className="text-pink-600 italic">
            Login
          </Link>{" "}
        </p>
      </div>
    </main>
  );
}
