import React from 'react';

// This component provides a visual loading indicator.
// It uses CSS animations for a rotating dotted effect.
const Loader = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-black">
            <div className="dotted-loader"></div>
            {/* Inline CSS for the loader to ensure it's self-contained within the component */}
            <style jsx>{`
                .dotted-loader {
                    width: 100px;
                    height: 100px;
                    border-width: 4px;
                    /* Adjusted colors to match the purple/blue theme of your app */
                    border-color: #6d28d9; /* Deep purple */
                    border-style: solid solid dotted dotted;
                    border-radius: 50%;
                    position: relative; /* Changed from absolute for better centering with flexbox */
                    animation: rotate-right 2s linear infinite;
                }
                .dotted-loader::before {
                    content: "";
                    position: absolute;
                    left: 0;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    margin: auto;
                    border-width: 4px;
                    /* Adjusted colors to match the purple/blue theme of your app */
                    border-color: #a78bfa; /* Lighter purple */
                    border-style: solid dotted solid dotted;
                    border-radius: 50%;
                    width: 60px;
                    height: 60px;
                    animation: rotate-left 1s linear infinite;
                }
                @keyframes rotate-right {
                    from {
                        transform: rotate(0);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
                @keyframes rotate-left {
                    from {
                        transform: rotate(0);
                    }
                    to {
                        transform: rotate(-360deg);
                    }
                }
            `}</style>
        </div>
    );
};

export default Loader;
