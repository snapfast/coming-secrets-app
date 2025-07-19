export default function Header() {
  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl font-bold text-white drop-shadow-2xl mb-4 tracking-wider" style={{fontFamily: 'var(--font-cinzel-decorative)', textShadow: '0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.3)'}}>
        COMINGS{" "}
        <span 
          className="relative inline-block"
          style={{
            background: 'linear-gradient(90deg, white 0%, white 70%, black 80%, black 90%, white 100%)',
            backgroundSize: '300% 100%',
            backgroundPosition: '100% 0',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            animation: 'blackSplash 7s ease-out infinite'
          }}
        >
          SECRETS
        </span>
      </h1>
      <style jsx>{`
        @keyframes blackSplash {
          0% {
            background-position: 100% 0;
          }
          21% {
            background-position: -100% 0;
          }
          100% {
            background-position: 100% 0;
          }
        }
      `}</style>
      <p className="text-lg text-white/90 drop-shadow-md">
        Send time-locked messages that can only be opened on a{" "}
        <span className="text-yellow-300 font-bold italic transform rotate-2 inline-block bg-purple-900/30 px-2 py-1 rounded-lg border-2 border-dashed border-yellow-300/50 animate-pulse">
          comings
        </span>{" "}
        date
      </p>
    </div>
  );
}