import useSWR from "swr";
import GlobalStyle from "../styles";
import { useEffect, useState } from "react";
import useLocalStorageState from "use-local-storage-state";
import AlarmTimer from "@/components/AlarmTimer";
const fetcher = (url) => fetch(url).then((res) => res.json());

export default function App({ Component, pageProps }) {
  const [settings, setSettings] = useLocalStorageState("settings", {
    defaultValue: {
      countryFlags: {
        USD: true,
        EUR: true,
        GBP: true,
        AUD: false,
        CAD: false,
        NZD: false,
        CHF: false,
        JPY: false,
        CNY: false,
      },
      flagsTurnedOn: false,
      alarmTriggerA: 5,
      alarmTriggerB: 20,
      eventDuration: 30,
      impactLow: true,
      impactMedium: true,
      impactHigh: true,
      bankHolidays: true,
    },
  });

  const [newsEvents, setNewsEvents] = useState([]);
  const [alarmEvents, setAlarmEvents] = useLocalStorageState("events", {
    defaultValue: [],
  });
  const { data: events } = useSWR("/api/fetchThisWeek", fetcher);

  function changeSettings(setting, value) {
    if (setting === "flag") {
      const updatedSettings = settings;
      updatedSettings.countryFlags[value] =
        !updatedSettings.countryFlags[value];
      setSettings(updatedSettings);
    } else if (setting === "preferredCurrenciesToggle") {
      const updatedSettings = settings;
      updatedSettings.flagsTurnedOn = !updatedSettings.flagsTurnedOn;
      setSettings(updatedSettings);
    } else if (setting === "alarmTriggerA") {
      const updatedSettings = settings;
      updatedSettings.alarmTriggerA = value;
      setSettings(updatedSettings);
    } else if (setting === "alarmTriggerB") {
      const updatedSettings = settings;
      updatedSettings.alarmTriggerB = value;
      setSettings(updatedSettings);
    } else if (setting === "eventDuration") {
      const updatedSettings = settings;
      updatedSettings.eventDuration = value;
      setSettings(updatedSettings);
    } else if (setting === "impactLow") {
      const updatedSettings = settings;
      updatedSettings.impactLow = !updatedSettings.impactLow;
      setSettings(updatedSettings);
    } else if (setting === "impactMedium") {
      const updatedSettings = settings;
      updatedSettings.impactMedium = !updatedSettings.impactMedium;
      setSettings(updatedSettings);
    } else if (setting === "impactHigh") {
      const updatedSettings = settings;
      updatedSettings.impactHigh = !updatedSettings.impactHigh;
      setSettings(updatedSettings);
    } else if (setting === "bankHolidays") {
      const updatedSettings = settings;
      updatedSettings.bankHolidays = !updatedSettings.bankHolidays;
      setSettings(updatedSettings);
    }
  }

  function filterTodaysEvents(events) {
    if (events) {
      const today = new Date();
      return events.filter((event) => {
        const eventDate = new Date(event.dateObjectString);
        return (
          eventDate.getDate() === today.getDate() &&
          eventDate.getMonth() === today.getMonth() &&
          eventDate.getFullYear() === today.getFullYear()
        );
      });
    }
  }

  useEffect(() => {
    if (events) {
      const updatedEventsArray = events.map((event) => {
        event.dateObject = new Date(event.dateObjectString);
        const updatedEvent = alarmEvents.find((alarm) => alarm.id === event.id);
        if (updatedEvent) {
          return { ...event, alarm: updatedEvent.alarm };
        }
        return event;
      });
      setNewsEvents(updatedEventsArray);
      console.log(updatedEventsArray);
    }
  }, [events]);

  const eventsToShow = newsEvents.filter((event) => {
    const { impact, country } = event;
    if (impact === "holiday") {
      return true;
    } else if (
      (impact === "Low" && settings.impactLow) ||
      (impact === "Medium" && settings.impactMedium) ||
      (impact === "High" && settings.impactHigh) ||
      (impact === "Holiday" && settings.bankHolidays)
    ) {
      return settings.flagsTurnedOn ? settings.countryFlags[country] : true;
    }
    return false;
  });

  function handleToggleAlarm(ids) {
    const updatedEvents = newsEvents.map((event) => {
      if (ids.includes(event.id)) {
        return { ...event, alarm: !event.alarm };
      }
      return event;
    });
    setAlarmEvents(updatedEvents);
    setNewsEvents(updatedEvents);
  }

  return (
    <>
      <GlobalStyle />
      <Component
        {...pageProps}
        events={eventsToShow ?? []}
        onToggleAlarm={handleToggleAlarm}
        changeSettings={changeSettings}
        settings={settings}
        todaysEvents={filterTodaysEvents(eventsToShow)}
      />
      <AlarmTimer
        onToggleAlarm={handleToggleAlarm}
        todaysEvents={filterTodaysEvents(eventsToShow)}
      />
    </>
  );
}
