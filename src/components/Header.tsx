import React, { useState, useEffect } from "react";
import { Wallet, Zap } from "lucide-react";
import { Button } from "./Button";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "border-b border-primary/10 bg-dark/80 backdrop-blur-xl"
          : "bg-transparent"
      }`}
      style={
        {
          "--header-glow-x": `${mousePosition.x}%`,
          "--header-glow-y": `${mousePosition.y}%`,
        } as React.CSSProperties
      }
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at var(--header-glow-x) var(--header-glow-y), rgba(0, 255, 163, 0.2), transparent 70%)`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 h-20 flex items-center justify-between relative">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 group">
            <Zap className="w-6 h-6 text-primary transition-all duration-300 group-hover:scale-125 group-hover:rotate-12" />
            <span
              className="text-2xl font-bold bg-gradient-to-r from-primary via-accent-blue to-primary bg-[length:200%_100%] bg-clip-text text-transparent animate-[text-shimmer_3s_linear_infinite] glitch-effect"
              data-text="TORNADO"
            >
              TORNADO
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="h-4 w-px bg-gradient-to-b from-primary/20 to-accent-blue/20" />
            <nav className="flex gap-6">
              {["Pool", "Stats", "Docs"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-sm text-gray-400 hover:text-primary transition-colors duration-300 relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-primary to-accent-blue group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-primary/10 to-accent-blue/10 text-primary hover:from-primary/20 hover:to-accent-blue/20 transition-all duration-300 cursor-default animate-pulse">
            Beta
          </span>

          <div className=" group relative overflow-hidden ">
            <div
              className=" absolute inset-0 bg-gradient-to-r from-primary/20 via-accent-blue/20 rounded-xl
                 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />

            <Button
              size="sm"
              className="flex items-center gap-2 group/connect relative overflow-hidden"
            >
              <div className="flex items-center justify-center gap-2">
                <Wallet
                  size={16}
                  className="transition-transform duration-300 group-hover/connect:scale-110"
                />
                <span className="relative z-10">Connect Wallet</span>
              </div>
            </Button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px">
          <div className="h-full w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-[pulse_4s_ease-in-out_infinite]" />
        </div>
      </div>
    </header>
  );
}
