import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-2xl" data-testid="count">{count}</p>
      <button
        onClick={() => setCount((c) => c + 1)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-medium transition-colors"
      >
        Increment
      </button>
    </div>
  );
}
