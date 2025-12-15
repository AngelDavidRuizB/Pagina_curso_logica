import { useState, useRef, useEffect, useCallback } from 'react';

export const useExecutionEngine = (initialCode, validationFn) => {
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  
  const queueRef = useRef([]);
  const userStateRef = useRef({});

  const reset = useCallback(() => {
    setError(null);
    setFeedback(null);
    setCurrentStepIndex(0);
    setTotalSteps(0);
    setIsPlaying(false);
    queueRef.current = [];
    userStateRef.current = {};
  }, []);

  const addToQueue = useCallback((action) => {
    queueRef.current.push(action);
  }, []);

  const updateUserState = useCallback((newState) => {
    userStateRef.current = { ...userStateRef.current, ...newState };
  }, []);

  const runCode = useCallback((setupContextFn) => {
    reset();
    try {
      // Create context
      const context = setupContextFn(addToQueue, updateUserState);
      
      // Create a function from the code string
      const argNames = Object.keys(context);
      const argValues = Object.values(context);
      
      // Basic safety check: prevent infinite loops in while/for if possible, 
      // but for now we just run it. 
      // Ideally we would transform the code to insert loop guards.
      
      const userFunction = new Function(...argNames, code);
      
      // Execute user code
      userFunction(...argValues);
      
      // After execution, check validation
      if (validationFn) {
        // We might need to wait for the queue to finish if validation depends on visual state?
        // But usually validation depends on the logical state captured during execution.
        const result = validationFn(userStateRef.current);
        setFeedback(result);
      }
      
      setTotalSteps(queueRef.current.length);
      
      // Start playing
      setIsPlaying(true);
      
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  }, [code, reset, addToQueue, updateUserState, validationFn]);

  const nextStep = useCallback(() => {
    if (currentStepIndex < queueRef.current.length) {
      const action = queueRef.current[currentStepIndex];
      try {
        action();
      } catch (e) {
        console.error("Error executing step:", e);
      }
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
    }
  }, [currentStepIndex]);

  // Auto-play effect
  useEffect(() => {
    let timer;
    if (isPlaying && currentStepIndex < totalSteps) {
      timer = setTimeout(() => {
        nextStep();
      }, 800); // Delay between steps
    } else if (currentStepIndex >= totalSteps) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, totalSteps, nextStep]);

  return {
    code,
    setCode,
    runCode,
    reset,
    nextStep,
    isDebugMode: false, // Deprecated
    setIsDebugMode: () => {}, // Deprecated
    isPlaying,
    currentStepIndex,
    totalSteps,
    error,
    feedback
  };
};
