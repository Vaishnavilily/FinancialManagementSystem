"use client";
import { createContext, useContext, useState, useEffect } from "react";

const CURRENCY_SYMBOLS = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    CAD: "CA$",
    AUD: "A$",
};

const defaultSettings = {
    companyName: "",
    email: "",
    currency: "INR",
    timezone: "IST",
    theme: "Light",
};

const SettingsContext = createContext({
    settings: defaultSettings,
    currencySymbol: "₹",
    refreshSettings: () => { },
});

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(defaultSettings);
    const [currencySymbol, setCurrencySymbol] = useState("₹");

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/settings");
            const json = await res.json();
            if (json.success && json.data) {
                setSettings(json.data);
                setCurrencySymbol(CURRENCY_SYMBOLS[json.data.currency] ?? "₹");
            }
        } catch (err) {
            console.error("Failed to load settings:", err);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSettings();
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    return (
        <SettingsContext.Provider
            value={{ settings, currencySymbol, refreshSettings: fetchSettings }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

// Custom hook - use this in any page/component
export function useSettings() {
    return useContext(SettingsContext);
}