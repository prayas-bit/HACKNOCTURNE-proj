import React from 'react'

export const Button = ({ label, onClick, disabled }) => {
  if (disabled) {
    return (
      <button className="p-2 bg-gray-400 text-white rounded cursor-not-allowed">
        {label} (disabled)
      </button>
    )
  }

  if (!label) {
    return <button className="p-2 bg-red-500 text-white rounded">No Label</button>
  }

  return (
    <button
      className="p-2 bg-blue-500 text-white rounded"
      onClick={onClick}
    >
      {label}
    </button>
  )
}
