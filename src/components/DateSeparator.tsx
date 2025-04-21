import React from 'react';

interface DateSeparatorProps {
  date: string;
}

export default function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <div className="flex items-center my-4">
      <div className="flex-grow border-t border-gray-200"></div>
      <div className="mx-4 text-sm text-gray-500 bg-white px-2 rounded">
        {date}
      </div>
      <div className="flex-grow border-t border-gray-200"></div>
    </div>
  );
}