import React from 'react';

const GaugeChart = ({ data, total }) => {
  // Build conic gradient color stops for a semicircle
  let currentPercent = 0;
  const gradientStops = [];
  
  data.forEach((item) => {
    const itemPercent = (item.amount / total) * 50; // 50% = 180 degrees (semicircle)
    gradientStops.push(`${item.color} ${currentPercent}% ${currentPercent + itemPercent}%`);
    currentPercent += itemPercent;
  });
  
  // Add transparent for the bottom half
  gradientStops.push(`transparent 50% 100%`);
  
  const gradientString = `conic-gradient(from 180deg, ${gradientStops.join(', ')})`;
  
  return (
    <div className="relative w-full flex justify-center">
      <div className="relative" style={{ width: '240px', height: '120px', overflow: 'hidden' }}>
        <div
          className="w-full"
          style={{
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: gradientString,
            position: 'relative'
          }}
        >
          {/* Inner white circle to create donut effect */}
          <div
            style={{
              position: 'absolute',
              top: '22px',
              left: '22px',
              width: '196px',
              height: '196px',
              borderRadius: '50%',
              background: 'white'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default GaugeChart;
