import React, { useEffect, useState } from "react";

function UI({
  balance,
  machineLevel,
  bakeryLevel,
  onBuyUpgrade,
  onShowToast,
}) {
  const [activeTab, setActiveTab] = useState("bakery");
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const machineCost = 100 * (machineLevel + 1);
  const bakeryCost = 200 * (bakeryLevel + 1);

  useEffect(() => {
    if (!isUpgradeOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setIsUpgradeOpen(false);
        setActiveTab("bakery");
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isUpgradeOpen]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "upgrades") {
      setIsUpgradeOpen(true);
    } else {
      setIsUpgradeOpen(false);
      if (tab === "wallet") onShowToast("Кошелёк скоро появится");
    }
  };

  const closeUpgradeModal = () => {
    setIsUpgradeOpen(false);
    setActiveTab("bakery");
  };

  return (
    <>
      <header className="wallet-panel" aria-live="polite">
        <span className="coin-icon" aria-hidden="true">
          <svg viewBox="0 0 40 40" focusable="false">
            <circle cx="20" cy="20" r="17" />
            <path d="M16 25c4-1 8-5 10-11m-12 8 9 5m-6-10 8 4m-11 0 2 10m1-15 2 10" />
          </svg>
        </span>
        <span className="wallet-balance">{Math.floor(balance).toLocaleString("ru-RU")}</span>
        <span className="wallet-currency">KOLO</span>
      </header>

      <button
        className="settings-button"
        type="button"
        aria-label="Настройки"
        onClick={() => onShowToast("Настройки скоро появятся")}
      >
        <span className="settings-icon" aria-hidden="true">
          <svg viewBox="0 0 40 40" focusable="false">
            <path d="M17 3h6l1.2 4.1a13 13 0 0 1 2.7 1.1l3.8-1.8 4.2 4.2-1.8 3.8a13 13 0 0 1 1.1 2.7L38 18v6l-4.1 1.2a13 13 0 0 1-1.1 2.7l1.8 3.8-4.2 4.2-3.8-1.8a13 13 0 0 1-2.7 1.1L23 39h-6l-1.2-4.1a13 13 0 0 1-2.7-1.1l-3.8 1.8-4.2-4.2 1.8-3.8a13 13 0 0 1-1.1-2.7L2 24v-6l4.1-1.2a13 13 0 0 1 1.1-2.7l-1.8-3.8 4.2-4.2 3.8 1.8a13 13 0 0 1 2.7-1.1L17 3Z" />
            <circle className="gear-center" cx="20" cy="21" r="6" />
          </svg>
        </span>
      </button>

      <button
        className="upgrades-shortcut"
        type="button"
        onClick={() => handleTabClick("upgrades")}
      >
        <span className="shortcut-icon" aria-hidden="true">↑</span>
        <span>Улучшения</span>
      </button>

      <nav className="bottom-tabs" aria-label="Главное меню">
        <button
          className={`tab-button tab-button--bakery${activeTab === "bakery" ? " is-active" : ""}`}
          type="button"
          aria-label="Пекарня"
          aria-pressed={activeTab === "bakery"}
          onClick={() => handleTabClick("bakery")}
        >
          <svg className="tab-icon" viewBox="0 0 32 32" aria-hidden="true">
            <path d="m4 14 12-10 12 10v14H4V14Zm8 14V18h8v10M9 14h14" />
          </svg>
          <span className="tab-label">Пекарня</span>
        </button>
        <button
          className={`tab-button tab-button--upgrades${activeTab === "upgrades" ? " is-active" : ""}`}
          type="button"
          aria-label="Улучшения"
          aria-pressed={activeTab === "upgrades"}
          onClick={() => handleTabClick("upgrades")}
        >
          <svg className="tab-icon" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M16 25V5m0 0-7 7m7-7 7 7M6 20v7h20v-7" />
          </svg>
          <span className="tab-label">Улучшения</span>
        </button>
        <button
          className={`tab-button tab-button--wallet${activeTab === "wallet" ? " is-active" : ""}`}
          type="button"
          aria-label="Кошелёк"
          aria-pressed={activeTab === "wallet"}
          onClick={() => handleTabClick("wallet")}
        >
          <svg className="tab-icon" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M4 8h22a2 2 0 0 1 2 2v16H5a2 2 0 0 1-2-2V7a3 3 0 0 1 3-3h18M4 13h24v8h-8a4 4 0 0 1 0-8h8" />
            <circle cx="20" cy="17" r="1" />
          </svg>
          <span className="tab-label">Кошелёк</span>
        </button>
      </nav>

      {isUpgradeOpen ? (
        <div
          className="modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeUpgradeModal();
          }}
        >
          <section
            className="upgrade-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="upgrade-title"
          >
            <button
              className="modal-close"
              type="button"
              aria-label="Закрыть"
              onClick={closeUpgradeModal}
            >
              ×
            </button>
            <h1 id="upgrade-title">Улучшения</h1>
            <div className="upgrade-list">
              <article className="upgrade-card">
                <div>
                  <h2>Ускорить машины</h2>
                  <p>Каждый уровень ускоряет машины на 20%.</p>
                  <span className="upgrade-level">Уровень {machineLevel}</span>
                </div>
                <button
                  className="upgrade-buy"
                  type="button"
                  disabled={balance < machineCost}
                  onClick={() => onBuyUpgrade("machine")}
                >
                  Купить
                  <strong>{machineCost.toLocaleString("ru-RU")} KOLO</strong>
                </button>
              </article>
              <article className="upgrade-card">
                <div>
                  <h2>Улучшить пекарню</h2>
                  <p>Доход за каждый заказ увеличится на 5 KOLO.</p>
                  <span className="upgrade-level">Уровень {bakeryLevel}</span>
                </div>
                <button
                  className="upgrade-buy"
                  type="button"
                  disabled={balance < bakeryCost}
                  onClick={() => onBuyUpgrade("bakery")}
                >
                  Купить
                  <strong>{bakeryCost.toLocaleString("ru-RU")} KOLO</strong>
                </button>
              </article>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

export default UI;
