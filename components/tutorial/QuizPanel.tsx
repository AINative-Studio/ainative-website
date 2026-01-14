'use client';

/**
 * QuizPanel Component
 * Interactive quiz system with multiple choice questions and scoring
 */

import React, { useState, useEffect } from 'react';
import { QuizQuestion, QuizResult, QUIZ_PASS_THRESHOLD } from '@/types/tutorial';
import { CheckCircle2, XCircle, AlertCircle, Award, RotateCcw } from 'lucide-react';

interface QuizPanelProps {
  chapterId: string;
  questions: QuizQuestion[];
  onComplete: (result: QuizResult) => void;
  previousScore?: number;
  className?: string;
}

export function QuizPanel({
  chapterId,
  questions,
  onComplete,
  previousScore,
  className = '',
}: QuizPanelProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  /**
   * Reset quiz state when chapter changes
   */
  useEffect(() => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setQuizResult(null);
  }, [chapterId]);

  /**
   * Handle answer selection
   */
  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: answerIndex,
    });
  };

  /**
   * Move to next question
   */
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResults();
    }
  };

  /**
   * Move to previous question
   */
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  /**
   * Calculate quiz results
   */
  const calculateResults = () => {
    let correctCount = 0;

    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctCount++;
      }
    });

    const score = (correctCount / questions.length) * 100;
    const passed = score >= QUIZ_PASS_THRESHOLD * 100;

    const result: QuizResult = {
      chapterId,
      score,
      totalQuestions: questions.length,
      passed,
      answers: selectedAnswers,
    };

    setQuizResult(result);
    setShowResults(true);
    onComplete(result);
  };

  /**
   * Retry quiz
   */
  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setQuizResult(null);
  };

  /**
   * Check if answer is correct
   */
  const isCorrectAnswer = (questionIndex: number, answerIndex: number): boolean => {
    return questions[questionIndex].correctAnswer === answerIndex;
  };

  /**
   * Check if answer was selected by user
   */
  const isSelectedAnswer = (questionIndex: number, answerIndex: number): boolean => {
    return selectedAnswers[questionIndex] === answerIndex;
  };

  /**
   * Get answer class based on state
   */
  const getAnswerClass = (questionIndex: number, answerIndex: number): string => {
    if (!showResults) {
      return isSelectedAnswer(questionIndex, answerIndex) ? 'selected' : '';
    }

    const isCorrect = isCorrectAnswer(questionIndex, answerIndex);
    const isSelected = isSelectedAnswer(questionIndex, answerIndex);

    if (isCorrect && isSelected) return 'correct selected';
    if (isCorrect) return 'correct';
    if (isSelected) return 'incorrect selected';
    return '';
  };

  if (questions.length === 0) {
    return (
      <div className={`quiz-panel ${className}`}>
        <div className="quiz-panel__empty">
          <AlertCircle size={48} />
          <p>No quiz questions available for this chapter</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`quiz-panel ${className}`}>
      {!showResults ? (
        <>
          {/* Quiz Header */}
          <div className="quiz-panel__header">
            <h3 className="quiz-panel__title">Chapter Quiz</h3>
            <div className="quiz-panel__progress">
              Question {currentQuestion + 1} of {questions.length}
            </div>
            {previousScore !== undefined && (
              <div className="quiz-panel__previous-score">
                Previous score: {Math.round(previousScore)}%
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="quiz-panel__progress-bar">
            <div
              className="quiz-panel__progress-fill"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question */}
          <div className="quiz-panel__question">
            <h4 className="quiz-panel__question-text">{questions[currentQuestion].question}</h4>

            <div className="quiz-panel__options">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  className={`quiz-panel__option ${selectedAnswers[currentQuestion] === index ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  <span className="quiz-panel__option-letter">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="quiz-panel__option-text">{option}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="quiz-panel__navigation">
            <button
              className="quiz-panel__nav-btn"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </button>

            <div className="quiz-panel__question-dots">
              {questions.map((_, index) => (
                <button
                  key={index}
                  className={`quiz-panel__dot ${index === currentQuestion ? 'active' : ''} ${selectedAnswers[index] !== undefined ? 'answered' : ''}`}
                  onClick={() => setCurrentQuestion(index)}
                  aria-label={`Go to question ${index + 1}`}
                />
              ))}
            </div>

            <button
              className="quiz-panel__nav-btn quiz-panel__nav-btn--primary"
              onClick={handleNext}
              disabled={selectedAnswers[currentQuestion] === undefined}
            >
              {currentQuestion === questions.length - 1 ? 'Submit' : 'Next'}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Results */}
          <div className="quiz-panel__results">
            <div className={`quiz-panel__results-header ${quizResult?.passed ? 'passed' : 'failed'}`}>
              {quizResult?.passed ? (
                <>
                  <Award size={48} className="quiz-panel__results-icon" />
                  <h3 className="quiz-panel__results-title">Congratulations!</h3>
                  <p className="quiz-panel__results-message">You passed the quiz!</p>
                </>
              ) : (
                <>
                  <XCircle size={48} className="quiz-panel__results-icon" />
                  <h3 className="quiz-panel__results-title">Not quite there yet</h3>
                  <p className="quiz-panel__results-message">
                    You need {QUIZ_PASS_THRESHOLD * 100}% to pass
                  </p>
                </>
              )}

              <div className="quiz-panel__results-score">
                <div className="quiz-panel__score-circle">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" className="score-circle-bg" />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      className="score-circle-fill"
                      style={{
                        strokeDashoffset: `${283 - (283 * (quizResult?.score || 0)) / 100}`,
                      }}
                    />
                  </svg>
                  <div className="quiz-panel__score-text">{Math.round(quizResult?.score || 0)}%</div>
                </div>
                <p className="quiz-panel__score-details">
                  {questions.filter((q, i) => selectedAnswers[i] === q.correctAnswer).length} out of{' '}
                  {questions.length} correct
                </p>
              </div>
            </div>

            {/* Review Answers */}
            <div className="quiz-panel__review">
              <h4 className="quiz-panel__review-title">Review Your Answers</h4>

              {questions.map((question, qIndex) => (
                <div key={qIndex} className="quiz-panel__review-question">
                  <div className="quiz-panel__review-header">
                    <span className="quiz-panel__review-number">Question {qIndex + 1}</span>
                    {isCorrectAnswer(qIndex, selectedAnswers[qIndex]) ? (
                      <CheckCircle2 size={20} className="text-green-500" />
                    ) : (
                      <XCircle size={20} className="text-red-500" />
                    )}
                  </div>

                  <p className="quiz-panel__review-text">{question.question}</p>

                  <div className="quiz-panel__review-options">
                    {question.options.map((option, aIndex) => (
                      <div
                        key={aIndex}
                        className={`quiz-panel__review-option ${getAnswerClass(qIndex, aIndex)}`}
                      >
                        <span className="quiz-panel__review-letter">
                          {String.fromCharCode(65 + aIndex)}
                        </span>
                        <span>{option}</span>
                        {isCorrectAnswer(qIndex, aIndex) && (
                          <CheckCircle2 size={16} className="quiz-panel__review-icon" />
                        )}
                        {isSelectedAnswer(qIndex, aIndex) &&
                          !isCorrectAnswer(qIndex, aIndex) && (
                            <XCircle size={16} className="quiz-panel__review-icon" />
                          )}
                      </div>
                    ))}
                  </div>

                  {question.explanation && (
                    <div className="quiz-panel__explanation">
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Retry Button */}
            <button className="quiz-panel__retry-btn" onClick={handleRetry}>
              <RotateCcw size={16} />
              Retry Quiz
            </button>
          </div>
        </>
      )}

      <style jsx>{`
        .quiz-panel {
          background: var(--background);
          border-radius: 8px;
          border: 1px solid var(--border);
          padding: 2rem;
        }

        .quiz-panel__empty {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--muted-foreground);
        }

        .quiz-panel__empty svg {
          margin-bottom: 1rem;
          opacity: 0.3;
        }

        .quiz-panel__header {
          margin-bottom: 1.5rem;
        }

        .quiz-panel__title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .quiz-panel__progress {
          font-size: 0.875rem;
          color: var(--muted-foreground);
        }

        .quiz-panel__previous-score {
          font-size: 0.8125rem;
          color: var(--primary);
          margin-top: 0.25rem;
        }

        .quiz-panel__progress-bar {
          height: 4px;
          background: var(--secondary);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 2rem;
        }

        .quiz-panel__progress-fill {
          height: 100%;
          background: var(--primary);
          transition: width 0.3s ease;
        }

        .quiz-panel__question {
          margin-bottom: 2rem;
        }

        .quiz-panel__question-text {
          font-size: 1.125rem;
          font-weight: 500;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        .quiz-panel__options {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .quiz-panel__option {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: var(--accent);
          border: 2px solid var(--border);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .quiz-panel__option:hover {
          background: var(--secondary);
          border-color: var(--primary);
        }

        .quiz-panel__option.selected {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .quiz-panel__option-letter {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--background);
          font-weight: 600;
          flex-shrink: 0;
        }

        .quiz-panel__option.selected .quiz-panel__option-letter {
          background: white;
          color: var(--primary);
        }

        .quiz-panel__option-text {
          flex: 1;
          font-size: 0.9375rem;
        }

        .quiz-panel__navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .quiz-panel__question-dots {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .quiz-panel__dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--secondary);
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .quiz-panel__dot.answered {
          background: var(--primary);
        }

        .quiz-panel__dot.active {
          transform: scale(1.3);
          box-shadow: 0 0 0 2px var(--primary);
        }

        .quiz-panel__nav-btn {
          padding: 0.625rem 1.5rem;
          border: 1px solid var(--border);
          background: var(--background);
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .quiz-panel__nav-btn:hover:not(:disabled) {
          background: var(--accent);
          border-color: var(--primary);
        }

        .quiz-panel__nav-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .quiz-panel__nav-btn--primary {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .quiz-panel__nav-btn--primary:hover:not(:disabled) {
          opacity: 0.9;
        }

        .quiz-panel__results-header {
          text-align: center;
          padding: 2rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }

        .quiz-panel__results-header.passed {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05));
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .quiz-panel__results-header.failed {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .quiz-panel__results-icon {
          margin-bottom: 1rem;
        }

        .quiz-panel__results-header.passed .quiz-panel__results-icon {
          color: #22c55e;
        }

        .quiz-panel__results-header.failed .quiz-panel__results-icon {
          color: #ef4444;
        }

        .quiz-panel__results-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .quiz-panel__results-message {
          color: var(--muted-foreground);
          margin-bottom: 1.5rem;
        }

        .quiz-panel__results-score {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .quiz-panel__score-circle {
          position: relative;
          width: 120px;
          height: 120px;
        }

        .quiz-panel__score-circle svg {
          transform: rotate(-90deg);
          width: 100%;
          height: 100%;
        }

        .score-circle-bg {
          fill: none;
          stroke: var(--secondary);
          stroke-width: 8;
        }

        .score-circle-fill {
          fill: none;
          stroke: var(--primary);
          stroke-width: 8;
          stroke-linecap: round;
          stroke-dasharray: 283;
          transition: stroke-dashoffset 0.5s ease;
        }

        .quiz-panel__score-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--primary);
        }

        .quiz-panel__score-details {
          font-size: 0.875rem;
          color: var(--muted-foreground);
        }

        .quiz-panel__review-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .quiz-panel__review-question {
          padding: 1.5rem;
          background: var(--accent);
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .quiz-panel__review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .quiz-panel__review-number {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--muted-foreground);
        }

        .quiz-panel__review-text {
          font-size: 0.9375rem;
          font-weight: 500;
          margin-bottom: 1rem;
        }

        .quiz-panel__review-options {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .quiz-panel__review-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .quiz-panel__review-option.correct {
          border-color: #22c55e;
          background: rgba(34, 197, 94, 0.05);
        }

        .quiz-panel__review-option.incorrect {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.05);
        }

        .quiz-panel__review-letter {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--secondary);
          font-weight: 600;
          font-size: 0.75rem;
          flex-shrink: 0;
        }

        .quiz-panel__review-icon {
          margin-left: auto;
        }

        .quiz-panel__explanation {
          padding: 0.75rem;
          background: var(--background);
          border-radius: 6px;
          font-size: 0.875rem;
          line-height: 1.5;
          border-left: 3px solid var(--primary);
        }

        .quiz-panel__retry-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem 1.5rem;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          margin-top: 1.5rem;
          transition: opacity 0.2s ease;
        }

        .quiz-panel__retry-btn:hover {
          opacity: 0.9;
        }

        @media (max-width: 768px) {
          .quiz-panel {
            padding: 1.5rem;
          }

          .quiz-panel__question-dots {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

export default QuizPanel;
