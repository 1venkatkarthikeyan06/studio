import React from 'react';

export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="1em"
      height="1em"
      {...props}
    >
      <g fill="currentColor">
        <path
          d="M168,100a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,100Zm-8,20H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Z"
          opacity="0.2"
        />
        <path
          d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z"
          fill="currentColor"
          opacity="0.2"
        />
        <path
          d="M128,32a96,96,0,1,0,96,96A96.11,96.11,0,0,0,128,32Zm0,176a80,80,0,1,1,80-80A80.09,80.09,0,0,1,128,208Z"
          fill="currentColor"
        />
        <path
          d="M176,92H80a8,8,0,0,0,0,16h96a8,8,0,0,0,0-16Z"
          fill="currentColor"
        />
        <path
          d="M176,116H80a8,8,0,0,0,0,16h96a8,8,0,0,0,0-16Z"
          fill="currentColor"
        />
        <path
          d="M148,140H116a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}
