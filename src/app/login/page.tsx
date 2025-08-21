import LoginCard from "@/components/login/login-card";
import Image from "next/image";

function Login() {
  return (
    <div className="min-h-screen relative">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://img.freepik.com/free-photo/laptop-with-glowing-screen-coding-night_1232-12323.jpg')",
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
        <Image
          src="https://res.cloudinary.com/da2j53n0s/image/upload/v1755807395/devcoll-logo_jj9yfo.png"
          alt="DevColl"
          width={90}
          height={30}
          priority
        />
      </div>
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <LoginCard />
      </div>
    </div>
  );
}

export default Login;
