import "./ArchitectureInfo.css";

const ArchitectureInfo = () => {
  return (
    <div className="architecture-info">
      <div className="info-column">
        <h3>Monolit - Charakterystyka:</h3>
        <ul>
          <li>Wszystkie etapy zamówienia w jednym systemie</li>
          <li>Awaria wpływa na całość systemu</li>
          <li>Szybszy dla pojedynczych zamówień</li>
          <li>Trudniejsze skalowanie przy dużym obciążeniu</li>
        </ul>
      </div>
      <div className="info-column">
        <h3>Mikroserwisy - Charakterystyka:</h3>
        <ul>
          <li>Każdy etap zamówienia to osobny serwis</li>
          <li>Awaria wpływa tylko na konkretny etap</li>
          <li>Lepsze działanie przy wielu zamówieniach</li>
          <li>Łatwiejsze skalowanie poszczególnych etapów</li>
        </ul>
      </div>
    </div>
  );
};

export default ArchitectureInfo;
