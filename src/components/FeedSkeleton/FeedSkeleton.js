// src/components/FeedSkeleton/FeedSkeleton.js
import React from "react";

const FeedSkeleton = ({ count = 3, style = {} }) => {
  const skeletonItem = {
    backgroundColor: "#fff",
    border: "2px solid #2c2416",
    borderRadius: "8px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    boxShadow: "4px 4px 0 #2c2416",
    marginBottom: "20px",
    ...style,
  };

  const skeletonIcon = {
    width: "60px",
    height: "60px",
    backgroundColor: "#f0f0f0",
    borderRadius: "8px",
    flexShrink: 0,
    position: "relative",
    overflow: "hidden",
  };

  const skeletonContent = {
    flex: 1,
  };

  const skeletonLine = {
    height: "16px",
    backgroundColor: "#f0f0f0",
    borderRadius: "4px",
    marginBottom: "8px",
    position: "relative",
    overflow: "hidden",
  };

  const shimmer = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background:
      "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
    animation: "shimmer 1.5s infinite",
  };

  return (
    <>
      <style>
        {`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}
      </style>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} style={skeletonItem}>
          <div style={skeletonIcon}>
            <div style={shimmer}></div>
          </div>
          <div style={skeletonContent}>
            <div style={{ ...skeletonLine, width: "70%" }}>
              <div style={shimmer}></div>
            </div>
            <div style={{ ...skeletonLine, width: "100%", height: "14px" }}>
              <div style={shimmer}></div>
            </div>
            <div
              style={{
                ...skeletonLine,
                width: "30%",
                height: "12px",
                marginBottom: 0,
              }}
            >
              <div style={shimmer}></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default FeedSkeleton;
