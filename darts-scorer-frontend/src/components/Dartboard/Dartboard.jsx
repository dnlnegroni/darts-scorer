import { useState } from 'react';
import './Dartboard.css';

const Dartboard = ({ onThrow, disabled }) => {
  const [selectedSector, setSelectedSector] = useState(null);
  const [selectedMultiplier, setSelectedMultiplier] = useState(null);

  // Array standard del dartboard con il 20 a nord (indice 0)
  const sectors = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

  const handleSectorClick = (sector, multiplier) => {
    if (disabled) return;
    
    console.log('Clicked sector:', sector, 'multiplier:', multiplier, 'expected score:', sector * multiplier);
    
    setSelectedSector(sector);
    setSelectedMultiplier(multiplier);
    
    if (onThrow) {
      onThrow(sector, multiplier);
    }
    
    setTimeout(() => {
      setSelectedSector(null);
      setSelectedMultiplier(null);
    }, 300);
  };

  const getSectorColor = (index) => {
    // Nero e crema alternati come nel dartboard reale
    return index % 2 === 0 ? '#000000' : '#f0e5d8';
  };

  const getDoubleTripleColor = (index) => {
    // Rosso e verde alternati per double e triple
    return index % 2 === 0 ? '#d32f2f' : '#2e7d32';
  };

  return (
    <div className="dartboard-container">
      <div className={`dartboard ${disabled ? 'disabled' : ''}`}>
        <div className="dartboard-numbers">
          {sectors.map((sector, index) => {
            // Allinea i numeri con i settori: STESSO calcolo dell'angolo dei settori SVG
            const angle = (index * 18) - 90; // -90 per avere il 20 a nord (centro del settore)
            const angleRad = (angle * Math.PI) / 180;
            const radius = 225; // Distanza dal centro - posizionati nel cerchio nero tra bordo e double ring
            const x = radius * Math.cos(angleRad);
            const y = radius * Math.sin(angleRad);
            
            return (
              <div
                key={`num-${sector}`}
                className="sector-number"
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                }}
              >
                <span>{sector}</span>
              </div>
            );
          })}
        </div>

        <svg viewBox="0 0 400 400" className="dartboard-svg">
          {sectors.map((sector, index) => {
            // Compensazione offset: aggiungiamo +90° per allineare i settori ai numeri
            const centerAngle = (index * 18) - 90 + 90;
            const startAngle = centerAngle - 9;
            const endAngle = centerAngle + 9;
            return (
              <path
                key={`double-${sector}`}
                d={describeArc(200, 200, 190, 170, startAngle, endAngle)}
                fill={getDoubleTripleColor(index)}
                stroke="#333"
                strokeWidth="1"
                className={`sector ${selectedSector === sector && selectedMultiplier === 2 ? 'selected' : ''}`}
                onClick={() => handleSectorClick(sector, 2)}
              />
            );
          })}

          {sectors.map((sector, index) => {
            const centerAngle = (index * 18) - 90 + 90;
            const startAngle = centerAngle - 9;
            const endAngle = centerAngle + 9;
            return (
              <path
                key={`single-outer-${sector}`}
                d={describeArc(200, 200, 170, 107, startAngle, endAngle)}
                fill={getSectorColor(index)}
                stroke="#333"
                strokeWidth="1"
                className={`sector ${selectedSector === sector && selectedMultiplier === 1 ? 'selected' : ''}`}
                onClick={() => handleSectorClick(sector, 1)}
              />
            );
          })}

          {sectors.map((sector, index) => {
            const centerAngle = (index * 18) - 90 + 90;
            const startAngle = centerAngle - 9;
            const endAngle = centerAngle + 9;
            return (
              <path
                key={`triple-${sector}`}
                d={describeArc(200, 200, 107, 95, startAngle, endAngle)}
                fill={getDoubleTripleColor(index)}
                stroke="#333"
                strokeWidth="1"
                className={`sector triple ${selectedSector === sector && selectedMultiplier === 3 ? 'selected' : ''}`}
                onClick={() => handleSectorClick(sector, 3)}
              />
            );
          })}

          {sectors.map((sector, index) => {
            const centerAngle = (index * 18) - 90 + 90;
            const startAngle = centerAngle - 9;
            const endAngle = centerAngle + 9;
            return (
              <path
                key={`single-inner-${sector}`}
                d={describeArc(200, 200, 95, 16, startAngle, endAngle)}
                fill={getSectorColor(index)}
                stroke="#333"
                strokeWidth="1"
                className={`sector ${selectedSector === sector && selectedMultiplier === 1 ? 'selected' : ''}`}
                onClick={() => handleSectorClick(sector, 1)}
              />
            );
          })}

          <circle
            cx="200"
            cy="200"
            r="16"
            fill="#4caf50"
            stroke="#333"
            strokeWidth="1"
            className={`sector bull ${selectedSector === 25 && selectedMultiplier === 1 ? 'selected' : ''}`}
            onClick={() => handleSectorClick(25, 1)}
          />

          <circle
            cx="200"
            cy="200"
            r="8"
            fill="#d32f2f"
            stroke="#333"
            strokeWidth="1"
            className={`sector bullseye ${selectedSector === 25 && selectedMultiplier === 2 ? 'selected' : ''}`}
            onClick={() => handleSectorClick(25, 2)}
          />
        </svg>
      </div>

      <div className="quick-select">
        <div className="quick-select-title">Selezione Rapida</div>
        <div className="quick-select-buttons">
          <button
            onClick={() => handleSectorClick(0, 0)}
            disabled={disabled}
            className="btn-quick miss"
          >
            Miss (0)
          </button>
          <button
            onClick={() => handleSectorClick(25, 1)}
            disabled={disabled}
            className="btn-quick bull"
          >
            Bull (25)
          </button>
          <button
            onClick={() => handleSectorClick(25, 2)}
            disabled={disabled}
            className="btn-quick bullseye"
          >
            Bullseye (50)
          </button>
        </div>
      </div>
    </div>
  );
};

function describeArc(x, y, radiusOuter, radiusInner, startAngle, endAngle) {
  const start = polarToCartesian(x, y, radiusOuter, endAngle);
  const end = polarToCartesian(x, y, radiusOuter, startAngle);
  const startInner = polarToCartesian(x, y, radiusInner, endAngle);
  const endInner = polarToCartesian(x, y, radiusInner, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', start.x, start.y,
    'A', radiusOuter, radiusOuter, 0, largeArcFlag, 0, end.x, end.y,
    'L', endInner.x, endInner.y,
    'A', radiusInner, radiusInner, 0, largeArcFlag, 1, startInner.x, startInner.y,
    'Z'
  ].join(' ');
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

export default Dartboard;