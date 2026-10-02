import { useEffect } from "react";

const APP_NAME = "GestHor";

/*Cambia el título de la pestaña según la página*/
export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;
  }, [title]);
}
