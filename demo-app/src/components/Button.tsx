import React from 'react';

export const Button = ({ label }: { label: string }) => {
    return <button className="p-2 bg-blue-500 text-white rounded">{label}</button>;
};
