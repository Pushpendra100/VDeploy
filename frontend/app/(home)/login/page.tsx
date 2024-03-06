"use client";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useGoogleLogin, TokenResponse } from "@react-oauth/google";
import { FaGoogle } from "react-icons/fa";

import { login, signInGoogle } from "@/actions";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  async function handleGoogleLoginSuccess(tokenResponse: TokenResponse) {
    const accessToken = tokenResponse.access_token;
    const { result, message } = await signInGoogle(accessToken);
    if (result) {
      router.push("/user/projects");
    } else {
      toast.error(message, {
        position: "top-center",
      });
    }
  }

  const login_google = useGoogleLogin({ onSuccess: handleGoogleLoginSuccess });

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please complete the fields !", {
        position: "top-center",
      });
      return;
    }
    const { result, message } = await login({ email, password });
    if (result) {
      console.log(true);
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
            type="email"
            placeholder="Email"
            className="bg-transparent broder-solid border-2 border-gray-700 py-3 px-3 w-[80%]"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="bg-transparent broder-solid border-2 border-gray-700 py-3 px-3 w-[80%]"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="bg-[#29154b] py-3 px-3 rounded-md w-[40%] mt-4 hover:bg-[#462a77] text-gray-400 hover:text-white font-medium"
            onClick={handleLogin}
          >
            Login
          </button>
          <button
            className="bg-[#29154b] py-3 px-3 rounded-md w-[40%] mt-2 hover:bg-[#462a77] text-gray-400 hover:text-white font-medium flex flex-row items-center justify-center gap-2"
            onClick={() => login_google()}
          >
            Login with Google <FaGoogle />
          </button>
        </div>
      </div>
      <div className="flex flex-col w-[35vw] h-[100vh] py-7 px-10">
        <h1 className="text-8xl italic w-[30vw] text-right font-semibold border-b-2 border-pink-600">
          Login
        </h1>
        <p className="mt-8 text-right text-gray-300">
          Don't have an account?{" "}
          <Link href="/register" className="text-pink-600 italic">
            Register
          </Link>{" "}
        </p>
      </div>
    </main>
  );
}
