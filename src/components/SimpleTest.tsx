"use client";

export function SimpleTest() {
  console.log('🧪 SimpleTest component rendered');

  return (
    <div style={{ 
      padding: '8px 16px', 
      backgroundColor: 'red', 
      color: 'white', 
      borderRadius: '4px',
      margin: '0 8px',
      cursor: 'pointer'
    }}
    onClick={() => alert('SimpleTest button clicked!')}
    >
      🧪 SIMPLE TEST
    </div>
  );
} 