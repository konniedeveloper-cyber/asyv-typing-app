"use client";

const rainbowBorderStyles = `
  @keyframes border-glow-rotate {
    0% {
      box-shadow: 0 0 20px rgba(100, 200, 255, 0.5), 
                  inset 0 0 20px rgba(100, 200, 255, 0.1);
    }
    25% {
      box-shadow: 0 0 20px rgba(150, 100, 255, 0.5), 
                  inset 0 0 20px rgba(150, 100, 255, 0.1);
    }
    50% {
      box-shadow: 0 0 20px rgba(255, 100, 150, 0.5), 
                  inset 0 0 20px rgba(255, 100, 150, 0.1);
    }
    75% {
      box-shadow: 0 0 20px rgba(100, 255, 200, 0.5), 
                  inset 0 0 20px rgba(100, 255, 200, 0.1);
    }
    100% {
      box-shadow: 0 0 20px rgba(100, 200, 255, 0.5), 
                  inset 0 0 20px rgba(100, 200, 255, 0.1);
    }
  }
  
  .gradient-glow-wrapper {
    position: relative;
    width: fit-content;
  }
  
  .gradient-border-inner {
    position: relative;
    z-index: 2;
    border-radius: 9999px;
    animation: border-glow-rotate 4s ease-in-out infinite;
  }
  
  .gradient-glow-wrapper.light .gradient-border-inner {
    animation: border-glow-rotate 4s ease-in-out infinite;
  }
`;

export function RainbowNavWrapper({ children, className = "", isDark = false }) {
  return (
    <>
      <style>{rainbowBorderStyles}</style>
      <div className={className}>
        <div className={`gradient-glow-wrapper ${!isDark ? 'light' : ''}`}>
          <div className="gradient-border-inner">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

export { rainbowBorderStyles };
