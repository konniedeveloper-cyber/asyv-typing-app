"use client";
import { UserIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  const cardStyle = {
    display: "flex",
    width: "300px",
    height: "45px",
    backgroundColor: "#1e293b",
    borderRadius: "30px",
    paddingInline: "20px",
    position: "relative",
    justifyContent: "space-around",
    alignItems: "center",
    margin: "0.8rem auto",
    border: "5px solid #334155",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  };

  const socialIconStyle = {
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    color: "#94a3b8",
  };

  const svgStyle = {
    height: "24px",
    width: "24px",
  };

  return (
    <footer
      style={{
        textAlign: "center",
        padding: "2rem 1rem",
        background:
          "linear-gradient(90deg, rgba(15, 23, 42, 1) 28%, rgba(30, 41, 59, 1) 100%)",
        borderTop: "0px solid #334155",
      }}
    >
      <p
        style={{
          fontSize: "0.9rem",
          color: "#059669",
          marginBottom: "1.5rem",
          lineHeight: "1.5",
        }}
      >
        © 2024 Typing Test. All rights reserved.{" "}
        {/*link is writtten badly i have to work on it*/} 
        <a
          href="https://portifolio-of.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          style={{ 
            color: "#059669", 
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem"
          }}
        > 
          
          <span style={{ 
            color: "white", 
            textDecoration: "underline",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem"
          }}>
            <UserIcon style={{ width: "20px", height: "20px", color: "white" }} />
            David's portfolio
          </span>{" "}
          as developer.
        </a>
      </p>

      {/* Social Card */}
      <div style={cardStyle}>
        {/* YouTube */}
        <a href="https://www.youtube.com/@IshimweDavid-j9d" target="_blank" rel="noopener noreferrer" style={{ ...socialIconStyle, textDecoration: "none" }}>
          <svg
            fill="#F61C0D"
            viewBox="0 0 461.001 461.001"
            xmlns="http://www.w3.org/2000/svg"
            style={svgStyle}
          >
            <path
              d="M365.257,67.393H95.744C42.866,67.393,0,110.259,0,163.137v134.728
              c0,52.878,42.866,95.744,95.744,95.744h269.513c52.878,0,95.744-42.866,95.744-95.744V163.137
              C461.001,110.259,418.135,67.393,365.257,67.393z M300.506,237.056l-126.06,60.123
              c-3.359,1.602-7.239-0.847-7.239-4.568V168.607c0-3.774,3.982-6.22,7.348-4.514l126.06,63.881
              C304.363,229.873,304.298,235.248,300.506,237.056z"
              fill="#F61C0D"
            ></path>
          </svg>
        </a>

        {/* GitHub */}
        <a href="https://github.com/konniemavibes/" target="_blank" rel="noopener noreferrer" style={{ ...socialIconStyle, textDecoration: "none" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ ...svgStyle, color: "#e2e8f0" }}
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </a>

        {/* LinkedIn */}
        <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" style={{ ...socialIconStyle, textDecoration: "none" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="#0A66C2"
            style={svgStyle}
          >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
          </svg>
        </a>
      </div>
    </footer>
  );
}