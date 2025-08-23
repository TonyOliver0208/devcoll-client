"use client";

import LoginCard from "@/components/login/login-card";
import Image from "next/image";
import Link from "next/link";

function Login() {
  return (
    <div className="min-h-screen relative">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://www.featurebase.app/images/redesign2/community.jpg')",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.8), rgba(0,0,0,0.4), rgba(0,0,0,0.8))",
        }}
      />
      <div className="absolute top-4 left-4 z-10">
        <Link
          href="/"
          className="block transform transition-transform duration-100 hover:opacity-80 active:scale-95"
        >
          <Image
            src="https://res.cloudinary.com/da2j53n0s/image/upload/v1755887393/devColl-logo_2_aakdov.png"
            alt="DevColl"
            width={90}
            height={30}
            priority
            className="cursor-pointer"
          />
        </Link>
      </div>
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <LoginCard />
      </div>
    </div>
  );
}

export default Login;
