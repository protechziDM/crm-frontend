// TooltipContext.js
import React, { createContext, useState } from 'react';

export const TooltipContext = createContext();

export const TooltipProvider = ({ children }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipMessage, setTooltipMessage] = useState('');

    const showGlobalTooltip = (message) => {
        setTooltipMessage(message);
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 3000); // Adjust duration as needed
    };

    return (
        <TooltipContext.Provider value={{ showTooltip, tooltipMessage, showGlobalTooltip }}>
            {children}
            {showTooltip && (
                <div className="global-tooltip">
                    {tooltipMessage}
                </div>
            )}
        </TooltipContext.Provider>
    );
};