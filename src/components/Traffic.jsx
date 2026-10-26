import React, { useCallback, useEffect, useRef, useState } from "react";

const VEHICLE_TYPES = {
  car_blue: { image: "/assets/vehicles/car_blue.png", speed: 5, reward: [10, 15] },
  car_yellow: { image: "/assets/vehicles/car_yellow.png", speed: 3.5, reward: [20, 25] },
  car_white: { image: "/assets/vehicles/car_white.png", speed: 2.5, reward: [30, 30] },
  car_purple: { image: "/assets/vehicles/car_purple.png", speed: 1.5, reward: [50, 70] },
};

const COMMON_VEHICLES = ["car_blue", "car_yellow", "car_white"];

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function Vehicle({ vehicle, onClaim, onRemove, onAutoStop, onStartLeaving }) {
  useEffect(() => {
    if (vehicle.status !== "stopped") return undefined;
    const timeoutId = window.setTimeout(() => onStartLeaving(vehicle.id), 1500);
    return () => window.clearTimeout(timeoutId);
  }, [vehicle.id, vehicle.status, onStartLeaving]);

  useEffect(() => {
    if (!vehicle.claimed) return undefined;
    const timeoutId = window.setTimeout(() => onRemove(vehicle.id), 280);
    return () => window.clearTimeout(timeoutId);
  }, [vehicle.id, vehicle.claimed, onRemove]);

  const handleClick = () => {
    if (vehicle.status !== "driving") return;
    onClaim(vehicle.id, vehicle.reward);
  };

  const handleAnimationEnd = (event) => {
    if (event.animationName === "vehicle-approach" && vehicle.status === "driving") {
      onAutoStop(vehicle.id, vehicle.reward);
    } else if (event.animationName === "vehicle-leave" && vehicle.status === "leaving") {
      onRemove(vehicle.id);
    }
  };

  const laneOffset = (vehicle.lane - 1) * 14 + 2;
  const classes = [
    "vehicle",
    `vehicle--${vehicle.status}`,
    `vehicle--${vehicle.type}`,
    vehicle.claimed ? "vehicle--clicked" : "",
  ].join(" ");

  return (
    <button
      className={classes}
      type="button"
      aria-label={`Машина доставляет заказ: ${vehicle.reward} KOLO`}
      onClick={handleClick}
      onAnimationEnd={handleAnimationEnd}
      style={{
        "--lane-bottom": `${laneOffset}px`,
        "--drive-duration": `${vehicle.speed}s`,
      }}
    >
      {vehicle.status === "stopped" || vehicle.claimed ? (
        <span className="vehicle-reward" aria-live="polite">+{vehicle.reward} KOLO</span>
      ) : null}
      <span className="vehicle-art" aria-hidden="true">
        <img src={VEHICLE_TYPES[vehicle.type].image} alt="" draggable="false" />
      </span>
    </button>
  );
}

function Traffic({ machineLevel, bakeryLevel, onEarn }) {
  const [vehicles, setVehicles] = useState([]);
  const nextId = useRef(0);
  const rewardedVehicles = useRef(new Set());

  const addVehicle = useCallback(() => {
    const type = Math.random() < 0.05
      ? "car_purple"
      : COMMON_VEHICLES[Math.floor(Math.random() * COMMON_VEHICLES.length)];
    const config = VEHICLE_TYPES[type];
    const [minReward, maxReward] = config.reward;

    const vehicle = {
      id: nextId.current++,
      type,
      lane: randomInteger(1, 3),
      speed: config.speed / (1 + machineLevel * 0.2),
      reward: randomInteger(minReward, maxReward) + (bakeryLevel * 5),
      status: "driving",
    };
    setVehicles((current) => [...current, vehicle]);
  }, [bakeryLevel, machineLevel]);

  useEffect(() => {
    let timeoutId;
    let isMounted = true;

    const scheduleSpawn = () => {
      timeoutId = window.setTimeout(() => {
        if (!isMounted) return;
        addVehicle();
        scheduleSpawn();
      }, randomInteger(3000, 5000));
    };

    scheduleSpawn();
    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [addVehicle]);

  const removeVehicle = useCallback((id) => {
    rewardedVehicles.current.delete(id);
    setVehicles((current) => current.filter((vehicle) => vehicle.id !== id));
  }, []);

  const autoStopVehicle = useCallback((id, reward) => {
    if (rewardedVehicles.current.has(id)) return;
    rewardedVehicles.current.add(id);
    onEarn(reward);
    setVehicles((current) => current.map((vehicle) => {
      if (vehicle.id !== id || vehicle.status !== "driving") return vehicle;
      return { ...vehicle, status: "stopped" };
    }));
  }, [onEarn]);

  const startLeaving = useCallback((id) => {
    setVehicles((current) => current.map((vehicle) => (
      vehicle.id === id && vehicle.status === "stopped"
        ? { ...vehicle, status: "leaving" }
        : vehicle
    )));
  }, []);

  const claimVehicle = useCallback((id, reward) => {
    if (rewardedVehicles.current.has(id)) return;
    rewardedVehicles.current.add(id);
    onEarn(reward);
    setVehicles((current) => current.map((vehicle) => (
      vehicle.id === id && vehicle.status === "driving"
        ? { ...vehicle, claimed: true }
        : vehicle
    )));
  }, [onEarn]);

  return (
    <div className="traffic-road" aria-label="Дорога с машинами">
      <div className="road-center-line" aria-hidden="true" />
      {vehicles.map((vehicle) => (
        <Vehicle
          key={vehicle.id}
          vehicle={vehicle}
          onClaim={claimVehicle}
          onRemove={removeVehicle}
          onAutoStop={autoStopVehicle}
          onStartLeaving={startLeaving}
        />
      ))}
    </div>
  );
}

export default Traffic;
