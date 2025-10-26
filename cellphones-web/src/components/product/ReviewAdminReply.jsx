// src/components/product/ReviewAdminReply.jsx
import React from "react";

export default function ReviewAdminReply({ reply }) {
  return (
    <div className="mt-2 bg-gray-100 border-l-4 border-blue-500 p-2 rounded text-sm text-gray-700">
      <p className="font-semibold text-blue-600">Phản hồi từ Admin</p>
      <p>{reply}</p>
    </div>
  );
}
