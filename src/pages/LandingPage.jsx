import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  const [ageVerified, setAgeVerified] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [ageDay, setAgeDay] = useState('');
  const [ageMonth, setAgeMonth] = useState('');
  const [ageYear, setAgeYear] = useState('');
  const [ageGateError, setAgeGateError] = useState('');
  const [shakeAgeGate, setShakeAgeGate] = useState(false);

  const navigate = useNavigate();
  const dayRef = useRef(null);
  const monthRef = useRef(null);
  const yearRef = useRef(null);

  useEffect(() => {
    // Força limpeza do localStorage se a verificação não foi concluída
    if (localStorage.getItem('age_verified') !== 'true') {
      localStorage.removeItem('age_verified');
    }
  }, []);

  const triggerShakeAgeGate = () => {
    setShakeAgeGate(true);
    setTimeout(() => setShakeAgeGate(false), 400);
  };

  const handleVerifyAge = (e) => {
    e.preventDefault();
    const day = parseInt(ageDay);
    const month = parseInt(ageMonth) - 1;
    const year = parseInt(ageYear);

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      setAgeGateError('Preencha a data de nascimento completa.');
      triggerShakeAgeGate();
      return;
    }

    const birthDate = new Date(year, month, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age >= 18) {
      setAgeVerified(true);
      setAgeGateError('');
      setOnboardingStep(1); // Inicia o onboarding
    } else {
      setAgeGateError('Acesso restrito a maiores de 18 anos.');
      triggerShakeAgeGate();
    }
  };

  if (!ageVerified) {
    return (
      <div className="screen-age-gate">
        <motion.div 
          className={`age-gate-card ${shakeAgeGate ? 'shake' : ''}`}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="age-gate-logo">
            <strong>acervo</strong> bar.
          </div>
          <h3 className="age-gate-title">Verificação de Idade</h3>
          <p className="age-gate-desc">
            Para explorar nosso acervo, por favor, confirme que você possui idade legal para consumir bebidas alcoólicas.
          </p>
          
          <form onSubmit={handleVerifyAge} className="w-full flex flex-col items-center">
            <div className="age-gate-inputs">
              <input 
                ref={dayRef}
                type="text" 
                className="age-input" 
                maxLength={2} 
                placeholder="DD" 
                inputMode="numeric"
                value={ageDay}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setAgeDay(val);
                  if (val.length === 2) {
                    monthRef.current?.focus();
                  }
                }}
                required
              />
              <input 
                ref={monthRef}
                type="text" 
                className="age-input" 
                maxLength={2} 
                placeholder="MM" 
                inputMode="numeric"
                value={ageMonth}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setAgeMonth(val);
                  if (val.length === 2) {
                    yearRef.current?.focus();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !ageMonth) {
                    dayRef.current?.focus();
                  }
                }}
                required
              />
              <input 
                ref={yearRef}
                type="text" 
                className="age-input year" 
                maxLength={4} 
                placeholder="AAAA" 
                inputMode="numeric"
                value={ageYear}
                onChange={(e) => setAgeYear(e.target.value.replace(/[^0-9]/g, ''))}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !ageYear) {
                    monthRef.current?.focus();
                  }
                }}
                required
              />
            </div>
            
            <div className="age-error">{ageGateError}</div>
            
            <button type="submit" className="btn-ghost-link">
              Acessar o Acervo
              <ArrowRight size={16} />
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="screen-onboarding">
      <div className="onboarding-video-container">
        <video 
          className="onboarding-video" 
          src="/Hero/hero.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline
        />
      </div>
      
      <div className="onboarding-content">
        <span className="onboarding-label">experiência premium</span>
        <h1 className="onboarding-title">
          {onboardingStep === 1 ? 'Curadoria exclusiva' : 'Sabor justo por dose'}
        </h1>
        <p className="onboarding-text">
          {onboardingStep === 1 
            ? 'Explore o nosso exclusivo acervo particular de bebidas. Descubra uma seleção de rótulos raros, edições limitadas e destilados artesanais minuciosamente selecionados por uma curadoria experiente, garantindo uma experiência sensorial única, autêntica e inesquecível a cada\u00a0dose.'
            : 'Garrafas abertas em nosso bar contam com descontos dinâmicos calculados em tempo real, variando de acordo com o volume exato de líquido restante na garrafa. Unimos a sofisticação da mixologia de alta coquetelaria a uma política de preços totalmente justa, transparente e\u00a0inovadora.'
          }
        </p>
        
        <div className="onboarding-footer">
          <div className="onboarding-dots">
            <span className={`dot ${onboardingStep === 1 ? 'active' : ''}`} />
            <span className={`dot ${onboardingStep === 2 ? 'active' : ''}`} />
          </div>
          <button 
            className="btn-ghost-link" 
            onClick={() => {
              if (onboardingStep === 1) {
                setOnboardingStep(2);
              } else {
                localStorage.setItem('age_verified', 'true');
                navigate('/');
              }
            }}
          >
            {onboardingStep === 1 ? 'Próximo' : 'Começar a Explorar'}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}