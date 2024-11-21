import React, { useState } from "react";

function LayerPositionViewer({ layers, selectedLayer }) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="bg-gray-800 text-white rounded-lg shadow-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold">📋 اطلاعات لایه‌ها</h3>

            <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-all"
                onClick={() => setIsVisible((prev) => !prev)}
            >
                {isVisible ? "پنهان کردن اطلاعات" : "نمایش اطلاعات"}
            </button>

            {isVisible && (
                <ul className="space-y-2">
                    {layers.map((layer) => (
                        <li
                            key={layer.id}
                            className={`p-2 rounded-lg ${selectedLayer === layer.id
                                ? "bg-blue-700"
                                : "bg-gray-700"
                                }`}
                        >
                            <p>ID: {layer.id}</p>
                            <p>Type: {layer.type}</p>
                            <p>Position: x = {layer.x}, y = {layer.y}</p>
                            {layer.type === "text" && <p>Text: {layer.text}</p>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default LayerPositionViewer;
