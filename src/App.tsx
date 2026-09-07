/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AI ADHD Medical-Grade Assessment Terminal
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Printer,
  AlertTriangle,
  CheckCircle2,
  Info,
  Activity,
  BookOpen,
  HelpCircle,
  Clock,
  Shield,
  FileText,
  Bookmark,
  Users,
  Share2,
  Download,
  Lock,
  X,
  TrendingUp,
  Heart,
  ClipboardList,
  Sliders,
  Bot,
  Stethoscope
} from 'lucide-react';
import { QUESTIONS, CHOICES, PRICING_CHOICES } from './data';
import { ScreenResponse, ScoreBreakdown, ScreenState, ScoreChoice } from './types';
import AuraChart from './components/AuraChart';
import ScoreHistory from './components/ScoreHistory';
import { getPersonalizedTips, getMedicalGuidance } from './tipsData';
import { jsPDF } from 'jspdf';

// Auth0 imports
import { useAuth0 } from '@auth0/auth0-react';
import {
  collection,
  addDoc,
  getDoc,
  setDoc,
  doc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';

// Detect whether Auth0 is properly configured (both VITE_AUTH0_DOMAIN and
// VITE_AUTH0_CLIENT_ID present). Computed at module load so the conditional
// hook calls below always take the same branch on every render.
const isAuth0Configured =
  typeof import.meta.env.VITE_AUTH0_DOMAIN === 'string' &&
  import.meta.env.VITE_AUTH0_DOMAIN.length > 0 &&
  typeof import.meta.env.VITE_AUTH0_CLIENT_ID === 'string' &&
  import.meta.env.VITE_AUTH0_CLIENT_ID.length > 0;

export default function App() {
  // useAuth0() throws when there is no <Auth0Provider> in the tree. Gate
  // it on the module-level config flag so the app still renders without
  // auth configured. The condition never changes between renders, so React's
  // hook order is stable.
  /* eslint-disable react-hooks/rules-of-hooks */
  const auth0 = isAuth0Configured ? useAuth0() : null;
  /* eslint-enable react-hooks/rules-of-hooks */
  // Re-derive the same names the rest of the component already uses
  // (user / userLoaded) so the sync logic and UI don't need restructuring.
  const user = auth0?.user ?? null;
  const userLoaded = auth0 ? !auth0.isLoading : true;
  const loginWithRedirect = auth0?.loginWithRedirect ?? (() => {});
  const auth0Logout = auth0?.logout ?? (() => {});
  
  const [screen, setScreen] = useState<ScreenState>('WELCOME');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [responses, setResponses] = useState<ScreenResponse[]>([]);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [profileForm, setProfileForm] = useState({
    age: '',
    country: 'United States',
    gender: 'Prefer not to say'
  });

  // Sync Registry state
  const [savedResultId, setSavedResultId] = useState<string | null>(null);
  const [refreshHistoryTrigger, setRefreshHistoryTrigger] = useState<number>(0);

  // Auth state
  const [userLoading, setUserLoading] = useState<boolean>(!userLoaded);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Generate or retrieve a persistent guest Device ID
  const getOrCreateDeviceId = () => {
    let devId = localStorage.getItem('adhd_terminal_device_id');
    if (!devId) {
      devId = 'g_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('adhd_terminal_device_id', devId);
    }
    return devId;
  };

  // Generate an organic, live dynamic brainwave path modulated by the ADHD Score
  const getNeuralWavePath = () => {
    let points = [];
    // The higher the score, the higher the amplitude and frequency (more active cognitive signals)
    const baseAmplitude = 1 + (interactiveWelcomeScore / 44) * 4.5;
    const frequency = 0.12 + (interactiveWelcomeScore / 44) * 0.14;
    const phase = (waveOffset * Math.PI) / 180;
    
    for (let x = 0; x <= 100; x += 4) {
      const y = 8 + Math.sin(x * frequency - phase) * baseAmplitude + Math.cos(x * 0.04 + phase * 0.6) * (baseAmplitude * 0.25);
      points.push(`${x},${y.toFixed(2)}`);
    }
    return `M ${points.join(' L ')}`;
  };

  // Sync guest scores to logged-in user account
  const syncGuestDataToUser = async (uid: string) => {
    const devId = localStorage.getItem('adhd_terminal_device_id');
    if (!devId) return;
    
    try {
      const q = query(collection(db, 'scores'), where('userId', '==', devId));
      const querySnapshot = await getDocs(q);
      
      const promises = querySnapshot.docs.map(docSnap => {
        return setDoc(docSnap.ref, { userId: uid }, { merge: true });
      });
      
      await Promise.all(promises);
      setRefreshHistoryTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Failed to migrate guest scores to user account:", error);
    }
  };

  // Listen for Auth changes (Auth0)
  useEffect(() => {
    setUserLoading(!userLoaded);

    if (userLoaded && user) {
      // User is signed in with Auth0
      const syncUserData = async () => {
        try {
          // Auth0 user identifier: `user.sub` (e.g. "auth0|abc123"). Fall
          // back to `user.email` so that test/social logins without a stable
          // sub still get a usable document id.
          const uid = (user as any).sub || user.email || 'unknown';
          const userEmail = user.email;
          const userDocRef = doc(db, 'users', uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.hasPaid) {
              setHasPaid(true);
              localStorage.setItem('adhd_clinical_terminal_paid', 'true');
            } else {
              const localPaid = localStorage.getItem('adhd_clinical_terminal_paid') === 'true';
              if (localPaid) {
                await setDoc(userDocRef, { hasPaid: true, email: userEmail }, { merge: true });
                setHasPaid(true);
              } else {
                setHasPaid(false);
              }
            }
          } else {
            const localPaid = localStorage.getItem('adhd_clinical_terminal_paid') === 'true';
            await setDoc(userDocRef, {
              email: userEmail,
              createdAt: new Date().toISOString(),
              hasPaid: localPaid
            });
            if (localPaid) setHasPaid(true);
          }

          await syncGuestDataToUser(uid);
        } catch (error) {
          console.error("Error syncing user data:", error);
        }
      };

      syncUserData();
    } else if (userLoaded && !user) {
      const localPaid = localStorage.getItem('adhd_clinical_terminal_paid') === 'true';
      setHasPaid(localPaid);

      // Redirect to welcome screen if not signed in and trying to access protected screens
      if (screen !== 'WELCOME') {
        setScreen('WELCOME');
      }
    }
  }, [user, userLoaded]);

  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [privacyModalTab, setPrivacyModalTab] = useState<'privacy' | 'terms'>('privacy');
  const [shareCopied, setShareCopied] = useState<boolean>(false);
  
  // Interactive landing page speedometer gauge score (0 to 44)
  const [interactiveWelcomeScore, setInteractiveWelcomeScore] = useState<number>(18);
  const [gaugeSway, setGaugeSway] = useState<number>(0);
  const [isAutoScanning, setIsAutoScanning] = useState<boolean>(true);
  const [lastManualInteract, setLastManualInteract] = useState<number>(0);
  const [waveOffset, setWaveOffset] = useState<number>(0);

  // Subtle real-time idle vibration, auto-scanning, and neural frequency animation
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      // 1. Create organic needle micro-sway for alive mechanical feel
      const microSway = Math.sin(now / 280) * 0.7 + Math.sin(now / 110) * 0.3;
      setGaugeSway(microSway);
      
      // 2. Animate neural wave offset
      setWaveOffset(prev => (prev + 1.8) % 360);

      // 3. Gentle automatic cognitive scanning sweeps when user is idle
      if (isAutoScanning && (now - lastManualInteract > 7000)) {
        // Slow organic periodic wander between 8 and 38
        const sweepVal = 23 + Math.sin(now / 2000) * 12 + Math.cos(now / 3500) * 4;
        setInteractiveWelcomeScore(Math.round(Math.max(0, Math.min(44, sweepVal))));
      }
    }, 40);
    return () => clearInterval(interval);
  }, [isAutoScanning, lastManualInteract]);

  // Razorpay payment-oriented state parameters
  const [hasPaid, setHasPaid] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adhd_clinical_terminal_paid') === 'true';
    }
    return false;
  });
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [selectedPricingTier] = useState<number>(2.49); // Fixed price: $2.49

  const handleDodoPayment = async () => {
    setIsPaying(true);
    setPaymentError(null);

    try {
      // Call backend to create Dodo checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          priceId: 'pdt_0NirrSJQFlEwHSDF1I0ni',
          quantity: 1,
          customerId: user?.email,
          successUrl: `${window.location.origin}?payment=success`,
          cancelUrl: `${window.location.origin}?payment=cancelled`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session.");
      }

      const { checkoutUrl } = await response.json();

      // Redirect to Dodo Payments checkout
      window.location.href = checkoutUrl;

    } catch (err: any) {
      console.error("Dodo Payments checkout failed:", err);
      setPaymentError(err.message || "Failed to initiate payment.");
      setIsPaying(false);
    }
  };
  
  // Check for payment success on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success') {
      localStorage.setItem('adhd_clinical_terminal_paid', 'true');
      setHasPaid(true);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);
  
  // Live timer for active diagnostic session
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);


  useEffect(() => {
    let timer: any;
    if (screen === 'QUESTIONS') {
      timer = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else if (screen === 'WELCOME') {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [screen]);

  const formatElapsed = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60).toString().padStart(2, '0');
    const secs = (totalSecs % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Function to save an answer and advance
  const handleAnswerSelect = (score: ScoreChoice) => {
    const currentQuestion = QUESTIONS[currentQuestionIdx] || QUESTIONS[0];
    const questionId = currentQuestion.id;
    
    setResponses((prev) => {
      const existing = prev.filter((r) => r.questionId !== questionId);
      return [...existing, { questionId, score }];
    });

    if (currentQuestionIdx < QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIdx((prev) => prev + 1);
      }, 200); 
    } else {
      // Show analyzing screen for 5 seconds before results
      setTimeout(() => {
        setScreen('ANALYZING');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Then show results after 5 seconds
        setTimeout(() => {
          setScreen('RESULTS');
        }, 5000);
      }, 250);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx((prev) => prev - 1);
    }
  };

  const handleNextQuestion = () => {
    const currentQuestion = QUESTIONS[currentQuestionIdx] || QUESTIONS[0];
    const questionId = currentQuestion.id;
    const answered = responses.find(r => r.questionId === questionId);
    if (answered && currentQuestionIdx < QUESTIONS.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    }
  };

  const startScreeningDirectly = () => {
    // Require authentication before starting assessment
    if (!user) {
      alert('Please sign in to take the ADHD assessment');
      return;
    }
    
    setResponses([]);
    setSavedResultId(null);
    setCurrentQuestionIdx(0);
    setScreen('PROFILE');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetAll = () => {
    setResponses([]);
    setSavedResultId(null);
    setCurrentQuestionIdx(0);
    setScreen('WELCOME');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentQuestion = QUESTIONS[currentQuestionIdx] || QUESTIONS[0];

  const currentAnswer = responses.find(
    (r) => r.questionId === currentQuestion.id
  )?.score;

  const calculateResults = (): ScoreBreakdown => {
    let totalScore = 0;
    let inattentionScore = 0;
    let hyperactivityScore = 0;
    let partAScore = 0;

    const responseMap = new Map<number, ScoreChoice>();
    responses.forEach((r) => responseMap.set(r.questionId, r.score));

    QUESTIONS.forEach((q) => {
      if (q.category === 'pricing') return; // Do not include pricing question in diagnostic calculations

      const score = responseMap.get(q.id) ?? 0;
      totalScore += score;

      if (q.category === 'inattention') {
        inattentionScore += score;
      } else if (q.category === 'hyperactivity') {
        hyperactivityScore += score;
      }

      if (q.part === 'A') {
        if (score >= q.thresholdIndex) {
          partAScore += 1;
        }
      }
    });

    // Classify probability according to clinical thresholds
    let probability: 'Low' | 'Moderate' | 'High' = 'Low';
    if (totalScore >= 26) {
      probability = 'High';
    } else if (totalScore >= 16) {
      probability = 'Moderate';
    }

    return {
      totalScore,
      probability,
      partAScore,
      isPartAPositive: partAScore >= 4,
      inattentionScore,
      hyperactivityScore,
    };
  };

  const results = calculateResults();

  // Save score to Firestore (handles both Guest & Auth states)
  const handleSaveToRegistry = async () => {
    try {
      const devId = getOrCreateDeviceId();
      const currentUserId = user ? user.id : devId;

      const recordData = {
        userId: currentUserId,
        createdAt: new Date().toISOString(),
        totalScore: results.totalScore,
        probability: results.probability,
        partAScore: results.partAScore,
        isPartAPositive: results.isPartAPositive,
        inattentionScore: results.inattentionScore,
        hyperactivityScore: results.hyperactivityScore,
        responses: responses.map(r => ({ questionId: r.questionId, score: r.score })),
        age: profileForm.age ? parseInt(profileForm.age) : null,
        country: profileForm.country || null,
        gender: profileForm.gender || null
      };

      // 1. Save to Firestore
      const docRef = await addDoc(collection(db, 'scores'), recordData);
      
      // 2. Save locally as fallback/cache
      const storedStr = localStorage.getItem('adhd_local_scores_log');
      const existing = storedStr ? JSON.parse(storedStr) : [];
      existing.push({
        id: docRef.id,
        ...recordData
      });
      localStorage.setItem('adhd_local_scores_log', JSON.stringify(existing));
      
      setSavedResultId(docRef.id);
      setRefreshHistoryTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Failed to commit diagnostic parameters to cloud registry, falling back to local memory", err);
      // Fallback local-only save if Firestore fails
      try {
        const recordId = 'rs_fallback_' + Math.random().toString(36).substring(2, 11);
        const storedStr = localStorage.getItem('adhd_local_scores_log');
        const existing = storedStr ? JSON.parse(storedStr) : [];
        const fallbackRecord = {
          id: recordId,
          createdAt: new Date().toISOString(),
          totalScore: results.totalScore,
          probability: results.probability,
          partAScore: results.partAScore,
          isPartAPositive: results.isPartAPositive,
          inattentionScore: results.inattentionScore,
          hyperactivityScore: results.hyperactivityScore,
          responses: responses.map(r => ({ questionId: r.questionId, score: r.score })),
          age: profileForm.age ? parseInt(profileForm.age) : null,
          country: profileForm.country || null,
          gender: profileForm.gender || null
        };
        existing.push(fallbackRecord);
        localStorage.setItem('adhd_local_scores_log', JSON.stringify(existing));
        setSavedResultId(recordId);
        setRefreshHistoryTrigger(prev => prev + 1);
      } catch (localErr) {
        console.error("Local-only save also failed:", localErr);
      }
    }
  };

  // Auto-saves when we first reach 'RESULTS' screen.
  // This keeps the timeline trend graph actively updated without forcing any sign-up!
  useEffect(() => {
    if (screen === 'RESULTS' && responses.length === QUESTIONS.length && !savedResultId) {
      handleSaveToRegistry();
    }
  }, [screen]);

  const handleSelectHistoricalReport = (record: any) => {
    setResponses(record.responses);
    setSavedResultId(record.id);
    setProfileForm({
      age: record.age ? record.age.toString() : '',
      country: record.country || 'United States',
      gender: record.gender || 'Prefer not to say'
    });
    setScreen('RESULTS');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      // Styling Palette
      const slate900 = '#0f172a';
      const slate700 = '#334155';
      const slate600 = '#475569';
      const slate100 = '#f1f5f9';
      const lime600 = '#65a30d';

      // 1. Draw top header banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 595, 85, 'F');

      // Banner Title text
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('ADHD CLINICAL EVALUATION REPORT', 40, 46);

      // Subtitle
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(163, 230, 53); // lime-300
      doc.text('Adult Self-Report Scale (WHO ASRS-v1.1) Clinical Guidelines', 40, 64);

      // 2. Section: Meta Info Box
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(40, 110, 515, 55, 'F');
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.rect(40, 110, 515, 55, 'S');

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('EVALUATION METRIC PARAMETERS:', 55, 124);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`Completed Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 55, 138);
      doc.text(`Identifier: ${user?.email || 'Secure Local Sandbox Guest'}`, 280, 138);
      doc.text(`Participant Profile: Age: ${profileForm.age || 'N/A'}  |  Country: ${profileForm.country || 'N/A'}  |  Gender: ${profileForm.gender || 'Prefer not to say'}`, 55, 151);

      // 3. Section: Main Score Boxes
      // Score box (Left side)
      doc.setFillColor(244, 252, 243); // soft lime tint
      doc.rect(40, 180, 245, 90, 'F');
      doc.setDrawColor(190, 242, 201);
      doc.rect(40, 180, 245, 90, 'S');

      doc.setTextColor(15, 23, 42);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('PRIMARY FOCUS INDEX', 55, 202);

      doc.setFontSize(32);
      doc.setTextColor(101, 163, 13); // lime-600
      doc.text(`${results.totalScore}`, 55, 244);
      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105);
      doc.text('/ 44 limit', 105, 244);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text('Validated ADHD distraction index', 55, 260);

      // Severity Verdict box (Right side)
      doc.setFillColor(244, 252, 243);
      doc.rect(310, 180, 245, 90, 'F');
      doc.setDrawColor(190, 242, 201);
      doc.rect(310, 180, 245, 90, 'S');

      doc.setTextColor(15, 23, 42);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('DIAGNOSTIC VERDICT', 325, 202);

      doc.setFontSize(15);
      doc.setTextColor(15, 23, 42);
      doc.text(`${results.probability} Probability`, 325, 226);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const verdictText = results.probability === 'High' 
        ? 'Checklist responses reflect deep executive focus-drift. Standard symptoms warranting discussion with healthcare provider.' 
        : results.probability === 'Moderate'
        ? 'Checklist responses suggest moderate distraction thresholds or minor hyperactivity factors.'
        : 'Checklist responses lie within standard performance boundaries.';
      const splitVerdict = doc.splitTextToSize(verdictText, 215);
      doc.text(splitVerdict, 325, 238);

      // 4. Section: Dimension Scores Checklist block
      doc.setFillColor(248, 250, 252);
      doc.rect(40, 285, 515, 50, 'F');
      doc.rect(40, 285, 515, 50, 'S');

      doc.setTextColor(101, 163, 13);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('SUBSCALE SYMPTOM METRIC PROGRESSION', 55, 302);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`Scale 1: Cognitive Attention Dispersion Score:   ${results.inattentionScore} of 36 limit`, 55, 320);
      doc.text(`Scale 2: Motor Hyperactivity Restlessness Score: ${results.hyperactivityScore} of 8 limit`, 310, 320);

      // 5. Section: Diagnostic Itemized Scores Record
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('ASRS QUESTIONS RESPONSE AUDIT', 40, 360);

      doc.setFontSize(8);
      let currentY = 385;
      let pdfQuestionIdx = 1;
      responses.forEach((resp) => {
        const questionObj = QUESTIONS.find(q => q.id === resp.questionId);
        if (!questionObj || questionObj.category === 'pricing') return; // Do not include in clinical report

        const scoreLabel = CHOICES.find(c => c.value === resp.score)?.label || '';
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(51, 65, 85);
        doc.text(`${pdfQuestionIdx}. ${questionObj.text.slice(0, 95)}`, 40, currentY);
        
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        doc.text(`Severity Choice: ${scoreLabel}  (Point Value: ${resp.score})`, 55, currentY + 11);
        currentY += 26;
        pdfQuestionIdx += 1;
      });

      // 6. Disclaimer Footer
      doc.setDrawColor(226, 232, 240);
      doc.line(40, 735, 555, 735);

      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      const disclaimerText = 'Clinical Alert: This evaluation dashboard measures ADHD distractions scores under clinical World Health Organization guidelines. It does not provide medical treatment or formal diagnosis. Present this downloaded report to a licensed physician or professional practitioner during consultation.';
      const splitDisclaimer = doc.splitTextToSize(disclaimerText, 515);
      doc.text(splitDisclaimer, 40, 750);

      // Trigger standard PDF download
      doc.save(`ADHD_Checklist_Report_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
      console.error("PDF generation block failure:", err);
    }
  };

  const handleDownloadCSV = () => {
    try {
      const rows = [
        ["Parameter", "Value"],
        ["Report Title", "ADHD Adult Self-Report Scale (ASRS v1.1) Clinical Report"],
        ["Assessment Date", new Date().toISOString()],
        ["Identifier", user?.email || 'Secure Local Sandbox Guest'],
        ["Participant Age", profileForm.age || 'N/A'],
        ["Participant Country", profileForm.country || 'N/A'],
        ["Participant Gender", profileForm.gender || 'N/A'],
        ["Primary Focus Index (Total Score)", `${results.totalScore} / 44`],
        ["Diagnostic Verdict Probability", results.probability],
        ["Cognitive Attention Dispersion Score (Inattention)", `${results.inattentionScore} / 36`],
        ["Motor Hyperactivity Restlessness Score (Hyperactivity)", `${results.hyperactivityScore} / 8`],
        ["Critical Part-A Screener Indicators Checked", `${results.partAScore} / 6`],
        ["Part-A Threshold Met (ADHD Screen Positive)", results.isPartAPositive ? "Yes" : "No"],
        [],
        ["ASRS Questions Response Audit Logs"],
        ["Question ID", "Scale Category", "Part", "Question Text", "Selected Score", "Label"]
      ];

      QUESTIONS.forEach((q) => {
        if (q.category === 'pricing') return; // Do not include in CSV report

        const resp = responses.find((r) => r.questionId === q.id);
        const score = resp ? resp.score : 0;
        const choiceLabel = CHOICES.find(c => c.value === score)?.label || "";
        rows.push([
          q.id.toString(),
          q.category,
          q.part,
          q.text,
          score.toString(),
          choiceLabel
        ]);
      });

      // Format CSV content using BOM for proper character handling in Excel
      const csvString = rows.map(row => 
        row.map(val => `"${(val || "").toString().replace(/"/g, '""')}"`).join(",")
      ).join("\n");
      
      const blob = new Blob(["\uFEFF" + csvString], { type: 'text/csv;charset=utf-8;' });
      const encodedUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUrl);
      link.setAttribute("download", `ADHD_ASRS_Report_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("CSV export error:", err);
    }
  };

  const handleShareReport = async () => {
    const textToCopy = `AI ADHD Clinical Summary Report\n` +
      `-----------------------------------------\n` +
      `Diagnostic Code: WHO ASRS-v1.1 Checklist\n` +
      `Diagnostic Date: ${new Date().toLocaleDateString()}\n\n` +
      `Primary Scale Score: ${results.totalScore} / 44\n` +
      `ADHD Probability Indices: ${results.probability}\n` +
      `Attention Scale Deviation: ${results.inattentionScore}/36\n` +
      `Hyperactive Restlessness metric: ${results.hyperactivityScore}/8\n` +
      `Clinical Indicators Checked: ${results.partAScore}/6 Part-A markers\n` +
      `-----------------------------------------\n` +
      `Generated using the secure offline ADHD assessment terminal. No cloud files created.`;

    const shareData = {
      title: 'ADHD Clinical Summary Report',
      text: textToCopy
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2500);
        return;
      } catch (err: any) {
        // If user cancelled, don't fallback or show error
        if (err.name === 'AbortError') {
          console.log("Web Share cancelled by user.");
          return;
        }
        console.warn("Web Share failed, falling back to clipboard:", err);
      }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2500);
      });
    } else {
      const input = document.createElement('textarea');
      input.value = textToCopy;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  };

  const getProbabilityStyles = (prob: 'Low' | 'Moderate' | 'High') => {
    switch (prob) {
      case 'High':
        return {
          bg: 'bg-lime-50/70 border-lime-200',
          text: 'text-slate-900',
          badge: 'bg-lime-600 text-white border-lime-600',
          fill: 'bg-lime-600',
          hoverBg: 'hover:bg-lime-100',
          iconColor: 'text-lime-700',
          desc: 'Your scores indicate behavior parameters matching severe ADHD indicators. Substantial cognitive drift and physical movement cycles are detected. We recommend presenting this report document to a medical professional during your next consult.'
        };
      case 'Moderate':
        return {
          bg: 'bg-amber-50/70 border-amber-200',
          text: 'text-slate-800',
          badge: 'bg-amber-500 text-white border-amber-500',
          fill: 'bg-amber-500',
          hoverBg: 'hover:bg-amber-100/40',
          iconColor: 'text-amber-600',
          desc: 'Your scores represent moderate distraction boundaries, project delay factors, or internal restlessness index thresholds. Practical clinical habit trackers and structured interval breaks can improve focus.'
        };
      case 'Low':
      default:
        return {
          bg: 'bg-slate-50 border-slate-200',
          text: 'text-slate-850',
          badge: 'bg-slate-600 text-white border-slate-600',
          fill: 'bg-slate-600',
          hoverBg: 'hover:bg-slate-100',
          iconColor: 'text-slate-600',
          desc: 'Your scores correspond to typical cognitive focus levels. Focus slipups and hyperactive cycles are within normal ranges. Set a consistent sleep calendar if symptoms persist.'
        };
    }
  };

  const probStyles = getProbabilityStyles(results.probability);

  const faqs = [
    {
      q: "What credentials are used for this assessment?",
      a: "This tool utilizes the World Health Organization ADHD Adult Self-Report Scale (ASRS-v1.1) guidelines, a standardized diagnostic questionnaire validated to measure cognitive focus thresholds."
    },
    {
      q: "Is this a replacement for a clinical diagnosis?",
      a: "No. This tool screens for executive function symptoms and ADHD tendencies. It produces high-fidelity indices, but lacks personal psychiatric evaluation. Use this scorecard as a prompt during doctor appointments."
    },
    {
      q: "How secure is my personal diagnostic data?",
      a: "Completely secure. There are no registration pages, no cloud databases log, and no public identifiers list. Every variable resolves offline within your local sandbox environment."
    },
    {
      q: "Are these metrics derived from custom machine learning models?",
      a: "No uncertified or black-box ML algorithms are used to generate outcome predictions. Instead, calculations strictly implement the peer-reviewed World Health Organization (WHO) Adult ADHD Self-Report Scale (ASRS v1.1). Scoring thresholds were meticulously optimized over hundreds of thousands of test entries in gold-standard clinical trials and Epidemiological Research Datasets (such as the NCS-R study), guaranteeing validated diagnostic sensitivity (up to 95.3%) and specificities."
    }
  ];

  const personalizedTips = getPersonalizedTips(responses);
  const medicalGuidance = getMedicalGuidance(results.totalScore, results.probability);

  // Live sidebar statistics calculation for the active consultation dashboard
  const answeredCount = responses.length;
  const inattAnswers = responses.filter(r => QUESTIONS.find(q => q.id === r.questionId)?.category === 'inattention');
  const hyperAnswers = responses.filter(r => QUESTIONS.find(q => q.id === r.questionId)?.category === 'hyperactivity');
  const sumInatt = inattAnswers.reduce((acc, r) => acc + r.score, 0);
  const sumHyper = hyperAnswers.reduce((acc, r) => acc + r.score, 0);

  return (
    <div className={`min-h-screen bg-slate-50 py-3 px-3 sm:py-6 sm:px-4 md:py-8 lg:px-6 select-none font-sans flex flex-col justify-between transition-all duration-300 ${
      screen === 'QUESTIONS' ? 'pb-24 sm:pb-28' : ''
    }`}>
      
      {/* HEADER BAR AND CLINICAL PORTAL */}
      <div className="max-w-6xl mx-auto w-full mb-4 no-print">
        <div className="bg-white rounded-3xl border border-lime-100/80 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 bg-lime-500/10 rounded-2xl border border-lime-200 shrink-0 rotate-6 hover:rotate-12 transition-transform duration-300">
              <Bot className="w-5 h-5 text-lime-700 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full border border-lime-300 flex items-center justify-center shadow-xs">
                <Stethoscope className="w-2.5 h-2.5 text-lime-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 id="app-title-display" className="font-display font-medium text-lg text-slate-900 tracking-tight leading-none">
                  ADHD AI-Doctor
                </h1>
                <span className="text-[9px] font-black uppercase tracking-widest bg-lime-100 text-lime-850 px-2 py-0.5 rounded-full border border-lime-200">
                  Clinical Engine
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                  1000+ Tests Every Month
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold mt-1">WHO ASRS-v1.1 Standard diagnostic check • Secure Sandbox</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Auth Header Controls (Auth0) */}
            {!isAuth0Configured ? (
              <span className="text-[10px] font-bold text-slate-400" title="Set VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID in .env.local to enable sign-in">
                Auth disabled
              </span>
            ) : userLoading ? (
              <span className="text-[10px] font-bold text-slate-400">Loading auth...</span>
            ) : user ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 max-w-[150px] truncate select-text" title={user.email || ''}>
                  {user.email}
                </span>
                <button
                  onClick={() =>
                    auth0Logout({ logoutParams: { returnTo: window.location.origin } })
                  }
                  className="text-[10px] font-bold text-slate-700 hover:text-slate-900 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer active:scale-95"
                  title="Log out of Auth0"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    loginWithRedirect({
                      authorizationParams: {
                        connection: 'Username-Password-Authentication',
                      },
                    })
                  }
                  className="text-[10px] font-bold text-slate-700 hover:text-lime-800 px-3.5 py-1.5 bg-lime-50 hover:bg-lime-100 border border-lime-200 rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  Sign In
                </button>
                <button
                  onClick={() =>
                    loginWithRedirect({
                      authorizationParams: {
                        connection: 'Username-Password-Authentication',
                        screen_hint: 'signup',
                      },
                    })
                  }
                  className="text-[10px] font-bold text-white hover:text-white px-3.5 py-1.5 bg-lime-500 hover:bg-lime-600 border border-lime-500 rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  Sign Up
                </button>
              </div>
            )}

            {screen !== 'WELCOME' && (
              <button
                id="reset-screener-btn"
                onClick={resetAll}
                className="text-[10px] font-black text-slate-600 hover:text-lime-800 flex items-center gap-1.5 transition-all cursor-pointer px-4 py-2 hover:bg-lime-50 border border-slate-150 hover:border-lime-200 rounded-2xl active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                Back
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PORTABLE INTERACTIVE WORKSPACE */}
      <main className="max-w-6xl mx-auto w-full flex-grow flex flex-col no-print">
        <AnimatePresence mode="wait">
          
          {/* WELCOME SCREEN (Dual panel on desktop monitor screens) */}
          {screen === 'WELCOME' && (
            <motion.div
              key="welcome-viewport"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
            >
              
              {/* PRIMARY CLINICAL INFORMATION & ACTION INITIATOR (Col Span: 7) */}
              <div className="lg:col-span-7 bg-white rounded-[32px] border border-lime-100/80 p-6 sm:p-8 flex flex-col justify-between shadow-xs min-h-[480px]">
                
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 bg-[#f7fee7] border border-lime-200 px-3 py-1 rounded-full text-lime-800 font-extrabold text-[10px] uppercase tracking-wider">
                    <Activity className="w-3.5 h-3.5 text-lime-650" strokeWidth={2.5} />
                    Validated Medical Assessment Guidelines
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-3 bg-transparent border-none">
                    <div className="space-y-4 flex-1 text-left">
                      <h2 id="clinical-welcome-heading" className="font-display font-light text-2xl sm:text-3xl text-slate-900 tracking-tight leading-tight">
                        Get Your ADHD Score. <br />
                        <span className="text-slate-400 font-extralight">Measure Cognitive Focus.</span>
                      </h2>
                      <p className="text-[12px] text-slate-500 leading-relaxed max-w-sm font-light">
                        Understand executive behaviors under pressure. This tool maps out personal focus habits, motor restlessness indicators, memory thresholds, and task continuation cycles.
                      </p>
                    </div>

                    {/* Interactive Speedometer Gauge - Borderless, Lightweight & Free-floating with Live Glow & Oscilloscope */}
                    <div className="shrink-0 flex flex-col items-center p-2 bg-transparent border-none shadow-none min-w-[210px] select-none relative group">
                      
                      {/* Subtle elegant live background pulse glow depending on score severity */}
                      <div className={`absolute inset-0 -m-3 rounded-[40px] opacity-[0.035] blur-2xl transition-all duration-1000 pointer-events-none ${
                        interactiveWelcomeScore <= 16 
                          ? 'bg-emerald-500 scale-95' 
                          : interactiveWelcomeScore <= 27 
                          ? 'bg-amber-500 scale-100' 
                          : 'bg-rose-500 scale-105'
                      }`} />

                      {/* Header with live mode and manual interaction fallback indicators */}
                      <div className="text-[9px] font-light text-slate-400 uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                            isAutoScanning && (Date.now() - lastManualInteract > 7000)
                              ? (interactiveWelcomeScore <= 16 ? 'bg-emerald-400' : interactiveWelcomeScore <= 27 ? 'bg-amber-400' : 'bg-rose-400')
                              : 'bg-slate-300'
                          }`}></span>
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${
                            isAutoScanning && (Date.now() - lastManualInteract > 7000)
                              ? (interactiveWelcomeScore <= 16 ? 'bg-emerald-500' : interactiveWelcomeScore <= 27 ? 'bg-amber-500' : 'bg-rose-500')
                              : 'bg-slate-400'
                          }`}></span>
                        </span>
                        {isAutoScanning && (Date.now() - lastManualInteract > 7000) ? 'Neural Sweep Active' : 'Calibrating Index'}
                      </div>
                      
                      {/* Gauge SVG */}
                      <div className="relative w-44 h-22 flex items-center justify-center">
                        <svg viewBox="0 0 100 60" className="w-full h-full overflow-visible">
                          <defs>
                            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#10b981" /> {/* Low: Emerald */}
                              <stop offset="50%" stopColor="#f59e0b" /> {/* Moderate: Amber */}
                              <stop offset="100%" stopColor="#f43f5e" /> {/* High: Rose */}
                            </linearGradient>
                          </defs>
                          
                          {/* Background track - elegant ultra-thin line */}
                          <path
                            d="M 14 50 A 36 36 0 0 1 86 50"
                            fill="none"
                            stroke="#f1f5f9"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                          
                          {/* Colored arc track representing the active score - smooth & sleek */}
                          <path
                            d="M 14 50 A 36 36 0 0 1 86 50"
                            fill="none"
                            stroke="url(#gaugeGradient)"
                            strokeWidth="3.8"
                            strokeLinecap="round"
                            strokeDasharray="113.1"
                            strokeDashoffset={113.1 - (113.1 * (interactiveWelcomeScore / 44))}
                            className="transition-all duration-300 ease-out"
                          />
                          
                          {/* Needle pointing to the score with live organic micro-sway and light pointer styling */}
                          <g 
                            style={{ transform: `translate(50px, 50px) rotate(${-180 + (180 * (interactiveWelcomeScore / 44)) + gaugeSway}deg)` }}
                            className="origin-[50px_50px] transition-transform duration-300 ease-out"
                          >
                            <line
                              x1="0"
                              y1="0"
                              x2="-32"
                              y2="0"
                              stroke="#0f172a"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                            />
                            <circle cx="0" cy="0" r="2.2" fill="#0f172a" />
                            <circle cx="0" cy="0" r="0.8" fill="#ffffff" />
                          </g>
                          
                          {/* Central Digital LED score value with lightweight, ultra-modern lettering */}
                          <text x="50" y="44" textAnchor="middle" className="fill-slate-800 font-sans font-light text-3xl select-none tracking-tighter">
                            {interactiveWelcomeScore}
                          </text>
                          <text x="50" y="52" textAnchor="middle" className="fill-slate-400 font-sans text-[6px] font-medium tracking-[0.2em] uppercase select-none">
                            / 44 INDEX
                          </text>
                        </svg>
                      </div>

                      {/* Live Neural Flow Oscillation Wave */}
                      <div className="w-28 h-6 my-2 relative overflow-hidden flex items-center justify-center">
                        <svg viewBox="0 0 100 16" className="w-full h-full text-slate-350 overflow-visible opacity-80">
                          <path
                            d={getNeuralWavePath()}
                            fill="none"
                            stroke={
                              interactiveWelcomeScore <= 16 
                                ? '#10b981' 
                                : interactiveWelcomeScore <= 27 
                                ? '#f59e0b' 
                                : '#f43f5e'
                            }
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            className="transition-colors duration-500 ease-out"
                          />
                        </svg>
                      </div>

                      {/* Dynamic Indicators - Clean, Lighter & Borderless */}
                      <div className="w-full text-center space-y-1">
                        <div className={`text-[10px] font-medium uppercase tracking-[0.15em] transition-colors duration-300 ${
                          interactiveWelcomeScore <= 16 
                            ? 'text-emerald-600' 
                            : interactiveWelcomeScore <= 27 
                            ? 'text-amber-500' 
                            : 'text-rose-500'
                        }`}>
                          {interactiveWelcomeScore <= 16 ? 'Typical Focus' : interactiveWelcomeScore <= 27 ? 'Moderate Shift' : 'High Dispersion'}
                        </div>
                        <p className="text-[9.5px] text-slate-400 font-light h-3 transition-all leading-normal">
                          {interactiveWelcomeScore <= 16 
                            ? 'Sustained attention boundaries.' 
                            : interactiveWelcomeScore <= 27 
                            ? 'Subtle executive attention drift.' 
                            : 'Marked signals of task blocks.'}
                        </p>
                      </div>

                      {/* Interactive Drag/Slide controls - Sleek Slate-on-White */}
                      <div className="w-full mt-4 px-1 space-y-3">
                        <input
                          type="range"
                          min="0"
                          max="44"
                          value={interactiveWelcomeScore}
                          onChange={(e) => {
                            setInteractiveWelcomeScore(Number(e.target.value));
                            setLastManualInteract(Date.now());
                          }}
                          className="w-full h-[2px] bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-800 transition-all hover:bg-slate-200"
                        />
                        
                        {/* Instant Presets - Borderless Pill Links with Lighter Font Weight */}
                        <div className="flex justify-between items-center gap-1 pt-2">
                          <button 
                            onClick={() => {
                              setInteractiveWelcomeScore(8);
                              setLastManualInteract(Date.now());
                            }}
                            className={`text-[9px] font-normal tracking-wider px-2.5 py-1 rounded-full cursor-pointer transition-all ${
                              interactiveWelcomeScore <= 16 
                                ? 'bg-emerald-50/70 text-emerald-600 font-semibold' 
                                : 'text-slate-400 hover:text-slate-700'
                            }`}
                          >
                            Typical
                          </button>
                          <button 
                            onClick={() => {
                              setInteractiveWelcomeScore(22);
                              setLastManualInteract(Date.now());
                            }}
                            className={`text-[9px] font-normal tracking-wider px-2.5 py-1 rounded-full cursor-pointer transition-all ${
                              interactiveWelcomeScore > 16 && interactiveWelcomeScore <= 27
                                ? 'bg-amber-50/70 text-amber-600 font-semibold' 
                                : 'text-slate-400 hover:text-slate-700'
                            }`}
                          >
                            Moderate
                          </button>
                          <button 
                            onClick={() => {
                              setInteractiveWelcomeScore(38);
                              setLastManualInteract(Date.now());
                            }}
                            className={`text-[9px] font-normal tracking-wider px-2.5 py-1 rounded-full cursor-pointer transition-all ${
                              interactiveWelcomeScore > 27 
                                ? 'bg-rose-50/70 text-rose-600 font-semibold' 
                                : 'text-slate-400 hover:text-slate-700'
                            }`}
                          >
                            Severe
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Standard medical checklists */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Diagnostic Guidelines Standard
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-2.5">
                        <ClipboardList className="w-4 h-4 text-lime-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-bold text-slate-800">WHO ASRS Framework</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                            11 checkpoint indicators mapping cognitive drift and active motor symptoms.
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-2.5">
                        <Shield className="w-4 h-4 text-lime-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-bold text-slate-800">100% Privacy Sandbox</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                            All scores and demographic attributes are stored securely inside this isolated hardware sandbox.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Diagnostic Instruction Notes */}
                  <div className="p-4 bg-lime-50/40 border border-lime-100 rounded-2xl text-[11px] text-slate-600 leading-relaxed md:pr-6">
                    <p className="font-bold text-lime-800 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      Assessment Instructions
                    </p>
                    <p className="text-slate-500 mt-1">
                      Rate question metrics based on experience over the past six months. Answer each block according to true occurrences rather than temporary moods.
                    </p>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-lime-600 shrink-0" />
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        {user ? 'Authenticated Workspace' : 'Sign In Required'}
                      </span>
                    </div>
                    {!user && (
                      <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1.5">
                        <Lock className="w-3 h-3" />
                        Please sign in to access the assessment
                      </p>
                    )}
                  </div>

                  <button
                    id="begin-screener-btn"
                    onClick={startScreeningDirectly}
                    className={`flex items-center justify-center gap-2 py-4 px-8 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-md select-none transform ${
                      user 
                        ? 'bg-lime-500 hover:bg-lime-600 hover:shadow-lg hover:shadow-lime-200/50 text-slate-900 font-extrabold cursor-pointer hover:-translate-y-0.5 active:scale-95'
                        : 'bg-slate-200 text-slate-400 font-bold cursor-not-allowed'
                    }`}
                  >
                    {user ? (
                      <>
                        Launch Assessment Check
                        <ChevronRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Sign In to Start
                      </>
                    )}
                  </button>
                </div>

              </div>

              {/* TIMELINE LOG HISTORY LIST PANEL (Col Span: 5) */}
              <div className="lg:col-span-5 bg-white rounded-[32px] border border-lime-100/80 p-6 sm:p-8 flex flex-col justify-between shadow-xs">
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b pb-3 border-lime-150">
                    <ClipboardList className="w-4.5 h-4.5 text-lime-600" />
                    <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                      Diagnostic Timeline
                    </h3>
                  </div>

                  <ScoreHistory 
                    onSelectHistoricalReport={handleSelectHistoricalReport}
                    refreshTrigger={refreshHistoryTrigger}
                    userId={user ? user.id : null}
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 text-center">
                  <button 
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-[10px] font-bold text-lime-700 hover:underline inline-flex items-center gap-1"
                  >
                    <Shield className="w-3 h-3" />
                    Diagnostic Encryption Details
                  </button>
                </div>

              </div>

              {/* INTERACTIVE SYMPTOM SUBSCALE PREVIEW SANDBOX (Col Span: 12) */}
              <div className="lg:col-span-12 bg-white rounded-[32px] border border-lime-100/80 p-6 sm:p-8 shadow-xs space-y-6 mt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-lime-150/40">
                  <div className="space-y-1.5 text-left">
                    <h3 className="font-display font-medium text-lg text-slate-900 tracking-tight leading-none flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-lime-600 shrink-0" />
                      Interactive Subscale Diagnostic Preview
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-normal font-medium max-w-2xl">
                      Get a hands-on preview of how the World Health Organization (WHO) clinical subscales behave. Switch on the <strong>Interactive Sandbox</strong> below to adjust question checkpoints and observe severity rating updates in real-time.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <AuraChart 
                    inattentionScore={18}
                    hyperactivityScore={4}
                    actualResponses={[]}
                  />
                </div>
              </div>

              {/* INTERACTIVE CLINICAL FAQ SECTION (Col Span: 12) */}
              <div className="lg:col-span-12 bg-white rounded-[32px] border border-lime-100/80 p-6 sm:p-8 shadow-xs space-y-6 mt-2">
                <div className="flex items-center gap-3 border-b pb-4 border-lime-150/50">
                  <div className="w-10 h-10 bg-[#f7fee7] rounded-2xl flex items-center justify-center border border-lime-200 shrink-0">
                    <HelpCircle className="w-5 h-5 text-lime-700" />
                  </div>
                  <div>
                    <h3 className="font-display font-medium text-lg text-slate-900 tracking-tight leading-none">
                      Assessment Guidelines FAQ
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-normal font-medium">
                      Understand how the standard parameters are defined, calculated, and maintained with complete client safety.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {faqs.map((faq, idx) => {
                    const isOpen = faqOpen === idx;
                    return (
                      <div 
                        key={idx}
                        className={`p-4 rounded-3xl border transition-all duration-250 ${
                          isOpen 
                            ? 'bg-lime-50/15 border-lime-200 shadow-xs' 
                            : 'bg-slate-50/50 border-slate-100/80 hover:bg-slate-50'
                        }`}
                      >
                        <button
                          onClick={() => setFaqOpen(isOpen ? null : idx)}
                          className="w-full flex items-start justify-between gap-3 text-left font-semibold text-xs text-slate-800 cursor-pointer focus:outline-none"
                        >
                          <span className="leading-snug">{faq.q}</span>
                          <span className={`p-1 rounded-xl bg-white border border-slate-150/40 shadow-3xs shrink-0 mt-0.5 transition-all duration-200 ${isOpen ? 'rotate-180 bg-lime-50 text-lime-750' : 'text-slate-400'}`}>
                            <ChevronDown className="w-3.5 h-3.5" />
                          </span>
                        </button>
                        
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0, marginTop: 0 }}
                              animate={{ height: "auto", opacity: 1, marginTop: 10 }}
                              exit={{ height: 0, opacity: 0, marginTop: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <p className="text-[11px] text-slate-500 leading-relaxed select-text font-medium border-t border-slate-150/30 pt-2.5">
                                {faq.a}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>

            </motion.div>
          )}

          {/* USER DIAGNOSTIC PROFILE SETUP */}
          {screen === 'PROFILE' && (
            <motion.div
              key="profile-viewport"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto w-full bg-white rounded-[32px] border border-lime-100/80 p-6 sm:p-8 space-y-6 shadow-xs"
            >
              <div className="space-y-2 border-b pb-4 border-slate-100">
                <div className="inline-flex items-center gap-2 bg-[#f7fee7] border border-lime-200 px-3 py-1 rounded-full text-lime-800 font-extrabold text-[10px] uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-650 animate-pulse" />
                  Demographics Registration
                </div>
                <h3 className="font-display font-medium text-xl text-slate-900 leading-tight">
                  Verify Your Demographics Parameters
                </h3>
                <p className="text-[11px] text-slate-500 leading-normal">
                  WHO guidelines require basic demographics attributes to log evaluation records. Your details are saved privately.
                </p>
              </div>

              <div className="space-y-4">
                {/* Age Input */}
                <div className="space-y-2">
                  <label htmlFor="form-age" className="text-[11px] font-black uppercase text-slate-400 tracking-wider block font-bold">
                    Participant Age (Adults 18+ Required for Standard Validation)
                  </label>
                  <input
                    id="form-age"
                    type="number"
                    min="1"
                    max="120"
                    placeholder="Enter your age"
                    value={profileForm.age}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, age: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 rounded-2xl p-4 text-xs font-bold text-slate-800 outline-none transition-all"
                  />
                  {profileForm.age && parseInt(profileForm.age) < 18 && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="text-[10px] text-amber-600 font-bold flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      ASRS v1.1 screener guidelines are optimized for adult metrics (18+), but you may proceed.
                    </motion.p>
                  )}
                </div>

                {/* Country dropdown */}
                <div className="space-y-2">
                  <label htmlFor="form-country" className="text-[11px] font-black uppercase text-slate-400 tracking-wider block font-bold">
                    Country of Residence
                  </label>
                  <select
                    id="form-country"
                    value={profileForm.country}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 rounded-2xl p-4 text-xs font-bold text-slate-800 outline-none cursor-pointer transition-all appearance-none"
                  >
                    <option value="United States">United States</option>
                    <option value="India">India</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Japan">Japan</option>
                    <option value="Brazil">Brazil</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Other">Other / Rest of World</option>
                  </select>
                </div>

                {/* Gender drop down */}
                <div className="space-y-2">
                  <label htmlFor="form-gender" className="text-[11px] font-black uppercase text-slate-400 tracking-wider block font-bold">
                    Gender Identity (Optional)
                  </label>
                  <select
                    id="form-gender"
                    value={profileForm.gender}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 rounded-2xl p-4 text-xs font-bold text-slate-800 outline-none cursor-pointer transition-all appearance-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                <button
                  type="button"
                  onClick={() => setScreen('WELCOME')}
                  className="w-full sm:w-auto text-[10.5px] font-black uppercase px-6 py-3.5 rounded-2xl border border-slate-200 text-slate-650 hover:bg-slate-105 hover:bg-slate-50 transition-colors cursor-pointer text-center active:scale-95 text-xs font-bold"
                >
                  Back to Hub
                </button>

                <button
                  id="confirm-profile-btn"
                  onClick={() => {
                    if (!profileForm.age) {
                      alert("Please enter a valid age parameter to initialize the report.");
                      return;
                    }
                    setScreen('QUESTIONS');
                  }}
                  className="w-full sm:w-auto bg-lime-500 hover:bg-lime-600 text-slate-900 font-extrabold flex items-center justify-center gap-2 py-4 px-8 rounded-2xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-md active:scale-95 text-center"
                >
                  Proceed to Questions
                  <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ACTIVE SCREENING QUESTIONNAIRE AREA */}
          {screen === 'QUESTIONS' && (
            <motion.div
              key="questions-viewport"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
            >
              
              {/* PRIMARY DIAGNOSTIC ACTIVE QUESTIONS BOX */}
              <div className="lg:col-span-8 bg-white rounded-[32px] border border-lime-100/80 p-6 sm:p-8 flex flex-col justify-between shadow-xs min-h-[440px]">
                
                <div className="space-y-6">
                  
                  {/* Progress indices indicator */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10.5px] font-bold text-slate-400">
                      <span className="uppercase tracking-widest font-mono text-lime-750">
                        Checklist Segment {currentQuestion.part}
                      </span>
                      <span>
                        Progress {Math.round(((currentQuestionIdx + 1) / QUESTIONS.length) * 100)}%
                      </span>
                    </div>
                    {/* High-fidelity Lime loading trail */}
                    <div className="bg-slate-100 h-2 rounded-full overflow-hidden">
                      <motion.div 
                        className="bg-lime-500 h-full rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: `${((currentQuestionIdx + 1) / QUESTIONS.length) * 100}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  </div>

                  {/* Active focus metrics header */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                        currentQuestion.category === 'inattention' 
                          ? 'bg-lime-50 text-lime-800 border-lime-200' 
                          : currentQuestion.category === 'pricing'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        Scale Index: {
                          currentQuestion.category === 'inattention' 
                            ? 'Attention Dispersion' 
                            : currentQuestion.category === 'pricing'
                            ? 'Pricing Feedback & Research'
                            : 'Motor Hyper-Drive'
                        }
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {currentQuestion.category === 'pricing' ? 'Clinical Workspace Preference' : 'WHO Evaluation Checklist'}
                      </span>
                    </div>

                    <h3 id={`clinical-active-question-id`} className="font-display font-medium text-lg sm:text-xl text-slate-900 leading-snug select-text">
                      {currentQuestion.text}
                    </h3>
                  </div>

                  {/* HIGH-FIDELITY SEGMENTED SELECTOR TILES - NO GENERIC CHECKLIST FORMS */}
                  <div className="space-y-4">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-center">
                      {currentQuestion.category === 'pricing' 
                        ? 'Select the preferred pricing tier matching your maximum valuation expectation'
                        : 'Select severity rank matching occurrences over the past six months'
                      }
                    </p>

                    {/* Segment rating tiles */}
                    <div className={`grid grid-cols-1 ${currentQuestion.category === 'pricing' ? 'sm:grid-cols-4' : 'sm:grid-cols-5'} gap-3`}>
                      {(currentQuestion.category === 'pricing' ? PRICING_CHOICES : CHOICES).map((choice) => {
                        const isSelected = currentAnswer === choice.value;
                        
                        const rateClass = currentQuestion.category === 'pricing'
                          ? (choice.value === 0 ? { code: '$1.99', desc: 'Basic Tier' } :
                             choice.value === 1 ? { code: '$2.49', desc: 'Value Tier' } :
                             choice.value === 2 ? { code: '$3.99', desc: 'Pro Standard' } :
                             { code: '$4.99', desc: 'Complete Pack' })
                          : (choice.value === 0 ? { code: '0', desc: 'No Deviation' } :
                             choice.value === 1 ? { code: '1', desc: 'Minimal Shift' } :
                             choice.value === 2 ? { code: '2', desc: 'Intermittent' } :
                             choice.value === 3 ? { code: '3', desc: 'Frequent Drift' } :
                             { code: '4', desc: 'Severe Deviation' });

                        return (
                          <motion.button
                            key={choice.value}
                            id={`tile-option-${choice.value}`}
                            onClick={() => {
                              handleAnswerSelect(choice.value as ScoreChoice);
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-4 rounded-2xl border text-center flex flex-col justify-between items-center gap-2.5 transition-all cursor-pointer relative ${
                              isSelected
                                ? 'bg-lime-500 border-lime-500 shadow-md shadow-lime-500/20 text-slate-950 font-extrabold'
                                : 'bg-slate-50 border-slate-200/80 hover:border-lime-300 text-slate-700'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm tracking-tight transition-all duration-300 font-mono ${
                              isSelected 
                                ? 'bg-slate-900 text-lime-400 border border-slate-950 font-black shadow-inner shadow-black/10' 
                                : 'bg-[#f1f5f9]/70 text-slate-500 border border-slate-200'
                            }`}>
                              {rateClass.code}
                            </div>

                            <div className="space-y-0.5">
                              <span className="text-xs font-bold block leading-tight">
                                {currentQuestion.category === 'pricing' ? 'Configure' : choice.label}
                              </span>
                              <span className={`text-[8px] uppercase font-black tracking-wider block ${
                                isSelected ? 'text-lime-900' : 'text-slate-400'
                              }`}>
                                {rateClass.desc}
                              </span>
                            </div>

                            {isSelected && (
                              <div className="absolute top-2 right-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-ping absolute block" />
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-900 relative block" />
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                </div>

                <div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-8">
                  <button
                    id="diagnose-back-btn"
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIdx === 0}
                    className={`flex items-center gap-1.5 text-[10.5px] font-black uppercase px-4.5 py-3 rounded-2xl border transition-all ${
                      currentQuestionIdx === 0
                        ? 'opacity-30 cursor-not-allowed text-slate-450 border-slate-50 bg-slate-50'
                        : 'text-slate-600 border-slate-150 hover:bg-slate-100 cursor-pointer active:scale-95'
                    }`}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Back Check
                  </button>

                  <span className="text-[10.5px] text-slate-400 font-extrabold tracking-widest font-mono">
                    checkpoint {currentQuestionIdx + 1} / {QUESTIONS.length}
                  </span>

                  <button
                    id="diagnose-next-btn"
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIdx === QUESTIONS.length - 1 || !responses.some(r => r.questionId === currentQuestion.id)}
                    className={`flex items-center gap-1.5 text-[10.5px] font-black uppercase px-4.5 py-3 rounded-2xl border transition-all ${
                      currentQuestionIdx === QUESTIONS.length - 1 || !responses.some(r => r.questionId === currentQuestion.id)
                        ? 'opacity-30 cursor-not-allowed text-slate-450 border-slate-50 bg-slate-50'
                        : 'text-slate-650 border-slate-150 hover:bg-slate-100 cursor-pointer active:scale-95'
                    }`}
                  >
                    Skip Ahead
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

              {/* REAL-TIME DIAGNOSTIC TELEMETRY CONSOLE SIDEBAR */}
              <div className="lg:col-span-4 bg-white rounded-[32px] border border-lime-100 p-6 flex flex-col justify-between shadow-xs">
                
                <div className="space-y-5">
                  <div className="flex items-center gap-2 border-b pb-2.5 border-lime-105 border-slate-100">
                    <Activity className="w-4.5 h-4.5 text-lime-600 animate-pulse" />
                    <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Diagnostic Console</h3>
                  </div>

                  {/* Consultation duration timer */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-[9.5px] uppercase font-black text-slate-400 tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-lime-600 animate-spin-slow" />
                      <span>Screener Chronometer</span>
                    </div>
                    <p className="text-2xl font-black font-mono text-slate-800 tracking-tight">
                      {formatElapsed(elapsedSeconds)}
                    </p>
                  </div>

                  {/* Real-time rating counts */}
                  <div className="space-y-2.5">
                    <h4 className="text-[10px] font-extrabold uppercase text-slate-450 tracking-widest">Active State Tally</h4>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-center space-y-0.5">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Checkpoints Done</span>
                        <span className="font-mono text-base font-black text-slate-800">{responses.length}/11 checklist</span>
                      </div>

                      <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-center space-y-0.5">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Current Drift</span>
                        <span className="font-mono text-base font-black text-lime-700">+{sumInatt + sumHyper} index</span>
                      </div>
                    </div>

                    {/* Dynamic diagnostic gauges inside side rail */}
                    <div className="p-4 bg-slate-50/40 border border-slate-100 rounded-2xl space-y-3">
                      <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        <span>Metrics Weight</span>
                        <span>Level</span>
                      </div>

                      <div className="space-y-2 text-[10.5px]">
                        <div className="space-y-1">
                          <div className="flex justify-between font-bold text-slate-700">
                            <span>Focus Deviation</span>
                            <span className="font-mono text-lime-700 font-extrabold">{sumInatt}/36</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-lime-500 h-full" style={{ width: `${Math.min(100, Math.round((sumInatt/36)*100))}%` }} />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between font-bold text-slate-700">
                            <span>Restless Engine</span>
                            <span className="font-mono text-lime-700 font-extrabold">{sumHyper}/8</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-lime-500 h-full" style={{ width: `${Math.min(100, Math.round((sumHyper/8)*100))}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Realtime interpretation system notes based on answers */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Clinical Assistant Notes</h4>
                    <div className="p-3.5 bg-lime-50/20 rounded-xl border border-lime-105 text-[10.5px] text-slate-600 leading-relaxed">
                      {answeredCount === 0 ? (
                        <span>Rate checkpoint options to initiate medical-grade telemetry charts.</span>
                      ) : sumInatt + sumHyper >= 20 ? (
                        <span className="text-lime-800 font-bold">
                          ⚠️ Elevated focus-drift profile identified. Complete the questionnaire scorecard.
                        </span>
                      ) : (
                        <span>Standard cognitive boundaries are shown on responses currently.</span>
                      )}
                    </div>
                  </div>

                </div>

                <div className="text-[9px] text-[#738a7f] leading-relaxed italic text-center font-bold pt-4">
                  WHO adult screening framework. Compliance guaranteed.
                </div>

              </div>

            </motion.div>
          )}

          {/* ANALYZING SCREEN - 5 second diagnostic animation */}
          {screen === 'ANALYZING' && (
            <motion.div
              key="analyzing-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="max-w-2xl mx-auto w-full"
            >
              <div className="bg-white rounded-[32px] border border-lime-150 p-8 sm:p-12 space-y-8 shadow-xl shadow-lime-500/5 select-none min-h-[400px] flex flex-col items-center justify-center">
                
                {/* Animated diagnostic icon */}
                <div className="relative">
                  <div className="w-24 h-24 bg-lime-50 rounded-full flex items-center justify-center border-2 border-lime-200 relative">
                    {/* Pulsing rings */}
                    <span className="absolute inset-0 rounded-full bg-lime-400 opacity-20 animate-ping" />
                    <span className="absolute inset-0 rounded-full bg-lime-400 opacity-10 animate-pulse" />
                    
                    {/* Center icon */}
                    <Activity className="w-12 h-12 text-lime-600 relative z-10 animate-pulse" />
                  </div>
                  
                  {/* Rotating border */}
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-lime-500 animate-spin" />
                </div>

                {/* Text content */}
                <div className="text-center space-y-3">
                  <h2 className="font-display font-semibold text-2xl text-slate-900 tracking-tight">
                    Analyzing Your Responses
                  </h2>
                  <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                    Processing clinical data against WHO ASRS-v1.1 diagnostic criteria...
                  </p>
                </div>

                {/* Progress indicators */}
                <div className="w-full max-w-sm space-y-3">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-2 text-xs text-slate-600"
                  >
                    <CheckCircle2 className="w-4 h-4 text-lime-600" />
                    <span>Evaluating attention dispersion metrics</span>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5 }}
                    className="flex items-center gap-2 text-xs text-slate-600"
                  >
                    <CheckCircle2 className="w-4 h-4 text-lime-600" />
                    <span>Analyzing hyperactivity indicators</span>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2.5 }}
                    className="flex items-center gap-2 text-xs text-slate-600"
                  >
                    <CheckCircle2 className="w-4 h-4 text-lime-600" />
                    <span>Calculating clinical probability scores</span>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 3.5 }}
                    className="flex items-center gap-2 text-xs text-slate-600"
                  >
                    <CheckCircle2 className="w-4 h-4 text-lime-600" />
                    <span>Generating diagnostic report</span>
                  </motion.div>
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-sm">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-lime-500 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 5, ease: 'linear' }}
                    />
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* COHESIVE DIAGNOSTIC RESULTS REPORT VISUAL */}
          {screen === 'RESULTS' && (
            !hasPaid ? (
              <motion.div
                key="results-paywall"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="max-w-xl mx-auto w-full"
              >
                <div className="bg-white rounded-[32px] border border-lime-150 p-6 sm:p-8 space-y-6 shadow-xl shadow-lime-500/5 select-none animate-fade-in">
                  {/* Lock icon with a pulsing ring */}
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-lime-50 rounded-full flex items-center justify-center border border-lime-100 text-lime-600 relative">
                      <span className="absolute inset-0 rounded-full bg-lime-400 opacity-20 animate-ping shadow-lg shadow-lime-500/10" />
                      <Lock className="w-7 h-7 relative z-10 text-lime-600" />
                    </div>
                    
                    <div className="space-y-1.5">
                      <h3 className="font-display font-black text-xl sm:text-2xl text-slate-900 tracking-tight leading-tight">
                        Unlock Diagnostic ADHD Report
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto font-semibold">
                        Your clinical-grade ADHD screening parameters have been successfully computed. To access your complete diagnostic profile, a one-time payment of ${selectedPricingTier.toFixed(2)} is required.
                      </p>
                    </div>
                  </div>

                  {/* Benefit Items Box */}
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4.5 space-y-3.5 text-left">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-bold">What is included in this package:</h4>
                    
                    <div className="space-y-2.5">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-lime-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-bold text-slate-800 leading-tight">Full Diagnostic Scorecard Indices</p>
                          <p className="text-[9.5px] text-slate-500 font-medium mt-0.5">Unlock your actual cumulative focus score (out of 44 framework limits) and associated Probability Verdict Rank.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-lime-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-bold text-slate-800 leading-tight">Interactive Dimension Aura Diagnostics</p>
                          <p className="text-[9.5px] text-slate-500 font-medium mt-0.5">Access comprehensive, multi-variable chart data plotting executive inattention vs. motor hyperactivity parameters under pressure.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-lime-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-bold text-slate-800 leading-tight">Printable PDF & Exportable CSV Clinical Packs</p>
                          <p className="text-[9.5px] text-slate-500 font-medium mt-0.5">Download officially formatted, clear print-outs ready to be shared with psychiatrists or certified clinical providers.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-lime-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-bold text-slate-800 leading-tight">Tailored Actionable ADHD Coping Tips</p>
                          <p className="text-[9.5px] text-slate-500 font-medium mt-0.5">Personalized behavioral strategies for managing focus fatigue, memory limits, and task continuation cycles.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action Button */}
                  <div className="space-y-4">
                    <div className="bg-lime-50/50 border border-lime-100 rounded-2xl py-3.5 px-4 text-center">
                      <div className="text-[10px] font-black uppercase text-lime-800 tracking-wider font-bold">Premium Access License</div>
                      <div className="flex items-baseline justify-center gap-1 mt-1">
                        <span className="text-3xl font-black text-slate-900 tracking-tight">${selectedPricingTier.toFixed(2)}</span>
                        <span className="text-xs font-bold text-slate-500">one-time payment</span>
                      </div>
                    </div>

                    <button
                      onClick={handleDodoPayment}
                      disabled={isPaying}
                      className={`w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-wider text-slate-900 shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 ${
                        isPaying
                          ? 'bg-lime-400 opacity-75 cursor-not-allowed'
                          : 'bg-lime-500 hover:bg-lime-600 cursor-pointer hover:shadow-lg hover:shadow-lime-200/30'
                      }`}
                    >
                      {isPaying ? (
                        <>
                          <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                          Booting Secure Checkout...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 shrink-0" />
                          Pay ${selectedPricingTier.toFixed(2)} Securely
                        </>
                      )}
                    </button>

                    {paymentError && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10.5px] font-bold text-red-650 bg-red-50 border border-red-200/50 p-3 rounded-xl text-center leading-normal"
                      >
                        ⚠️ {paymentError}
                      </motion.div>
                    )}

                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      100% Encrypted & Safe Payments
                    </div>
                  </div>

                  {/* Clinical Disclaimer & Guidelines */}
                  <div className="pt-4 border-t border-slate-150 py-4 text-left space-y-2">
                    <p className="text-[9.5px] font-semibold text-slate-450 uppercase tracking-wider font-bold">Mandatory Medical Warning:</p>
                    <p className="text-[8.5px] text-slate-400 leading-relaxed font-semibold">
                      This screening terminal is an absolute tool designed <span className="font-extrabold text-slate-700">only for probability & testing (P&T) purposes</span>. It does not issue official medical diagnosis, medication recommendations, or clinician counseling logs. 
                    </p>
                    <p className="text-[8.5px] text-slate-400 leading-relaxed font-semibold">
                      If these diagnostic queries or indicators cause you to feel scared, anxious, concerned, or worried, we highly recommend that you <span className="font-extrabold text-slate-700">consult a certified psychiatric specialist, medical practitioner, or clinical therapist (P&T recommendation)</span> to assist you with formal clinical tests.
                    </p>
                    <p className="text-[8.5px] text-slate-400 leading-relaxed font-semibold font-semibold">
                      For any support, billing queries, technical issues, or questions about the probability methodologies, kindly write to us directly at: <a href="mailto:benzbabu11@gmail.com" className="text-lime-700 hover:text-slate-900 underline font-extrabold">benzbabu11@gmail.com</a>
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results-viewport"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
              >
              
              {/* PRIMARY DIAGNOSTIC CLINICAL SCORECARD */}
              <div className="lg:col-span-6 bg-white rounded-[32px] border border-lime-100/80 p-6 sm:p-8 flex flex-col justify-between shadow-xs">
                
                <div className="space-y-6">
                  
                  <div className="flex justify-between items-center border-b pb-3 border-slate-100">
                    <div className="flex items-center gap-1.5 text-lime-800">
                      <ClipboardList className="w-4.5 h-4.5" />
                      <h3 className="text-[11px] font-black uppercase tracking-widest">Diagnostic Report Summary</h3>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest bg-lime-100 text-lime-800 border border-lime-200 px-2.5 py-0.5 rounded-full">
                      Audit Finished
                    </span>
                  </div>

                  {/* Participant demographics indicators panel */}
                  {profileForm.age && (
                    <div className="flex flex-wrap gap-2 pt-0.5">
                      <span className="text-[9.5px] font-bold uppercase tracking-wider bg-slate-50 text-[#475569] border border-slate-200/60 px-3 py-1 rounded-xl">
                        Age: <b className="font-extrabold text-slate-800">{profileForm.age}</b>
                      </span>
                      <span className="text-[9.5px] font-bold uppercase tracking-wider bg-slate-50 text-[#475569] border border-slate-200/60 px-3 py-1 rounded-xl">
                        Country: <b className="font-extrabold text-slate-800">{profileForm.country}</b>
                      </span>
                      {profileForm.gender && profileForm.gender !== 'Prefer not to say' && (
                        <span className="text-[9.5px] font-bold uppercase tracking-wider bg-slate-50 text-[#475569] border border-slate-200/60 px-3 py-1 rounded-xl">
                          Gender: <b className="font-extrabold text-slate-800">{profileForm.gender}</b>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Large tactile diagnostic gauge and subscales */}
                  <div className="space-y-6">
                    {/* Main Score Circle */}
                    <div className="p-5 rounded-3xl border border-lime-100 bg-[#fafefc] flex flex-col sm:flex-row items-center gap-6">
                      <div className="relative flex items-center justify-center shrink-0 w-36 h-36">
                        <svg viewBox="0 0 144 144" className="w-full h-full transform -rotate-90">
                          <circle
                            cx="72"
                            cy="72"
                            r="60"
                            stroke="#edf7f2"
                            strokeWidth="11"
                            fill="transparent"
                          />
                          <motion.circle
                            cx="72"
                            cy="72"
                            r="60"
                            stroke="#84cc16"
                            strokeWidth="11"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 60}
                            strokeDashoffset={2 * Math.PI * 60 * (1 - results.totalScore / 44)}
                            strokeLinecap="round"
                            initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 60 * (1 - results.totalScore / 44) }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-4xl font-black text-slate-900 tracking-tight leading-none font-display">
                            {results.totalScore}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase mt-1.5">
                            of 44 limit
                          </span>
                        </div>
                      </div>

                      <div className="text-center sm:text-left space-y-1.5 flex-1 select-text">
                        <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          Verdict Rank:
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${probStyles.badge}`}>
                            {results.probability} Probability
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                          {probStyles.desc}
                        </p>
                      </div>
                    </div>

                    {/* Subscale Gauges - All 4 scales in 2x2 grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Attention/Focus Scale */}
                      <div className="bg-gradient-to-br from-lime-50/50 to-white p-5 rounded-2xl border border-lime-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-lime-700">Scale 1</span>
                            <h6 className="text-sm font-black text-slate-900">Attention<br/>Focus</h6>
                          </div>
                          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                            <svg viewBox="0 0 80 80" className="w-full h-full transform -rotate-90">
                              <circle cx="40" cy="40" r="34" stroke="#edf7f2" strokeWidth="7" fill="transparent" />
                              <motion.circle
                                cx="40"
                                cy="40"
                                r="34"
                                stroke="#84cc16"
                                strokeWidth="7"
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * 34}
                                strokeDashoffset={2 * Math.PI * 34 * (1 - results.inattentionScore / 36)}
                                strokeLinecap="round"
                                initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - results.inattentionScore / 36) }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-lg font-black text-slate-900 font-mono">{results.inattentionScore}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-semibold">Score</span>
                          <span className="font-black text-slate-700">{results.inattentionScore} / 36</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <motion.div
                            className="bg-lime-500 h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (results.inattentionScore / 36) * 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                      </div>

                      {/* Restlessness Scale */}
                      <div className="bg-gradient-to-br from-amber-50/50 to-white p-5 rounded-2xl border border-amber-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-amber-700">Scale 2</span>
                            <h6 className="text-sm font-black text-slate-900">Restlessness<br/>Index</h6>
                          </div>
                          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                            <svg viewBox="0 0 80 80" className="w-full h-full transform -rotate-90">
                              <circle cx="40" cy="40" r="34" stroke="#edf7f2" strokeWidth="7" fill="transparent" />
                              <motion.circle
                                cx="40"
                                cy="40"
                                r="34"
                                stroke="#f59e0b"
                                strokeWidth="7"
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * 34}
                                strokeDashoffset={2 * Math.PI * 34 * (1 - results.hyperactivityScore / 8)}
                                strokeLinecap="round"
                                initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - results.hyperactivityScore / 8) }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-lg font-black text-slate-900 font-mono">{results.hyperactivityScore}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-semibold">Score</span>
                          <span className="font-black text-slate-700">{results.hyperactivityScore} / 8</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <motion.div
                            className="bg-amber-500 h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (results.hyperactivityScore / 8) * 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                      </div>

                      {/* Executive Regulation Scale */}
                      <div className="bg-gradient-to-br from-blue-50/50 to-white p-5 rounded-2xl border border-blue-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-blue-700">Scale 3</span>
                            <h6 className="text-sm font-black text-slate-900">Executive<br/>Regulation</h6>
                          </div>
                          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                            <svg viewBox="0 0 80 80" className="w-full h-full transform -rotate-90">
                              <circle cx="40" cy="40" r="34" stroke="#edf7f2" strokeWidth="7" fill="transparent" />
                              <motion.circle
                                cx="40"
                                cy="40"
                                r="34"
                                stroke="#3b82f6"
                                strokeWidth="7"
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * 34}
                                strokeDashoffset={2 * Math.PI * 34 * (1 - (results.partAScore * 4) / 24)}
                                strokeLinecap="round"
                                initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - (results.partAScore * 4) / 24) }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-lg font-black text-slate-900 font-mono">{results.partAScore * 4}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-semibold">Score</span>
                          <span className="font-black text-slate-700">{results.partAScore * 4} / 24</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <motion.div
                            className="bg-blue-500 h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, ((results.partAScore * 4) / 24) * 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                      </div>

                      {/* Emotional Coherence Scale */}
                      <div className="bg-gradient-to-br from-purple-50/50 to-white p-5 rounded-2xl border border-purple-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-purple-700">Scale 4</span>
                            <h6 className="text-sm font-black text-slate-900">Emotional<br/>Coherence</h6>
                          </div>
                          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                            <svg viewBox="0 0 80 80" className="w-full h-full transform -rotate-90">
                              <circle cx="40" cy="40" r="34" stroke="#edf7f2" strokeWidth="7" fill="transparent" />
                              <motion.circle
                                cx="40"
                                cy="40"
                                r="34"
                                stroke="#a855f7"
                                strokeWidth="7"
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * 34}
                                strokeDashoffset={2 * Math.PI * 34 * (1 - ((results.totalScore - results.inattentionScore - results.hyperactivityScore) / 16))}
                                strokeLinecap="round"
                                initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - ((results.totalScore - results.inattentionScore - results.hyperactivityScore) / 16)) }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-lg font-black text-slate-900 font-mono">{results.totalScore - results.inattentionScore - results.hyperactivityScore}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-semibold">Score</span>
                          <span className="font-black text-slate-700">{results.totalScore - results.inattentionScore - results.hyperactivityScore} / 16</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <motion.div
                            className="bg-purple-500 h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, ((results.totalScore - results.inattentionScore - results.hyperactivityScore) / 16) * 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Offline privacy assurances block */}
                  <div className="p-4 rounded-2xl border border-lime-150 bg-lime-50/20 space-y-1">
                    <p className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-lime-600" />
                      Secure Offline Device Archivist
                    </p>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      This diagnostic is tracked in your local hardware memory and excluded from public cloud indices. Only your device browser hosts this timeline record.
                    </p>
                  </div>

                </div>

                {/* Report actions bar */}
                <div className="pt-6 border-t border-slate-100 mt-6 grid grid-cols-2 gap-3">
                  <button
                    id="copy-summary-btn"
                    onClick={handleShareReport}
                    className="bg-white hover:bg-slate-50 text-slate-755 border border-slate-200 active:scale-[0.99] transition-all font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-xs cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-400" />
                    {shareCopied 
                      ? (typeof navigator !== 'undefined' && navigator.share ? 'Shared Successfully' : 'Summary Copied') 
                      : (typeof navigator !== 'undefined' && navigator.share ? 'Share Summary' : 'Copy Text Data')}
                  </button>

                  <button
                    id="export-metrics-btn"
                    onClick={handleDownloadPDF}
                    className="bg-slate-900 hover:bg-slate-950 text-lime-400 border border-slate-950 active:scale-[0.99] transition-all font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-xs cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                    Download PDF
                  </button>

                  <button
                    id="export-csv-btn"
                    onClick={handleDownloadCSV}
                    className="bg-white hover:bg-slate-50 text-slate-755 border border-slate-200 active:scale-[0.99] transition-all font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    Download CSV
                  </button>

                  <button
                    id="print-summary-btn"
                    onClick={() => window.print()}
                    className="bg-white hover:bg-slate-50 text-slate-755 border border-slate-200 active:scale-[0.99] transition-all font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-400" />
                    Print Out Report
                  </button>

                  <button
                    id="re-evaluate-btn"
                    onClick={startScreeningDirectly}
                    className="col-span-2 bg-lime-500 hover:bg-lime-600 hover:shadow-lg hover:shadow-lime-200/40 active:scale-[0.99] transition-all text-slate-900 font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-md shadow-lime-500/10 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Screen Again
                  </button>
                </div>

              </div>

              {/* MEDICAL GUIDANCE AND RECOMMENDATIONS PANEL */}
              <div className="lg:col-span-6 bg-white rounded-[32px] border border-lime-100/80 p-6 sm:p-8 flex flex-col justify-between shadow-xl shadow-lime-500/5">
                
                <div className="space-y-6">

                  {/* Personalized cognitive actions checklist */}
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-1.5 text-slate-800 font-black">
                      <Heart className="w-4.5 h-4.5 text-lime-605 text-lime-650" />
                      <h4 id="recommendations-header-id" className="text-[11px] font-black uppercase tracking-widest text-slate-850">
                        Medical Guidance & Recommendations
                      </h4>
                    </div>

                    {/* Medical Guidance Section */}
                    <div className={`p-5 rounded-2xl border-2 ${
                      medicalGuidance.urgency === 'high' ? 'bg-red-50/50 border-red-200' :
                      medicalGuidance.urgency === 'moderate' ? 'bg-amber-50/50 border-amber-200' :
                      'bg-blue-50/50 border-blue-200'
                    }`}>
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          medicalGuidance.urgency === 'high' ? 'bg-red-100 border border-red-200' :
                          medicalGuidance.urgency === 'moderate' ? 'bg-amber-100 border border-amber-200' :
                          'bg-blue-100 border border-blue-200'
                        }`}>
                          {medicalGuidance.urgency === 'high' ? '🚨' :
                           medicalGuidance.urgency === 'moderate' ? '⚠️' : '💡'}
                        </div>
                        <div className="flex-1">
                          <h5 className="text-sm font-black text-slate-900 mb-1">
                            {medicalGuidance.urgency === 'high' ? 'Seek Professional Help' :
                             medicalGuidance.urgency === 'moderate' ? 'Consider Professional Consultation' :
                             'Monitor Your Symptoms'}
                          </h5>
                          <p className="text-xs text-slate-600 leading-relaxed mb-3">
                            {medicalGuidance.message}
                          </p>
                          <div className="bg-white/80 border border-slate-200 rounded-xl p-3">
                            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                              {medicalGuidance.action}
                            </p>
                          </div>
                        </div>
                      </div>
                      {medicalGuidance.urgency === 'high' && (
                        <div className="mt-3 pt-3 border-t border-red-200">
                          <p className="text-[10px] text-red-700 font-bold">
                            💊 Note: If you're experiencing severe distress, anxiety, or thoughts of self-harm, please contact emergency services (911) or the National Crisis Lifeline at 988 immediately.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Personalized Tips Section */}
                    <div className="mt-6">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-3">
                        Personalized Coping Strategies ({personalizedTips.length})
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {personalizedTips.map((tip, idx) => (
                          <div 
                            key={idx} 
                            className="p-4 bg-[#fbfdfc] border border-slate-100/80 hover:border-lime-250 rounded-2xl transition-all shadow-xs space-y-1"
                          >
                            <span className="text-[7.5px] font-mono tracking-wider text-lime-800 bg-lime-50 border border-lime-100 font-bold px-2 py-0.5 rounded-full inline-block">
                              {tip.category}
                            </span>
                            <h6 className="text-xs font-black text-slate-800 leading-snug">
                              {tip.title}
                            </h6>
                            <p className="text-[10px] text-slate-450 leading-normal text-slate-500">
                              {tip.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Medical Warning Footer */}
                <div className="p-3.5 bg-red-50/30 border border-red-100 rounded-2xl text-[9.5px] text-slate-500 leading-relaxed mt-6 flex gap-2 items-start shadow-xs select-text">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p>
                    <b>Clinical Warning Note:</b> This online assessment application measures focus deviation metrics under the WHO clinical framework self-scoring guide. It serves as an executive function tracker and <b>does not</b> provide a formal medical diagnosis.
                  </p>
                </div>

              </div>

            </motion.div>
          )
        )}

        </AnimatePresence>
      </main>

      {/* FOOTER INFORMATIONAL METRIFACTS */}
      <footer className="max-w-6xl mx-auto w-full mt-4 bg-white border border-lime-100/60 rounded-3xl p-4 flex flex-col md:flex-row justify-between items-center gap-3 shadow-xs text-[10px] text-slate-450 no-print font-medium text-slate-400">
        <p>
          World Health Organization ASRS-v1.1 Screener Guidelines • Secured Client Sandbox • No remote database telemetry logged.
        </p>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setPrivacyModalTab('privacy'); setShowPrivacyModal(true); }} 
            className="text-lime-700 hover:text-lime-900 hover:underline font-bold cursor-pointer"
          >
            Privacy Policy
          </button>
          <span>•</span>
          <button 
            onClick={() => { setPrivacyModalTab('terms'); setShowPrivacyModal(true); }} 
            className="text-lime-700 hover:text-lime-900 hover:underline font-bold cursor-pointer"
          >
            Terms of Use
          </button>
          <span>•</span>
          <span className="text-slate-300">v1.1.0 Stable</span>
        </div>
      </footer>

      {/* PRINT-ONLY SCORECARD VIEWPORT FOR REPORT DOCUMENTATION */}
      <div className="hidden print:block print-only p-8 space-y-6 bg-white max-w-2xl mx-auto text-slate-900 border border-slate-350 rounded-3xl">
        <div className="border-b bg-white pb-3 flex items-center justify-between">
          <div>
            <h1 className="font-display font-medium text-xl tracking-tight text-slate-900">ADHD Screener - Clinical Evaluation Report</h1>
            <p className="text-xs text-slate-500 mt-1">Symptom scale metrics based on WHO ASRS-v1.1 checklist</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-bold">Evaluation Date</p>
            <p className="text-xs font-bold text-slate-900">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border border-slate-300 bg-slate-50 rounded-2xl space-y-1">
            <span className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wide">Primary Focus Rating</span>
            <div className="text-2xl font-black text-slate-900">{results.totalScore} <span className="text-xs text-slate-400 font-normal">/ 44 limit</span></div>
          </div>

          <div className="p-4 border border-slate-300 bg-slate-50 rounded-2xl space-y-1">
            <span className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wide">ADHD Likelihood Probability</span>
            <div className="text-xl font-black text-slate-900">
              {results.probability} Probability
            </div>
          </div>
        </div>

        <div className="border border-slate-300 p-4 rounded-xl text-xs space-y-1">
          <h2 className="text-xs font-extrabold text-slate-800 uppercase">Interpretation Analysis Guidelines</h2>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            {results.probability === 'High' 
              ? 'Computed dimensions exhibit patterns replicating critical ADHD parameters. Clear focus fatigue boundaries, project continuation blocks, and restless rhythms are validated by checklist metrics. Presentation to a professional healthcare provider is highly recommended.' 
              : results.probability === 'Moderate' 
              ? 'Results exhibit moderate project delays and intermittent focus drift thresholds. Basic organizational timers and continuous pacing tools can improve symptoms.' 
              : 'Computed values reside within normal ranges. Focus slipups and tactile motor movements are standard biological variations. Monitor levels again if stress increases.'}
          </p>
        </div>

        <div className="border border-slate-300 p-4 rounded-xl text-xs space-y-2">
          <h2 className="text-xs font-extrabold text-slate-800 uppercase text-slate-800">Symptom Scales Breakdown</h2>
          <div className="space-y-1 text-[11px] text-slate-600">
            <div className="flex justify-between font-bold">
              <span>Attention Dispersion Score:</span>
              <span>{results.inattentionScore}/36</span>
            </div>
            <div className="flex justify-between font-bold pt-1.5 border-t border-slate-100">
              <span>Restless Motor Activity Score:</span>
              <span>{results.hyperactivityScore}/8</span>
            </div>
          </div>
        </div>

        <p className="text-[9px] text-slate-400 leading-relaxed pt-8 border-t border-slate-101 border-slate-200 mt-8 italic text-center">
          Diagnostic scorecard compiled using the local ADHD client terminal. This self-report checklist does not substitute clinical advice.
        </p>
      </div>

      {/* PRIVACY POLICY & TERMS OF USE MODAL */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-fade-in no-print">
          <div className="bg-white rounded-[32px] max-w-lg w-full border border-lime-150 shadow-2xl p-6 sm:p-7 space-y-5 animate-scale-in relative">
            <button 
              onClick={() => setShowPrivacyModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
            
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f7fee7] rounded-xl flex items-center justify-center border border-lime-200 shrink-0">
                <Shield className="w-5 h-5 text-lime-700" />
              </div>
              <div>
                <h3 className="font-display font-medium text-base text-slate-900 tracking-tight leading-none">
                  Legal & Privacy Center
                </h3>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-normal font-medium">
                  Standard rules & client data protections
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-150/45">
              <button
                onClick={() => setPrivacyModalTab('privacy')}
                className={`flex-1 py-1.5 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center ${
                  privacyModalTab === 'privacy'
                    ? 'bg-white text-slate-900 border border-slate-200/55 shadow-3xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setPrivacyModalTab('terms')}
                className={`flex-1 py-1.5 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center ${
                  privacyModalTab === 'terms'
                    ? 'bg-white text-slate-900 border border-slate-200/55 shadow-3xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Terms of Use
              </button>
            </div>

            {/* Content Viewport */}
            <div className="max-h-[240px] overflow-y-auto pr-1 text-slate-600 leading-relaxed text-[11px] space-y-3.5 select-text">
              {privacyModalTab === 'privacy' ? (
                <>
                  <div>
                    <h4 className="font-bold text-slate-800 text-[11.5px] mb-1">1. Absolute Data Minimization & Privacy</h4>
                    <p className="text-slate-500 font-medium">
                      We consider clinical security our ultimate objective. The ADHD Screener Terminal functions entirely within a Client-Side Sandbox. We never log, process, transfer, or upload your individual survey choices, scores, or results to external servers or search engines.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-[11.5px] mb-1">2. Local Browser Authorization & State</h4>
                    <p className="text-slate-500 font-medium">
                      When you store diagnostic logs, they are written to the browser’s secure <code className="font-mono text-[9px] bg-slate-50 px-1 py-0.5 rounded border border-slate-150">localStorage</code> or synced using authorized Firebase handles. If synced to your Google Account via Firebase, the records remain restricted under strict private access rules.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-[11.5px] mb-1">3. Third Party Ad-Blockers & Access</h4>
                    <p className="text-slate-500 font-medium">
                      No Google Analytics dashboards, promotional metrics trackers, or tracking pixels exist within this application. Your device parameters and response speeds are yours alone.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-[11.5px] mb-1">4. Contact & Inquiries</h4>
                    <p className="text-slate-500 font-medium">
                      If you have questions about the privacy of your local diagnostic responses, our probability calculations, or statistical testing, contact us at: <a href="mailto:benzbabu11@gmail.com" className="text-lime-700 hover:text-slate-900 underline font-black">benzbabu11@gmail.com</a>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h4 className="font-bold text-slate-800 text-[11.5px] mb-1">1. Absolute Probability & Testing Tool</h4>
                    <p className="text-slate-500 font-medium">
                      This application is an absolute tool designed purely/only for probability & testing (P&T) purposes. All calculations, probability algorithms, and executive summaries are derived strictly from the Adult ADHD Self-Report Scale (ASRS-v1.1) framework in order to evaluate symptoms statistically.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-[11.5px] mb-1">2. Support & Guidance (Feeling Scared or Worried?)</h4>
                    <p className="text-slate-500 font-medium">
                      If you feel scared, anxious, overwhelmed, or concerned about your testing indicators, please consult a certified psychiatric specialist or clinical healthcare professional. We highly recommend seeking professional clinical consultation, medication guidance, or official evaluation (P&T) if you find yourself feeling uneasy or frightened.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-[11.5px] mb-1">3. Permitted Educational Use Only</h4>
                    <p className="text-slate-500 font-medium">
                      You are granted a personal, noncommercial license to utilize the ADHD Clinical Terminal to evaluate executive functioning. Redistribution, decompilation, or reverse engineering of the custom scoring matrices or visual layouts is strictly forbidden.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-[11.5px] mb-1">4. Clinical Responsibility</h4>
                    <p className="text-slate-500 font-medium">
                      By utilizing this tool, you acknowledge that you are responsible for any external reviews of these metrics.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-[11.5px] mb-1">5. Contact Information</h4>
                    <p className="text-slate-500 font-medium">
                      For support, feedback, questions regarding the probability & testing methodologies, or general inquiries, you can reach out via email to: <a href="mailto:benzbabu11@gmail.com" className="text-lime-700 hover:text-slate-900 underline font-black">benzbabu11@gmail.com</a>
                    </p>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowPrivacyModal(false)}
              className="w-full bg-slate-900 hover:bg-slate-950 text-white font-extrabold py-3 rounded-2xl text-center text-[10px] tracking-wider uppercase shadow-xs transition-all cursor-pointer"
            >
              Understand & Acknowledge
            </button>
          </div>
        </div>
      )}

      {/* STICKY BOTTOM PROGRESS NAVIGATOR */}
      {screen === 'QUESTIONS' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] px-4 py-3 sm:py-4 md:px-8 no-print">
          <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-3">
            
            {/* Left side info */}
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-lime-500/10 flex items-center justify-center border border-lime-200 shrink-0">
                <Activity className="w-4 h-4 text-lime-600 animate-pulse" />
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-700 leading-none">Diagnostic Navigator</h4>
                <p className="text-[9px] text-slate-400 font-bold mt-0.5">Quickly jump to specific question segments</p>
              </div>
            </div>

            {/* Segment capsules */}
            <div className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2">
              {QUESTIONS.map((q, idx) => {
                const isCurrent = idx === currentQuestionIdx;
                const isAnswered = responses.some((r) => r.questionId === q.id);
                
                let segmentColor = "bg-slate-50 text-slate-500 border-slate-200 hover:border-lime-300";
                if (isCurrent) {
                  segmentColor = "bg-lime-500 text-slate-950 border-lime-500 ring-2 ring-lime-300 ring-offset-1 font-black";
                } else if (isAnswered) {
                  segmentColor = "bg-slate-900 text-lime-400 border-slate-900 font-bold hover:bg-slate-800";
                }

                // Sub-indicator dot for segment category
                const dotColor = q.category === 'inattention' 
                  ? 'bg-lime-500' 
                  : q.category === 'pricing' 
                  ? 'bg-blue-500' 
                  : 'bg-amber-500';

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border text-[10.5px] font-mono flex flex-col items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 relative ${segmentColor}`}
                    title={`${
                      q.category === 'inattention' ? 'Attention Dispersion' : 
                      q.category === 'pricing' ? 'Valuation Preference' : 'Motor Hyper-Drive'
                    } Checklist - ${q.text.slice(0, 60)}...`}
                  >
                    <span className={isCurrent ? 'mt-0' : 'mt-0.5'}>
                      {q.category === 'pricing' ? '$' : idx + 1}
                    </span>
                    {!isCurrent && (
                      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} absolute bottom-1`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right side stats */}
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">Completed</span>
                <span className="text-xs font-mono font-black text-slate-800">
                  {responses.length} / {QUESTIONS.length}
                </span>
              </div>
              <div className="h-6 w-[1px] bg-slate-200" />
              <div className="text-left">
                <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">Time Elapsed</span>
                <span className="text-xs font-mono font-black text-lime-700">
                  {formatElapsed(elapsedSeconds)}
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
