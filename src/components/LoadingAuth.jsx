export default function LoadingAuth() {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="spinner">
        <div className="bounce1" />
        <div className="bounce2" />
        <div className="bounce3" />
      </div>

      <style>{`
        .spinner {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .spinner > div {
          width: 14px;
          height: 14px;
          background-color: #ffffff;
          border-radius: 100%;
          display: inline-block;
          animation: sk-bouncedelay 1.4s infinite ease-in-out both;
        }
        .spinner .bounce1 { animation-delay: -0.32s; }
        .spinner .bounce2 { animation-delay: -0.16s; }
        @keyframes sk-bouncedelay {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}