import { useState, useRef, useEffect } from 'react';
import './Dartboard.css';

const Dartboard = ({ onThrow, disabled }) => {
  const [selectedSector, setSelectedSector] = useState(null);
  const [selectedMultiplier, setSelectedMultiplier] = useState(null);
  const [previewSector, setPreviewSector] = useState(null);
  const [previewMultiplier, setPreviewMultiplier] = useState(null);
  const [manualScore, setManualScore] = useState('');
  const [holdPreview, setHoldPreview] = useState(null);
  const [holdPosition, setHoldPosition] = useState({ x: 0, y: 0 });
  const holdTimerRef = useRef(null);
  const holdDataRef = useRef(null);

  // Array standard del dartboard con il 20 a nord (indice 0)
  const sectors = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
    };
  }, []);

  const handleSectorClick = (sector, multiplier) => {
    if (disabled) return;
    
    console.log('Clicked sector:', sector, 'multiplier:', multiplier, 'expected score:', sector * multiplier);
    
    setSelectedSector(sector);
    setSelectedMultiplier(multiplier);
    setPreviewSector(null);
    setPreviewMultiplier(null);
    
    if (onThrow) {
      onThrow(sector, multiplier);
    }
    
    setTimeout(() => {
      setSelectedSector(null);
      setSelectedMultiplier(null);
    }, 300);
  };

  const handleSectorHover = (sector, multiplier) => {
    if (disabled) return;
    setPreviewSector(sector);
    setPreviewMultiplier(multiplier);
  };

  const handleSectorLeave = () => {
    setPreviewSector(null);
    setPreviewMultiplier(null);
  };

  // Gestione press and hold
  const startHoldPreview = (sector, multiplier, event) => {
    if (disabled) return;
    
    // Salva i dati per il click successivo
    holdDataRef.current = { sector, multiplier };
    
    // Ottieni la posizione del touch/mouse
    const rect = event.currentTarget.getBoundingClientRect();
    let clientX, clientY;
    
    if (event.type.startsWith('touch')) {
      const touch = event.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    setHoldPosition({ x: clientX, y: clientY });
    
    // Avvia il timer per mostrare l'anteprima dopo 500ms (aumentato per maggiore stabilità)
    holdTimerRef.current = setTimeout(() => {
      setHoldPreview({ sector, multiplier });
    }, 500);
  };

  const cancelHoldPreview = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setHoldPreview(null);
    holdDataRef.current = null;
  };

  const confirmHoldSelection = () => {
    if (holdPreview && holdDataRef.current) {
      const { sector, multiplier } = holdDataRef.current;
      handleSectorClick(sector, multiplier);
    }
    cancelHoldPreview();
  };

  // Gestori eventi combinati per mouse e touch
  const handlePointerDown = (sector, multiplier, event) => {
    event.preventDefault();
    startHoldPreview(sector, multiplier, event);
  };

  const handlePointerUp = (event) => {
    event.preventDefault();
    
    // Se c'è un'anteprima attiva, conferma la selezione
    if (holdPreview) {
      confirmHoldSelection();
    } else if (holdDataRef.current) {
      // Click rapido - esegui immediatamente
      const { sector, multiplier } = holdDataRef.current;
      handleSectorClick(sector, multiplier);
      cancelHoldPreview();
    }
  };

  const handlePointerMove = (event) => {
    // Controlla il movimento per cancellare l'anteprima
    if (holdPreview || holdTimerRef.current) {
      let clientX, clientY;
      
      if (event.type.startsWith('touch')) {
        const touch = event.touches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }
      
      const deltaX = Math.abs(clientX - holdPosition.x);
      const deltaY = clientY - holdPosition.y; // Movimento verticale (positivo = verso il basso)
      
      // Per touch: cancella se scrolla verso il basso di almeno 30px
      // Per mouse: cancella se si muove più di 50px in qualsiasi direzione
      if (event.type.startsWith('touch')) {
        if (deltaY > 30) {
          // Scroll verso il basso - cancella
          cancelHoldPreview();
        }
      } else {
        if (deltaX > 50 || Math.abs(deltaY) > 50) {
          cancelHoldPreview();
        }
      }
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (disabled || !manualScore) return;
    
    const score = parseInt(manualScore, 10);
    if (isNaN(score) || score < 0 || score > 180) {
      alert('Inserisci un punteggio valido (0-180)');
      return;
    }

    // Calcola settore e moltiplicatore dal punteggio
    // Per semplicità, usiamo single per punteggi <= 20, altrimenti calcoliamo
    let sector, multiplier;
    
    if (score === 0) {
      sector = 0;
      multiplier = 0;
    } else if (score === 25) {
      sector = 25;
      multiplier = 1;
    } else if (score === 50) {
      sector = 25;
      multiplier = 2;
    } else if (score <= 20) {
      sector = score;
      multiplier = 1;
    } else if (score <= 40 && score % 2 === 0) {
      sector = score / 2;
      multiplier = 2;
    } else if (score <= 60 && score % 3 === 0) {
      sector = score / 3;
      multiplier = 3;
    } else {
      // Punteggio non standard, usa come single
      sector = Math.min(score, 20);
      multiplier = 1;
    }

    handleSectorClick(sector, multiplier);
    setManualScore('');
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
            const radius = 150; // Distanza dal centro ottimale
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
                onMouseDown={(e) => handlePointerDown(sector, 2, e)}
                onMouseUp={handlePointerUp}
                onMouseMove={handlePointerMove}
                onMouseLeave={cancelHoldPreview}
                onTouchStart={(e) => handlePointerDown(sector, 2, e)}
                onTouchEnd={handlePointerUp}
                onTouchMove={handlePointerMove}
                onTouchCancel={cancelHoldPreview}
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
                onMouseDown={(e) => handlePointerDown(sector, 1, e)}
                onMouseUp={handlePointerUp}
                onMouseMove={handlePointerMove}
                onMouseLeave={cancelHoldPreview}
                onTouchStart={(e) => handlePointerDown(sector, 1, e)}
                onTouchEnd={handlePointerUp}
                onTouchMove={handlePointerMove}
                onTouchCancel={cancelHoldPreview}
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
                onMouseDown={(e) => handlePointerDown(sector, 3, e)}
                onMouseUp={handlePointerUp}
                onMouseMove={handlePointerMove}
                onMouseLeave={cancelHoldPreview}
                onTouchStart={(e) => handlePointerDown(sector, 3, e)}
                onTouchEnd={handlePointerUp}
                onTouchMove={handlePointerMove}
                onTouchCancel={cancelHoldPreview}
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
                onMouseDown={(e) => handlePointerDown(sector, 1, e)}
                onMouseUp={handlePointerUp}
                onMouseMove={handlePointerMove}
                onMouseLeave={cancelHoldPreview}
                onTouchStart={(e) => handlePointerDown(sector, 1, e)}
                onTouchEnd={handlePointerUp}
                onTouchMove={handlePointerMove}
                onTouchCancel={cancelHoldPreview}
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

      {previewSector !== null && !holdPreview && (
        <div className="score-preview">
          <div className="preview-content">
            {previewMultiplier === 1 && 'S'}
            {previewMultiplier === 2 && 'D'}
            {previewMultiplier === 3 && 'T'}
            {previewSector} = {previewSector * previewMultiplier}
          </div>
        </div>
      )}

      {holdPreview && (
        <div
          className="hold-preview-magnifier"
          style={{
            left: `${holdPosition.x}px`,
            top: `${holdPosition.y}px`,
          }}
        >
          <div className="magnifier-circle">
            <div className="magnifier-content">
              <div className="magnifier-multiplier">
                {holdPreview.multiplier === 1 && 'SINGLE'}
                {holdPreview.multiplier === 2 && 'DOUBLE'}
                {holdPreview.multiplier === 3 && 'TRIPLE'}
              </div>
              <div className="magnifier-sector">{holdPreview.sector}</div>
              <div className="magnifier-score">
                {holdPreview.sector * holdPreview.multiplier} punti
              </div>
              <div className="magnifier-hint">Rilascia per confermare</div>
            </div>
          </div>
        </div>
      )}

      <div className="manual-input">
        <form onSubmit={handleManualSubmit} className="manual-form">
          <input
            type="number"
            value={manualScore}
            onChange={(e) => setManualScore(e.target.value)}
            placeholder="Inserisci punteggio (0-180)"
            disabled={disabled}
            className="manual-input-field"
            min="0"
            max="180"
          />
          <button
            type="submit"
            disabled={disabled || !manualScore}
            className="btn-manual-submit"
          >
            ✓ Conferma
          </button>
        </form>
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