import React from "react";

// Creative, classy glass background using animated gradients and subtle floating "beams"
// No Lottie, just modern CSS and a touch of elegant movement

function BeamsBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none select-none">
      {/* Primary gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/30 via-yellow-100/10 to-purple-700/20 blur-2xl" />
      
      {/* Soft, animated, floating beams */}
      <div
        className="absolute left-[-10vw] top-[10vh] w-[60vw] h-[30vh] rounded-full bg-yellow-300/25 blur-[100px] animate-azora-beam1"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="absolute right-[-15vw] bottom-[5vh] w-[50vw] h-[24vh] rounded-full bg-cyan-400/20 blur-[80px] animate-azora-beam2"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute left-[30vw] top-[60vh] w-[40vw] h-[16vh] rounded-full bg-purple-500/15 blur-[70px] animate-azora-beam3"
        style={{ animationDelay: "4s" }}
      />

      {/* Subtle shimmer line */}
      <div className="absolute left-1/4 top-1/2 w-1/2 h-2 bg-gradient-to-r from-yellow-300/0 via-yellow-200/70 to-yellow-300/0 opacity-40 rounded-xl blur-2xl animate-azora-shimmer" />
    </div>
  );
}

export default BeamsBackground;
