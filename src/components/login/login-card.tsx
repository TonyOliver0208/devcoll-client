"use client";

import { Button } from "../ui/button";
import { signIn } from "next-auth/react";
import Image from "next/image";

function LoginCard() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-4 transition-all duration-300">
      <div className="space-y-4">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-800">
            Welcome to DevColl
          </h3>
          <p className="mt-3 text-gray-500">
            Sign in with your Google or GitHub account to join the developer
            community
          </p>
        </div>
        <div className="space-y-3">
          <Button
            variant="outline"
            className={`
              w-full h-12 flex items-center justify-center gap-3 
              bg-white text-gray-700 border border-gray-300
              hover:bg-gray-50 hover:border-blue-200 hover:shadow-md
              transition-all duration-200
              group transform hover:scale-[1.01] active:scale-[0.98]
            `}
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            <div className="flex items-center justify-center">
              <Image
                src="/google.svg"
                alt="Google"
                width={18}
                height={18}
                className="w-[18px] h-[18px]"
              />
            </div>
            <span className="font-medium">Continue with Google</span>
          </Button>

          <Button
            variant="outline"
            className={`
              w-full h-12 flex items-center justify-center gap-3 
              bg-[#24292F] text-white border-[#24292F]
              hover:bg-[#31373D] hover:border-[#31373D] hover:shadow-md
              transition-all duration-200
              group transform hover:scale-[1.01] active:scale-[0.98]
            `}
            onClick={() => signIn("github", { callbackUrl: "/" })}
          >
            <Image
              src="/github-mark-white.svg"
              alt="GitHub"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            <span className="font-medium">Continue with GitHub</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default LoginCard;
