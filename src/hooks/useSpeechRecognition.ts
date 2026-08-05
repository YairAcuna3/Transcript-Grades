import { useEffect, useRef, useState } from "react";

export const useSpeechRecognition = (lang: string = "es-ES") => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Tu navegador no soporta SpeechRecognition");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Acumular todos los resultados finales, no solo el último
      let fullText = "";
      for (let i = 0; i < event.results.length; i++) {
        fullText += event.results[i][0].transcript + " ";
      }
      setTranscript(fullText.trim());
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Error en reconocimiento:", event.error);
    };

    recognitionRef.current = recognition;
  }, [lang]);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  const resetTranscript = () => {
    setTranscript("");
    // Si hay una sesión activa, la reiniciamos para que los resultados internos
    // del reconocedor también se borren
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
      recognitionRef.current.start();
    }
  };

  return {
    transcript,
    listening,
    startListening,
    stopListening,
    resetTranscript,
  };
};
