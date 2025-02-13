// src/components/Debug.tsx
interface DebugProps {
    data: Record<string, unknown>;
  }
  
  export default function Debug({ data }: DebugProps) {
    if (process.env.NODE_ENV !== 'development') return null;
  
    return (
      <div className="fixed bottom-0 right-0 m-4 p-4 bg-black text-white rounded-lg opacity-75">
        <pre className="text-xs">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  }