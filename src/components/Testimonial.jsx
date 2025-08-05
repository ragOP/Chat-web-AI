import React, { useState, useEffect } from 'react'

const Testimonial = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials = [
    {
      id: 1,
      quote: "I was juggling bills and didn't think I'd qualify for anything, but MyBenefits AI found me $2,100 in food and medical benefits in literally 60 seconds. The report was awesome, and claiming was a breeze. Now my sister and parents are using it too—total game-changer! 😊",
      name: "Sarah Thompson",
      age: "42",
      location: "Houston, TX",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 2,
      quote: "I'm not tech-savvy, but MyBenefits AI was so easy to use. It instantly showed me debt relief and healthcare benefits I was owed. Best $1 I've ever spent! I claimed everything in minutes, and now my buddies are all on board, claiming their benefits too.",
      name: "Michael Rodriguez",
      age: "58",
      location: "Miami, FL",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 3,
      quote: "Being a single mom, I'm always stretched thin. MyBenefits AI uncovered $1,900 in food assistance I almost missed out on. The report was clear, and the process to claim was super smooth. I've told all my friends, and they're signing up now. Thank you, MyBenefits AI!",
      name: "Emily Carter",
      age: "35",
      location: "Columbus, OH",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 4,
      quote: "Retirement's been tough, but MyBenefits AI found medical benefits I didn't know about in under a minute. It was instant, and the claims were a breeze to submit. My wife and I are so grateful, and we've spread the word to our whole retirement group.",
      name: "James Wilson",
      age: "67",
      location: "Raleigh, NC",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 5,
      quote: "I thought benefits were too complicated, but MyBenefits AI proved me wrong. For just $1, it showed me $1,500 in debt forgiveness and food aid in seconds. The report was awesome, and I claimed it all so fast. My roommates are now using it too—thanks, MyBenefits AI!",
      name: "Jessica Nguyen",
      age: "29",
      location: "San Diego, CA",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
    }
  ]
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <div className="relative">
        {/* Slider Container */}
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {testimonials.map((testimonial, index) => (
              <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                <div className="bg-gray-50 rounded-xl p-6 shadow-sm relative">
                  <div className="absolute -bottom-4 left-8 w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-t-[30px] border-t-gray-50"></div>
                  <p className="text-gray-700 italic text-sm sm:text-base leading-relaxed mb-6">
                    "{testimonial.quote}"
                  </p>
                  
                  <div className="flex items-center space-x-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white shadow-md"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
                      }}
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                        {testimonial.name}
                      </h4>
                      <p className="text-gray-600 text-xs sm:text-sm">
                        {testimonial.age}, {testimonial.location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Dots Navigation */}
        <div className="flex justify-center space-x-2 mt-6">
          {Array.from({ length: testimonials.length }, (_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-[#005e54] scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Testimonial
