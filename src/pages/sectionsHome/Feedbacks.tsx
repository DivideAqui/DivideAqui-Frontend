import { useState, useEffect } from "react";
import "./../../css/homesStyles/Feedbacks.css"
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

interface Feedback {
  id: number;
  name: string;
  date: string;
  rating: number;
  text: string;
  avatar: string;
}

const feedbacksList: Feedback[] = [
  {
    id: 1,
    name: "Jorge Silva",
    date: "5 jan, 2026",
    rating: 5,
    text: '"Usei para dividir uma viagem com amigos e funcionou perfeitamente. Tudo bem organizado."',
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jorge"
  },
  {
    id: 2,
    name: "Maria Santos",
    date: "3 jan, 2026",
    rating: 5,
    text: '"Excelente app! Finalmente tenho controle sobre as despesas compartilhadas."',
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria"
  },
  {
    id: 3,
    name: "João Costa",
    date: "1 jan, 2026",
    rating: 5,
    text: '"Muito útil para casa! Simplifica bastante o controle das contas."',
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao"
  },
  {
    id: 4,
    name: "Ana Paula",
    date: "28 dez, 2025",
    rating: 5,
    text: '"Recomendo! Interface intuitiva e muito fácil de usar."',
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana"
  },
  {
    id: 5,
    name: "Carlos Oliveira",
    date: "25 dez, 2025",
    rating: 5,
    text: '"Perfeito para dividir custos com meus colegas de apartamento!"',
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos"
  },
   {
    id: 6,
    name: "Ana Paula",
    date: "25 dez, 2025",
    rating: 5,
    text: '"Perfeito para dividir custos com meus colegas de apartamento!"',
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana"
  }
];

export function Feedbacks(){
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideWidth, setSlideWidth] = useState(50);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSlideWidth(100);
      } else {
        setSlideWidth(50);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % feedbacksList.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + feedbacksList.length) % feedbacksList.length);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % feedbacksList.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={i < rating ? "star filled" : "star"}>
        ★
      </span>
    ));
  };

  return(
    <section className="sct3" id="homeFeedbacks">
      <div className="feedbacks-container">
        <h2 className="feedbacks-title">Experiência dos nossos <span className="highlight">usuários</span>:</h2>
        
        <div className="carousel-wrapper">
          <button className="carousel-arrow left" onClick={goToPrevious} aria-label="Anterior">
            <FaChevronLeft />
          </button>

          <div className="carousel">
            <div className="carousel-track" style={{ transform: `translateX(-${currentIndex * slideWidth}%)` }}>
              {feedbacksList.map((feedback) => (
                <div key={feedback.id} className="carousel-slide">
                  <div className="feedback-card">
                    <div className="feedback-header">
                      <div className="feedback-user-info">
                        <img src={feedback.avatar} alt={feedback.name} className="feedback-avatar" />
                        <div>
                          <h3 className="feedback-name">{feedback.name}</h3>
                          <p className="feedback-date">{feedback.date}</p>
                        </div>
                      </div>
                      <div className="feedback-rating">
                        {renderStars(feedback.rating)}
                      </div>
                    </div>
                    <p className="feedback-text">{feedback.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="carousel-arrow right" onClick={goToNext} aria-label="Próximo">
            <FaChevronRight />
          </button>
        </div>

        <div className="carousel-dots">
          {feedbacksList.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? "active" : ""}`}
              onClick={() => goToSlide(index)}
              aria-label={`Ir para feedback ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}