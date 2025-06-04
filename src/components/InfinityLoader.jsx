export default function InfinityLoader() {
  return (
    <div className="flex items-center justify-center space-x-3">
      <svg
        viewBox="0 0 187.3 93.7"
        className="w-16 h-16" 
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Animated Path */}
        <path
          d="M93.9,46.4c9.3,9.5,13.8,17.9,23.5,17.9s17.5-7.8,17.5-17.5s-7.8-17.6-17.5-17.5c-9.7,0.1-13.3,7.2-22.1,17.1 
             c-8.9,8.8-15.7,17.9-25.4,17.9s-17.5-7.8-17.5-17.5s7.8-17.5,17.5-17.5S86.2,38.6,93.9,46.4z"
          stroke="#60A5FA"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="10"
          className="animate-infinity-dash"
          fill="none"
        />

        {/* Faint background path */}
        <path
          d="M93.9,46.4c9.3,9.5,13.8,17.9,23.5,17.9s17.5-7.8,17.5-17.5s-7.8-17.6-17.5-17.5c-9.7,0.1-13.3,7.2-22.1,17.1 
             c-8.9,8.8-15.7,17.9-25.4,17.9s-17.5-7.8-17.5-17.5s7.8-17.5,17.5-17.5S86.2,38.6,93.9,46.4z"
          stroke="#60A5FA"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="10"
          opacity="0.1"
          fill="none"
        />
      </svg>

      <p className="text-xl font-semibold text-gray-800">Activating AI</p>
    </div>
  );
}
