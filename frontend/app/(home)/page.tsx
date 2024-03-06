import Link from "next/link";

export default function HomePage() {

  return (
    <main className="w-[100vw] h-[100vh] flex flex-col justify-center items-center ">
      <h1 className="text-9xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-600 select-none ">
        VDeploy
      </h1>
      <p className="text-center mt-[4rem] text-gray-300 tracking-wider">
        Web Application for deploying your code <br /> so that you can focus on
        writing code instead of deploying !
      </p>
      <div className="relative mt-[3rem] group">
        <div className="absolute -inset-0.5 rounded-lg blur opacity-75 bg-gradient-to-br from-pink-600 to-purple-700 group-hover:-inset-1 group-hover:opacity-100 transition duration-500"></div>
        <Link href="/register">
          <button className=" relative text-gray-300 group-hover:text-gray-100 px-7 py-4 bg-black rounded-lg leading-none ">
            Get Started &rarr;
          </button>
        </Link>
      </div>
    </main>
  );
}
