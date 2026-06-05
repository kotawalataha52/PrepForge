import { useState, useRef, useEffect } from 'react';

// Attempt to grab correct Speech Recognition API depending on the browser (Chrome uses webkit prefix)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export const useSpeech = (onResultCallback) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // We just need short bursts for an input box
      recognition.interimResults = true; // Provides instant feedback as you speak
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      
      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        // Push the string back to the parent component
        onResultCallback(finalTranscript || interimTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech Recognition Error', event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn('Speech Recognition API not supported in this browser.');
    }
  }, [onResultCallback]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Already started", e);
      }
    }
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    
    // Stop any currently playing speech to avoid overlapping bot echoes
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    // Find a good native voice if possible
    const voices = window.speechSynthesis.getVoices();
    // Prefer Google UK English Male/Female or standard en-US
    const preferredVoice = voices.find(v => v.name.includes('Google') || v.lang === 'en-US');
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.rate = 0.95; // Slightly slower feels more deliberate and natural
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  return {
    isListening,
    toggleListening,
    speakText,
    stopSpeaking,
    hasSupport: !!SpeechRecognition
  };
};
