import React, { useCallback, useEffect, useRef, useState } from "react";
import Traffic from "./components/Traffic.jsx";
import UI from "./components/UI.jsx";
import "./App.css";

const STORAGE_KEY = "kolobok-bakery-save-v1";
const DEFAULT_GAME = {
  balance: 0,
  income: 24,
  machineLevel: 0,
  bakeryLevel: 0,
};

function loadGame() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved || typeof saved !== "object") return { ...DEFAULT_GAME };

    return {
      balance: Number.isFinite(saved.balance) && saved.balance >= 0
        ? saved.balance
        : DEFAULT_GAME.balance,
      income: Number.isFinite(saved.income) && saved.income >= 0
        ? saved.income
        : DEFAULT_GAME.income,
      machineLevel: Number.isSafeInteger(saved.machineLevel) && saved.machineLevel >= 0
        ? saved.machineLevel
        : DEFAULT_GAME.machineLevel,
      bakeryLevel: Number.isSafeInteger(saved.bakeryLevel) && saved.bakeryLevel >= 0
        ? saved.bakeryLevel
        : DEFAULT_GAME.bakeryLevel,
    };
  } catch (error) {
    console.error("Не удалось загрузить сохранение игры:", error);
    return { ...DEFAULT_GAME };
  }
}

function App() {
  const [game, setGame] = useState(loadGame);
  const gameRef = useRef(game);
  const toastTimeoutRef = useRef(null);
  const storageWarningRef = useRef(false);
  const [toast, setToast] = useState("");

  const updateGame = useCallback((update) => {
    const nextGame = typeof update === "function" ? update(gameRef.current) : update;
    gameRef.current = nextGame;
    setGame(nextGame);
  }, []);

  const showToast = useCallback((message) => {
    setToast(message);
    window.clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => setToast(""), 1800);
  }, []);

  const earn = useCallback((amount) => {
    updateGame((current) => ({ ...current, balance: current.balance + amount }));
  }, [updateGame]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      updateGame((current) => ({ ...current, balance: current.balance + current.income }));
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [updateGame]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
    } catch (error) {
      console.error("Не удалось сохранить прогресс игры:", error);
      if (!storageWarningRef.current) {
        storageWarningRef.current = true;
        showToast("Не удалось сохранить прогресс");
      }
    }
  }, [game, showToast]);

  useEffect(() => () => window.clearTimeout(toastTimeoutRef.current), []);

  const buyUpgrade = useCallback((type) => {
    const current = gameRef.current;
    const isMachineUpgrade = type === "machine";
    const level = isMachineUpgrade ? current.machineLevel : current.bakeryLevel;
    const cost = (isMachineUpgrade ? 100 : 200) * (level + 1);

    if (current.balance < cost) {
      showToast("Недостаточно KOLO");
      return;
    }

    updateGame((previous) => ({
      ...previous,
      balance: previous.balance - cost,
      [isMachineUpgrade ? "machineLevel" : "bakeryLevel"]: level + 1,
    }));
    showToast(isMachineUpgrade ? "Машины стали быстрее!" : "Доход с заказа увеличен!");
  }, [showToast, updateGame]);

  return (
    <main id="game-screen" className="game-screen" aria-label="Игра Пекарня Колобок">
      <div className="game-stage">
        <section className="bakery-scene" aria-label="Пекарня Колобок">
          <button
            className="kolobok-hitbox"
            type="button"
            aria-label="Нажать на Колобка и получить 1 KOLO"
            onClick={() => {
              earn(1);
              showToast("+1 KOLO");
            }}
          >
            <img
              className="kolobok-art"
              src="/assets/characters/char_kolobok.png"
              alt=""
              draggable="false"
            />
          </button>
        </section>

        <Traffic
          machineLevel={game.machineLevel}
          bakeryLevel={game.bakeryLevel}
          onEarn={earn}
        />

        <div className="income-panel" aria-label={`Пассивный доход: ${game.income} KOLO в секунду`}>
          <span className="income-value">
            <strong>+{game.income}</strong> KOLO / сек
          </span>
        </div>

        <UI
          balance={game.balance}
          machineLevel={game.machineLevel}
          bakeryLevel={game.bakeryLevel}
          onBuyUpgrade={buyUpgrade}
          onShowToast={showToast}
        />

        <div className={`game-toast${toast ? " is-visible" : ""}`} role="status" aria-live="polite">
          {toast}
        </div>
      </div>
    </main>
  );
}

export default App;
